-- ============================================================
-- Migration #2: User System
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name   TEXT,
    avatar_url     TEXT,
    bio            TEXT,
    balo_count     INT NOT NULL DEFAULT 0,
    download_count INT NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: tự tạo profile khi user đăng ký/đăng nhập OAuth lần đầu
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: updated_at cho profiles
DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- 2. BALO ITEMS (Bookmark)
-- ============================================================
CREATE TABLE IF NOT EXISTS balo_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    note        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_balo_items_user ON balo_items(user_id, created_at DESC);

-- Trigger: cập nhật profiles.balo_count
CREATE OR REPLACE FUNCTION sync_balo_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles SET balo_count = balo_count + 1 WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles SET balo_count = GREATEST(balo_count - 1, 0) WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_balo_count ON balo_items;
CREATE TRIGGER trg_sync_balo_count
    AFTER INSERT OR DELETE ON balo_items
    FOR EACH ROW EXECUTE FUNCTION sync_balo_count();

-- ============================================================
-- 3. REVIEWS (Refactor — drop & recreate)
-- ============================================================

DROP TRIGGER IF EXISTS trg_update_document_rating ON reviews;
DROP TABLE IF EXISTS reviews;

CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating      INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT NOT NULL CHECK (char_length(comment) >= 10),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_document ON reviews(document_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user     ON reviews(user_id);

DROP TRIGGER IF EXISTS update_reviews_modtime ON reviews;
CREATE TRIGGER update_reviews_modtime
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

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

    SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 5.0), COUNT(id)
    INTO v_avg_rating, v_review_count
    FROM reviews
    WHERE document_id = v_doc_id;

    UPDATE documents
    SET avg_rating   = v_avg_rating,
        review_count = v_review_count
    WHERE id = v_doc_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_update_document_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_document_rating();

-- ============================================================
-- 4. SEARCH HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS search_history (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query        TEXT NOT NULL,
    result_count INT NOT NULL DEFAULT 0,
    searched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id, searched_at DESC);

-- Trigger: giữ tối đa 50 bản ghi gần nhất / user
CREATE OR REPLACE FUNCTION limit_search_history()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM search_history
    WHERE user_id = NEW.user_id
      AND id NOT IN (
          SELECT id FROM search_history
          WHERE user_id = NEW.user_id
          ORDER BY searched_at DESC
          LIMIT 50
      );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_limit_search_history ON search_history;
CREATE TRIGGER trg_limit_search_history
    AFTER INSERT ON search_history
    FOR EACH ROW EXECUTE FUNCTION limit_search_history();

-- ============================================================
-- 5. USER DOWNLOADS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_downloads (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id   UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_downloads_user ON user_downloads(user_id, downloaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_downloads_doc  ON user_downloads(document_id);

-- Trigger: cập nhật profiles.download_count
CREATE OR REPLACE FUNCTION sync_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles SET download_count = download_count + 1 WHERE id = NEW.user_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_download_count ON user_downloads;
CREATE TRIGGER trg_sync_download_count
    AFTER INSERT ON user_downloads
    FOR EACH ROW EXECUTE FUNCTION sync_download_count();

-- Thêm user_id vào download_logs (backward compatible)
ALTER TABLE download_logs
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_download_logs_user ON download_logs(user_id);

-- ============================================================
-- 6. LEARNING PATHS (Nền móng — chưa có API sprint này)
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_paths (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    is_public   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_path_items (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    document_id      UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    position         INT NOT NULL DEFAULT 0,
    is_completed     BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at     TIMESTAMPTZ,
    notes            TEXT,
    UNIQUE(learning_path_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_lp_items_path ON learning_path_items(learning_path_id, position);

DROP TRIGGER IF EXISTS update_learning_paths_modtime ON learning_paths;
CREATE TRIGGER update_learning_paths_modtime
    BEFORE UPDATE ON learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE balo_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths      ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. RLS POLICIES: profiles
-- ============================================================
CREATE POLICY "profiles: owner read"
    ON profiles FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = id);

CREATE POLICY "profiles: owner update"
    ON profiles FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

-- ============================================================
-- 9. RLS POLICIES: balo_items
-- ============================================================
CREATE POLICY "balo: owner select"
    ON balo_items FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "balo: owner insert"
    ON balo_items FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "balo: owner delete"
    ON balo_items FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 10. RLS POLICIES: reviews
-- ============================================================
CREATE POLICY "reviews: public read"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "reviews: authenticated insert own"
    ON reviews FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "reviews: owner update"
    ON reviews FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "reviews: owner delete"
    ON reviews FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 11. RLS POLICIES: search_history
-- ============================================================
CREATE POLICY "search_history: owner select"
    ON search_history FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "search_history: owner insert"
    ON search_history FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "search_history: owner delete"
    ON search_history FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 12. RLS POLICIES: user_downloads
-- ============================================================
CREATE POLICY "user_downloads: owner select"
    ON user_downloads FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_downloads: owner insert"
    ON user_downloads FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 13. RLS POLICIES: learning_paths
-- ============================================================
CREATE POLICY "learning_paths: owner select"
    ON learning_paths FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "learning_paths: owner insert"
    ON learning_paths FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "learning_paths: owner update"
    ON learning_paths FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "learning_paths: owner delete"
    ON learning_paths FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 14. RLS POLICIES: learning_path_items
-- ============================================================
CREATE POLICY "lp_items: owner select"
    ON learning_path_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM learning_paths lp
            WHERE lp.id = learning_path_id
              AND lp.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "lp_items: owner insert"
    ON learning_path_items FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM learning_paths lp
            WHERE lp.id = learning_path_id
              AND lp.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "lp_items: owner update"
    ON learning_path_items FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM learning_paths lp
            WHERE lp.id = learning_path_id
              AND lp.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "lp_items: owner delete"
    ON learning_path_items FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM learning_paths lp
            WHERE lp.id = learning_path_id
              AND lp.user_id = (SELECT auth.uid())
        )
    );

-- ============================================================
-- 15. RPC: get_recommendations_for_user
-- ============================================================
CREATE OR REPLACE FUNCTION get_recommendations_for_user(
    target_user_id UUID,
    limit_count    INT DEFAULT 10
)
RETURNS TABLE (
    id             UUID,
    title          TEXT,
    slug           TEXT,
    thumbnail_url  TEXT,
    summary        TEXT,
    download_count INT,
    avg_rating     DECIMAL(3,2),
    score          BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.title::TEXT,
        d.slug::TEXT,
        d.thumbnail_url,
        d.summary::TEXT,
        d.download_count,
        d.avg_rating,
        COUNT(dt2.tag_id)::BIGINT AS score
    FROM documents d
    JOIN document_tags dt2 ON dt2.document_id = d.id
    JOIN document_tags dt1 ON dt1.tag_id = dt2.tag_id
    WHERE dt1.document_id IN (
        SELECT bi.document_id FROM balo_items bi   WHERE bi.user_id = target_user_id
        UNION
        SELECT ud.document_id FROM user_downloads ud WHERE ud.user_id = target_user_id
    )
    AND d.id NOT IN (
        SELECT ud2.document_id FROM user_downloads ud2 WHERE ud2.user_id = target_user_id
    )
    GROUP BY d.id, d.title, d.slug, d.thumbnail_url, d.summary, d.download_count, d.avg_rating
    ORDER BY score DESC, d.download_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
