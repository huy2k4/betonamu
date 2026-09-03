'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import {
  Plus,
  BookOpen,
  ChevronRight,
  Loader2,
  Trash2,
  Flame,
  CalendarCheck2,
  Sparkles,
  Trophy,
  Target,
} from 'lucide-react';
import styles from './lo-trinh-list.module.css';

type Plan = {
  id: string;
  title: string;
  jlpt_level: string;
  created_at: string;
  vocab_study_plan_days: {
    is_completed: boolean;
    vocab_study_plan_words: { vocab_id: string }[];
  }[];
};

type Streak = { current_streak: number; total_words_learned: number } | null;

export default function LoTrinhListPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [streak, setStreak] = useState<Streak>(null);
  const [loading, setLoading] = useState(true);
  const [planToDelete, setPlanToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [plansRes, streakRes] = await Promise.all([
          fetch('/api/vocab/study-plan'),
          fetch('/api/vocab/streak'),
        ]);
        const plansJson = await plansRes.json();
        const streakJson = await streakRes.json();
        if (!cancelled) {
          if (plansJson.success) setPlans(plansJson.data ?? []);
          if (streakJson.success) setStreak(streakJson.data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const confirmDelete = async () => {
    if (!planToDelete) return;
    setDeleting(true);
    try {
      await fetch(`/api/vocab/study-plan/${planToDelete.id}`, { method: 'DELETE' });
      setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
      setPlanToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  // Calculations for stats
  const totalPlans = plans.length;
  const totalMasteredWords = plans.reduce((sum, p) => {
    const completedWords = p.vocab_study_plan_days
      .filter((d) => d.is_completed)
      .reduce((s, d) => s + d.vocab_study_plan_words.length, 0);
    return sum + completedWords;
  }, 0);
  const completedPlansCount = plans.filter((p) => {
    const totalDays = p.vocab_study_plan_days.length;
    return totalDays > 0 && p.vocab_study_plan_days.every((d) => d.is_completed);
  }).length;

  return (
    <div className={styles.container}>
      {/* 1. Global Header */}
      <Header />

      <main className={styles.main}>
        {/* 2. Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            Trang chủ
          </Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>Lộ trình của tôi</span>
        </nav>

        <div className={styles.pageContent}>
          {/* 3. Hero Learning Banner */}
          <section className={styles.heroBanner} aria-label="Tổng quan lộ trình">
            <div className={styles.heroLeft}>
              <div className={styles.heroBadge}>
                <Sparkles size={14} />
                Lộ trình học cá nhân hoá
              </div>
              <h1 className={styles.heroTitle}>Kế Hoạch & Tiến Độ Học Tập</h1>
              <p className={styles.heroDesc}>
                Theo dõi từng chặng học từ vựng mỗi ngày. Tự động nhắc nhở ôn tập Spaced Repetition và duy trì chuỗi học liên tục.
              </p>
            </div>

            <div className={styles.heroRight}>
              {/* Streak Card */}
              <div className={styles.streakCard} title="Chuỗi học liên tục">
                <div className={styles.streakIconWrap}>
                  <Flame size={24} />
                </div>
                <div>
                  <div className={styles.streakCount}>
                    {streak ? streak.current_streak : 0} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>ngày</span>
                  </div>
                  <div className={styles.streakLabel}>
                    {streak ? `${streak.total_words_learned} từ đã học` : 'Bắt đầu streak hôm nay!'}
                  </div>
                </div>
              </div>

              {/* Create new plan button */}
              <Link href="/tu-vung" className={styles.newBtn}>
                <Plus size={18} />
                Tạo lộ trình mới
              </Link>
            </div>
          </section>

          {/* 4. Stats Strip (khi có ít nhất 1 lộ trình) */}
          {plans.length > 0 && (
            <div className={styles.statsStrip}>
              <div className={styles.statItem}>
                <div className={styles.statIconWrap} style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                  <CalendarCheck2 size={24} />
                </div>
                <div>
                  <div className={styles.statItemValue}>{totalPlans}</div>
                  <div className={styles.statItemLabel}>Lộ trình đang thực hiện</div>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIconWrap} style={{ background: '#ECFDF5', color: '#10B981' }}>
                  <Target size={24} />
                </div>
                <div>
                  <div className={styles.statItemValue}>{totalMasteredWords}</div>
                  <div className={styles.statItemLabel}>Từ vựng đã hoàn thành</div>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIconWrap} style={{ background: '#FEFCE8', color: '#CA8A04' }}>
                  <Trophy size={24} />
                </div>
                <div>
                  <div className={styles.statItemValue}>{completedPlansCount}</div>
                  <div className={styles.statItemLabel}>Lộ trình hoàn tất 100%</div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Section Header */}
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>
              <BookOpen size={20} style={{ color: '#4F46E5' }} />
              Danh sách lộ trình học
            </h2>
            {!loading && (
              <span className={styles.sectionBadge}>
                {plans.length} lộ trình
              </span>
            )}
          </div>

          {/* 6. Content / Loading / Empty State */}
          {loading ? (
            <div className={styles.loadingPage}>
              <Loader2 size={36} className={styles.spinner} />
            </div>
          ) : plans.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}>
                <BookOpen size={36} />
              </div>
              <h3 className={styles.emptyTitle}>Bạn chưa có lộ trình học nào</h3>
              <p className={styles.emptyDesc}>
                Hãy chọn một bài học Minna no Nihongo hoặc chủ đề yêu thích từ Kho Từ Vựng để phân chia ngày học và bắt đầu nhé!
              </p>
              <Link href="/tu-vung" className={styles.newBtn}>
                <Plus size={18} /> Khám phá Kho Từ Vựng
              </Link>
            </div>
          ) : (
            <div className={styles.planGrid}>
              {plans.map((plan) => {
                const totalDays = plan.vocab_study_plan_days.length;
                const completedDays = plan.vocab_study_plan_days.filter((d) => d.is_completed).length;
                const totalWords = plan.vocab_study_plan_days.reduce(
                  (sum, d) => sum + d.vocab_study_plan_words.length,
                  0
                );
                const pct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

                return (
                  <div key={plan.id} className={styles.planCard}>
                    <div>
                      <div className={styles.planCardTop}>
                        <div>
                          <h3 className={styles.planTitle}>{plan.title}</h3>
                          <div className={styles.planMeta}>
                            {plan.jlpt_level && (
                              <span className={`${styles.jlptBadge} ${styles[`badge${plan.jlpt_level}`]}`}>
                                {plan.jlpt_level}
                              </span>
                            )}
                            <span className={styles.planMetaText}>
                              {totalWords} từ · {totalDays} ngày học
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPlanToDelete({ id: plan.id, title: plan.title })}
                          className={styles.deleteBtn}
                          title="Xoá lộ trình này"
                          aria-label="Xoá lộ trình"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className={styles.progressSection}>
                        <div className={styles.progressWrap}>
                          <span className={styles.progressLabel}>
                            {completedDays}/{totalDays} ngày hoàn thành
                          </span>
                          <span className={styles.progressPct}>{pct}%</span>
                        </div>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>

                    <Link href={`/lo-trinh/${plan.id}`} className={styles.planLink}>
                      <span>
                        {pct === 0 ? 'Bắt đầu học ngay' : pct === 100 ? 'Ôn tập lại lộ trình' : 'Tiếp tục ngày học'}
                      </span>
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 7. Delete Confirmation Modal */}
      {planToDelete && (
        <div className={styles.modalOverlay} onClick={() => setPlanToDelete(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Xoá lộ trình học?</h3>
            <p className={styles.modalDesc}>
              Bạn có chắc chắn muốn xoá lộ trình <strong>&quot;{planToDelete.title}&quot;</strong>? 
              Toàn bộ tiến độ và nhật ký ngày học của lộ trình này sẽ bị xoá và không thể khôi phục.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className={styles.modalCancelBtn}
                disabled={deleting}
              >
                Huỷ bỏ
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className={styles.modalDeleteBtn}
                disabled={deleting}
              >
                {deleting ? 'Đang xoá...' : 'Xác nhận xoá'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Global Footer */}
      <Footer />
    </div>
  );
}
