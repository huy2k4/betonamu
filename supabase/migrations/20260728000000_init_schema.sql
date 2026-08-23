-- 1. Create tables
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    thumbnail_url TEXT NOT NULL,
    file_url TEXT NOT NULL,
    preview_file_url TEXT NULL,
    file_type VARCHAR(10) DEFAULT 'pdf',
    file_size_bytes BIGINT DEFAULT 0,
    page_count INT DEFAULT 0,
    summary TEXT NOT NULL,
    content_seo TEXT NULL,
    download_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 5.00,
    review_count INT DEFAULT 0,
    is_hot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_tags (
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, tag_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_avatar TEXT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS download_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create updated_at trigger for documents
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_documents_modtime
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 3. Create rating update trigger on reviews
CREATE OR REPLACE FUNCTION update_document_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_doc_id UUID;
    v_avg_rating DECIMAL(3,2);
    v_review_count INT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_doc_id := OLD.document_id;
    ELSE
        v_doc_id := NEW.document_id;
    END IF;

    SELECT COALESCE(AVG(rating), 5.0), COUNT(id)
    INTO v_avg_rating, v_review_count
    FROM reviews
    WHERE document_id = v_doc_id;

    UPDATE documents
    SET avg_rating = v_avg_rating,
        review_count = v_review_count
    WHERE id = v_doc_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_update_document_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_document_rating();

-- 4. Create RPC functions
CREATE OR REPLACE FUNCTION increment_download_count(doc_id UUID, client_ip TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE documents
    SET download_count = download_count + 1
    WHERE id = doc_id;

    INSERT INTO download_logs (document_id, ip_address)
    VALUES (doc_id, client_ip);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_related_documents(target_doc_id UUID, limit_count INT DEFAULT 4)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    slug VARCHAR(255),
    thumbnail_url TEXT,
    file_url TEXT,
    preview_file_url TEXT,
    file_type VARCHAR(10),
    file_size_bytes BIGINT,
    page_count INT,
    summary TEXT,
    content_seo TEXT,
    download_count INT,
    view_count INT,
    avg_rating DECIMAL(3,2),
    review_count INT,
    is_hot BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    matching_tags_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.title,
        d.slug,
        d.thumbnail_url,
        d.file_url,
        d.preview_file_url,
        d.file_type,
        d.file_size_bytes,
        d.page_count,
        d.summary,
        d.content_seo,
        d.download_count,
        d.view_count,
        d.avg_rating,
        d.review_count,
        d.is_hot,
        d.created_at,
        d.updated_at,
        COUNT(dt2.tag_id) AS matching_tags_count
    FROM documents d
    JOIN document_tags dt1 ON dt1.document_id = target_doc_id
    JOIN document_tags dt2 ON dt2.tag_id = dt1.tag_id AND dt2.document_id = d.id
    WHERE d.id <> target_doc_id
    GROUP BY d.id
    ORDER BY matching_tags_count DESC, d.download_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Configure Row Level Security (RLS)
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;

-- 6. Define Policies

-- Tags policies
CREATE POLICY "Allow public read access on tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on tags" ON tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on tags" ON tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on tags" ON tags FOR DELETE TO authenticated USING (true);

-- Documents policies
CREATE POLICY "Allow public read access on documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on documents" ON documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on documents" ON documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on documents" ON documents FOR DELETE TO authenticated USING (true);

-- Document tags policies
CREATE POLICY "Allow public read access on document_tags" ON document_tags FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on document_tags" ON document_tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on document_tags" ON document_tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on document_tags" ON document_tags FOR DELETE TO authenticated USING (true);

-- Reviews policies
CREATE POLICY "Allow public read access on reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert on reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update on reviews" ON reviews FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on reviews" ON reviews FOR DELETE TO authenticated USING (true);

-- Download logs policies (Only readable by authenticated users/admins, writes handled via RPC)
CREATE POLICY "Allow authenticated read on download_logs" ON download_logs FOR SELECT TO authenticated USING (true);
