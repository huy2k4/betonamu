-- ============================================================
-- Migration #3: Vocabulary System
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- 1. KANJI TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS kanji (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character       VARCHAR(5) UNIQUE NOT NULL,        -- Chữ hán: 無
    onyomi          TEXT[] NOT NULL DEFAULT '{}',      -- Âm on: ['む','ぶ']
    kunyomi         TEXT[] NOT NULL DEFAULT '{}',      -- Âm kun: ['ない']
    han_viet        VARCHAR(100),                       -- Hán Việt: Vô
    meanings        TEXT[] NOT NULL DEFAULT '{}',      -- Nghĩa: ['vô lý','không']
    mnemonic        TEXT,                               -- Câu chuyện ghi nhớ
    notes           TEXT,                               -- Ghi chú thêm
    jlpt_level      VARCHAR(2) CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
    stroke_count    INT,
    radicals        TEXT[] NOT NULL DEFAULT '{}',      -- Bộ thủ cấu thành
    stroke_order_url TEXT,                             -- Link ảnh thứ tự nét
    frequency       INT,                               -- Rank phổ biến (1-2000)
    tags            TEXT[] NOT NULL DEFAULT '{}',
    examples        TEXT[] NOT NULL DEFAULT '{}',      -- Từ ví dụ: ['無料','無理']
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kanji_jlpt ON kanji(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_kanji_character ON kanji(character);

DROP TRIGGER IF EXISTS update_kanji_modtime ON kanji;
CREATE TRIGGER update_kanji_modtime
    BEFORE UPDATE ON kanji
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- 2. VOCABULARIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS vocabularies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word            VARCHAR(100) NOT NULL,             -- Từ vựng: 無料
    reading         VARCHAR(200) NOT NULL,             -- Furigana: むりょう
    romaji          VARCHAR(200),                      -- Romaji: muryou
    meanings        TEXT[] NOT NULL DEFAULT '{}',      -- Nghĩa: ['miễn phí']
    part_of_speech  TEXT[] NOT NULL DEFAULT '{}',      -- Từ loại: ['Danh từ']
    han_viet        VARCHAR(200),                      -- Hán Việt: Vô Liệu
    jlpt_level      VARCHAR(2) CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
    topic           TEXT[] NOT NULL DEFAULT '{}',      -- Chủ đề: ['Thực vật','Động vật']
    lesson          VARCHAR(100),                      -- Bài: 'Bài 1', 'Bài 2'... (Minna no Nihongo)
    audio_url       TEXT,                              -- URL phát âm (để dành)
    image_url       TEXT,                              -- Hình ảnh minh họa
    difficulty      INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    synonyms        TEXT[] NOT NULL DEFAULT '{}',      -- Từ đồng nghĩa: ['タダ']
    antonyms        TEXT[] NOT NULL DEFAULT '{}',      -- Từ trái nghĩa: ['有料']
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vocab_jlpt    ON vocabularies(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_vocab_lesson  ON vocabularies(lesson);
CREATE INDEX IF NOT EXISTS idx_vocab_topic   ON vocabularies USING GIN(topic);
CREATE INDEX IF NOT EXISTS idx_vocab_word    ON vocabularies(word);

DROP TRIGGER IF EXISTS update_vocabularies_modtime ON vocabularies;
CREATE TRIGGER update_vocabularies_modtime
    BEFORE UPDATE ON vocabularies
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- 3. VOCAB EXAMPLES (1 từ vựng có nhiều câu ví dụ)
-- ============================================================
CREATE TABLE IF NOT EXISTS vocab_examples (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocab_id    UUID NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
    sentence    TEXT NOT NULL,     -- このアプリは無料でダウンロードできます。
    reading     TEXT,              -- このアプリはむりょうで...
    translation TEXT NOT NULL,    -- Ứng dụng này có thể tải xuống miễn phí.
    position    INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_vocab_examples_vocab ON vocab_examples(vocab_id, position);

-- ============================================================
-- 4. VOCAB ↔ KANJI (Many-to-Many)
-- ============================================================
CREATE TABLE IF NOT EXISTS vocab_kanji (
    vocab_id    UUID NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
    kanji_id    UUID NOT NULL REFERENCES kanji(id) ON DELETE CASCADE,
    position    INT NOT NULL DEFAULT 0,  -- thứ tự kanji trong từ
    PRIMARY KEY (vocab_id, kanji_id)
);

CREATE INDEX IF NOT EXISTS idx_vocab_kanji_kanji ON vocab_kanji(kanji_id);

-- ============================================================
-- 5. VOCAB STUDY PLANS (Lộ trình học từ vựng của user)
-- ============================================================
CREATE TABLE IF NOT EXISTS vocab_study_plans (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    jlpt_level  VARCHAR(2) CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_plans_user ON vocab_study_plans(user_id, created_at DESC);

DROP TRIGGER IF EXISTS update_study_plans_modtime ON vocab_study_plans;
CREATE TRIGGER update_study_plans_modtime
    BEFORE UPDATE ON vocab_study_plans
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- 6. VOCAB STUDY PLAN DAYS (Các ngày trong lộ trình)
-- ============================================================
CREATE TABLE IF NOT EXISTS vocab_study_plan_days (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID NOT NULL REFERENCES vocab_study_plans(id) ON DELETE CASCADE,
    day_number      INT NOT NULL,          -- Ngày 1, Ngày 2...
    scheduled_date  DATE,                  -- Ngày dự kiến học
    is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMPTZ,
    UNIQUE(plan_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_plan_days_plan ON vocab_study_plan_days(plan_id, day_number);

-- ============================================================
-- 7. VOCAB STUDY PLAN WORDS (Từ được assign vào từng ngày — kéo thả)
-- ============================================================
CREATE TABLE IF NOT EXISTS vocab_study_plan_words (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id      UUID NOT NULL REFERENCES vocab_study_plan_days(id) ON DELETE CASCADE,
    vocab_id    UUID NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
    position    INT NOT NULL DEFAULT 0,   -- Thứ tự trong ngày (kéo thả)
    UNIQUE(day_id, vocab_id)
);

CREATE INDEX IF NOT EXISTS idx_plan_words_day ON vocab_study_plan_words(day_id, position);

-- ============================================================
-- 8. VOCAB REVIEW LOG (Spaced Repetition tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS vocab_review_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vocab_id    UUID NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
    plan_day_id UUID REFERENCES vocab_study_plan_days(id) ON DELETE SET NULL,
    result      VARCHAR(10) NOT NULL CHECK (result IN ('known','unknown','hard')),
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_log_user   ON vocab_review_log(user_id, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_log_vocab  ON vocab_review_log(vocab_id);

-- ============================================================
-- 9. VOCAB STREAK (Chuỗi học liên tục)
-- ============================================================
CREATE TABLE IF NOT EXISTS vocab_streak (
    user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak  INT NOT NULL DEFAULT 0,
    longest_streak  INT NOT NULL DEFAULT 0,
    last_study_date DATE,
    total_words_learned INT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. ENABLE RLS
-- ============================================================
ALTER TABLE kanji                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabularies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_examples          ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_kanji             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_study_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_study_plan_days   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_study_plan_words  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_review_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_streak            ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. RLS POLICIES — KANJI (public read, authenticated write)
-- ============================================================
CREATE POLICY "kanji: public read"
    ON kanji FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "kanji: authenticated insert"
    ON kanji FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

CREATE POLICY "kanji: authenticated update"
    ON kanji FOR UPDATE
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

CREATE POLICY "kanji: authenticated delete"
    ON kanji FOR DELETE
    TO authenticated
    USING (TRUE);

-- ============================================================
-- 12. RLS POLICIES — VOCABULARIES (public read, authenticated write)
-- ============================================================
CREATE POLICY "vocabularies: public read"
    ON vocabularies FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "vocabularies: authenticated insert"
    ON vocabularies FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

CREATE POLICY "vocabularies: authenticated update"
    ON vocabularies FOR UPDATE
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

CREATE POLICY "vocabularies: authenticated delete"
    ON vocabularies FOR DELETE
    TO authenticated
    USING (TRUE);

-- ============================================================
-- 13. RLS POLICIES — VOCAB_EXAMPLES
-- ============================================================
CREATE POLICY "vocab_examples: public read"
    ON vocab_examples FOR SELECT
    USING (TRUE);

CREATE POLICY "vocab_examples: authenticated write"
    ON vocab_examples FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

CREATE POLICY "vocab_examples: authenticated update"
    ON vocab_examples FOR UPDATE
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

CREATE POLICY "vocab_examples: authenticated delete"
    ON vocab_examples FOR DELETE
    TO authenticated
    USING (TRUE);

-- ============================================================
-- 14. RLS POLICIES — VOCAB_KANJI
-- ============================================================
CREATE POLICY "vocab_kanji: public read"
    ON vocab_kanji FOR SELECT
    USING (TRUE);

CREATE POLICY "vocab_kanji: authenticated write"
    ON vocab_kanji FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

CREATE POLICY "vocab_kanji: authenticated delete"
    ON vocab_kanji FOR DELETE
    TO authenticated
    USING (TRUE);

-- ============================================================
-- 15. RLS POLICIES — STUDY PLANS (owner only)
-- ============================================================
CREATE POLICY "study_plans: owner select"
    ON vocab_study_plans FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "study_plans: owner insert"
    ON vocab_study_plans FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "study_plans: owner update"
    ON vocab_study_plans FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "study_plans: owner delete"
    ON vocab_study_plans FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 16. RLS POLICIES — PLAN DAYS (via plan ownership)
-- ============================================================
CREATE POLICY "plan_days: owner select"
    ON vocab_study_plan_days FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM vocab_study_plans p
            WHERE p.id = plan_id
              AND p.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "plan_days: owner insert"
    ON vocab_study_plan_days FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM vocab_study_plans p
            WHERE p.id = plan_id
              AND p.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "plan_days: owner update"
    ON vocab_study_plan_days FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM vocab_study_plans p
            WHERE p.id = plan_id
              AND p.user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM vocab_study_plans p
            WHERE p.id = plan_id
              AND p.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "plan_days: owner delete"
    ON vocab_study_plan_days FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM vocab_study_plans p
            WHERE p.id = plan_id
              AND p.user_id = (SELECT auth.uid())
        )
    );

-- ============================================================
-- 17. RLS POLICIES — PLAN WORDS (via plan day → plan ownership)
-- ============================================================
CREATE POLICY "plan_words: owner select"
    ON vocab_study_plan_words FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM vocab_study_plan_days d
            JOIN vocab_study_plans p ON p.id = d.plan_id
            WHERE d.id = day_id
              AND p.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "plan_words: owner insert"
    ON vocab_study_plan_words FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM vocab_study_plan_days d
            JOIN vocab_study_plans p ON p.id = d.plan_id
            WHERE d.id = day_id
              AND p.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "plan_words: owner delete"
    ON vocab_study_plan_words FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM vocab_study_plan_days d
            JOIN vocab_study_plans p ON p.id = d.plan_id
            WHERE d.id = day_id
              AND p.user_id = (SELECT auth.uid())
        )
    );

-- ============================================================
-- 18. RLS POLICIES — REVIEW LOG (owner only)
-- ============================================================
CREATE POLICY "review_log: owner select"
    ON vocab_review_log FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "review_log: owner insert"
    ON vocab_review_log FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 19. RLS POLICIES — STREAK (owner only)
-- ============================================================
CREATE POLICY "streak: owner select"
    ON vocab_streak FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "streak: owner upsert"
    ON vocab_streak FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "streak: owner update"
    ON vocab_streak FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 20. GRANT access to anon/authenticated for Data API
-- ============================================================
GRANT SELECT ON kanji                  TO anon, authenticated;
GRANT SELECT ON vocabularies           TO anon, authenticated;
GRANT SELECT ON vocab_examples         TO anon, authenticated;
GRANT SELECT ON vocab_kanji            TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON kanji             TO authenticated;
GRANT INSERT, UPDATE, DELETE ON vocabularies      TO authenticated;
GRANT INSERT, UPDATE, DELETE ON vocab_examples    TO authenticated;
GRANT INSERT, UPDATE, DELETE ON vocab_kanji       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vocab_study_plans       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vocab_study_plan_days   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vocab_study_plan_words  TO authenticated;
GRANT SELECT, INSERT ON vocab_review_log   TO authenticated;
GRANT SELECT, INSERT, UPDATE ON vocab_streak TO authenticated;

-- ============================================================
-- 21. RPC: get_vocab_for_review (Spaced Repetition — lấy từ cần ôn)
-- Trả về từ "unknown"/"hard" của ngày trước để hỏi lại ngày sau
-- ============================================================
CREATE OR REPLACE FUNCTION get_vocab_for_review(
    p_user_id UUID,
    p_plan_day_id UUID
)
RETURNS TABLE (
    vocab_id    UUID,
    word        TEXT,
    reading     TEXT,
    meanings    TEXT[],
    fail_count  BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id,
        v.word::TEXT,
        v.reading::TEXT,
        v.meanings,
        COUNT(rl.id)::BIGINT AS fail_count
    FROM vocab_review_log rl
    JOIN vocabularies v ON v.id = rl.vocab_id
    WHERE rl.user_id = p_user_id
      AND rl.result IN ('unknown', 'hard')
      AND rl.reviewed_at >= NOW() - INTERVAL '7 days'
    GROUP BY v.id, v.word, v.reading, v.meanings
    ORDER BY fail_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- ============================================================
-- 22. RPC: upsert_vocab_streak
-- ============================================================
CREATE OR REPLACE FUNCTION upsert_vocab_streak(
    p_user_id UUID,
    p_words_count INT DEFAULT 0
)
RETURNS VOID AS $$
DECLARE
    v_last_date DATE;
    v_current   INT;
    v_longest   INT;
    v_today     DATE := CURRENT_DATE;
BEGIN
    SELECT last_study_date, current_streak, longest_streak
    INTO v_last_date, v_current, v_longest
    FROM vocab_streak
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        -- Người dùng chưa có streak
        INSERT INTO vocab_streak (user_id, current_streak, longest_streak, last_study_date, total_words_learned)
        VALUES (p_user_id, 1, 1, v_today, p_words_count);
    ELSE
        IF v_last_date = v_today THEN
            -- Đã học hôm nay, chỉ cộng số từ
            UPDATE vocab_streak
            SET total_words_learned = total_words_learned + p_words_count,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        ELSIF v_last_date = v_today - 1 THEN
            -- Học ngày hôm qua → tiếp tục chuỗi
            v_current := v_current + 1;
            v_longest := GREATEST(v_longest, v_current);
            UPDATE vocab_streak
            SET current_streak = v_current,
                longest_streak = v_longest,
                last_study_date = v_today,
                total_words_learned = total_words_learned + p_words_count,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        ELSE
            -- Bỏ ngày → reset chuỗi
            UPDATE vocab_streak
            SET current_streak = 1,
                last_study_date = v_today,
                total_words_learned = total_words_learned + p_words_count,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
