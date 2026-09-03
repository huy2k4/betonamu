'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  BookOpen,
  Play,
  Flame,
  Target,
  Loader2,
  Calendar,
  Lock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import styles from './lo-trinh.module.css';

type PlanDay = {
  id: string;
  day_number: number;
  scheduled_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  vocab_study_plan_words: {
    position: number;
    vocabularies: { id: string; word: string; reading: string; meanings: string[] } | null;
  }[];
};

type Plan = {
  id: string;
  title: string;
  jlpt_level: string;
  description: string | null;
  created_at: string;
  vocab_study_plan_days: PlanDay[];
};

type Streak = { current_streak: number; longest_streak: number; total_words_learned: number } | null;

export default function LoTrinhPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [streak, setStreak] = useState<Streak>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [planRes, streakRes] = await Promise.all([
        fetch(`/api/vocab/study-plan/${planId}`),
        fetch('/api/vocab/streak'),
      ]);
      const planJson = await planRes.json();
      const streakJson = await streakRes.json();
      if (planJson.success) setPlan(planJson.data);
      if (streakJson.success) setStreak(streakJson.data);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.loadingPage}>
            <Loader2 size={36} className={styles.spinner} />
            <p style={{ color: 'var(--text-secondary)' }}>Đang tải thông tin lộ trình...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.loadingPage}>
            <p style={{ color: 'var(--text-secondary)' }}>Không tìm thấy lộ trình học này.</p>
            <Link href="/lo-trinh" className={styles.studyBtn}>
              ← Quay lại danh sách lộ trình
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const days = [...plan.vocab_study_plan_days].sort((a, b) => a.day_number - b.day_number);
  const completedDays = days.filter((d) => d.is_completed).length;
  const totalWords = days.reduce((sum, d) => sum + d.vocab_study_plan_words.length, 0);
  const progressPct = days.length > 0 ? Math.round((completedDays / days.length) * 100) : 0;

  // First uncompleted day for header quick action
  const currentActiveDay = days.find((d) => !d.is_completed);

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
          <Link href="/lo-trinh" className={styles.breadcrumbLink}>
            Lộ trình của tôi
          </Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{plan.title}</span>
        </nav>

        <div className={styles.page}>
          {/* 3. Header Card */}
          <div className={styles.headerCard}>
            <div className={styles.headerLeft}>
              <Link href="/lo-trinh" className={styles.backBtn} title="Quay lại danh sách lộ trình">
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className={styles.title}>{plan.title}</h1>
                <div className={styles.headerMeta}>
                  {plan.jlpt_level && (
                    <span className={`${styles.jlptBadge} ${styles[`badge${plan.jlpt_level}`]}`}>
                      {plan.jlpt_level}
                    </span>
                  )}
                  <span className={styles.metaText}>
                    {totalWords} từ vựng · {days.length} ngày học · Hoàn thành {completedDays}/{days.length} ngày
                  </span>
                </div>
              </div>
            </div>

            {currentActiveDay ? (
              <Link
                href={`/lo-trinh/${planId}/${currentActiveDay.day_number}/flashcard`}
                className={styles.continueHeaderBtn}
              >
                <Play size={16} />
                Tiếp tục Ngày {currentActiveDay.day_number}
              </Link>
            ) : (
              <span className={styles.completedBadge} style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                🎉 Đã hoàn thành 100%
              </span>
            )}
          </div>

          {/* 4. Stats Row */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIconWrap} style={{ background: '#FFF7ED', color: '#F97316' }}>
                <Flame size={22} />
              </div>
              <div>
                <div className={styles.statNum}>{streak ? streak.current_streak : 0}</div>
                <div className={styles.statLabel}>Chuỗi hiện tại (ngày)</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconWrap} style={{ background: '#EEF2FF', color: '#6366F1' }}>
                <Target size={22} />
              </div>
              <div>
                <div className={styles.statNum}>{streak ? streak.longest_streak : 0}</div>
                <div className={styles.statLabel}>Chuỗi kỷ lục (ngày)</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconWrap} style={{ background: '#ECFDF5', color: '#10B981' }}>
                <BookOpen size={22} />
              </div>
              <div>
                <div className={styles.statNum}>{streak ? streak.total_words_learned : 0}</div>
                <div className={styles.statLabel}>Từ đã tích luỹ</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconWrap} style={{ background: '#F0FDF4', color: '#059669' }}>
                <Calendar size={22} />
              </div>
              <div>
                <div className={styles.statNum}>
                  {completedDays}/{days.length}
                </div>
                <div className={styles.statLabel}>Ngày hoàn thành</div>
              </div>
            </div>
          </div>

          {/* 5. Overall Progress Card */}
          <div className={styles.progressCard}>
            <div className={styles.progressLabelRow}>
              <span className={styles.progressTitle}>Tiến độ hoàn thành lộ trình</span>
              <span className={styles.progressPctText}>{progressPct}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* 6. Interactive Learning Roadmap Timeline */}
          <div className={styles.timelineTitleRow}>
            <h2 className={styles.timelineTitle}>
              <Sparkles size={20} style={{ color: '#4F46E5' }} />
              Con đường học tập (Roadmap)
            </h2>
          </div>

          <div className={styles.daysList}>
            {days.map((day, idx) => {
              const wordCount = day.vocab_study_plan_words.length;
              const prevCompleted = idx === 0 || days[idx - 1].is_completed;
              const isCurrent = prevCompleted && !day.is_completed;
              const isLocked = !prevCompleted && !day.is_completed;
              const isLast = idx === days.length - 1;

              const words = [...day.vocab_study_plan_words]
                .sort((a, b) => a.position - b.position)
                .map((pw) => pw.vocabularies)
                .filter(Boolean);

              return (
                <div key={day.id} className={styles.dayCard}>
                  {/* Timeline Left Node + Connector */}
                  <div className={styles.dayCardLeft}>
                    <div
                      className={`${styles.dayNode} ${
                        day.is_completed
                          ? styles.dayNodeCompleted
                          : isCurrent
                          ? styles.dayNodeCurrent
                          : styles.dayNodeLocked
                      }`}
                    >
                      {day.is_completed ? (
                        <CheckCircle size={20} />
                      ) : isCurrent ? (
                        <Play size={18} />
                      ) : (
                        <Lock size={16} />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`${styles.timelineConnector} ${
                          day.is_completed ? styles.timelineConnectorActive : ''
                        }`}
                      />
                    )}
                  </div>

                  {/* Day Card Body */}
                  <div
                    className={`${styles.dayCardBody} ${
                      isCurrent ? styles.dayCardBodyCurrent : ''
                    }`}
                  >
                    <div className={styles.dayCardHeader}>
                      <div className={styles.dayTitleWrap}>
                        <h3 className={styles.dayTitle}>Ngày {day.day_number}</h3>
                        <span className={styles.wordCountBadge}>{wordCount} từ</span>
                      </div>

                      {day.is_completed ? (
                        <span className={styles.completedBadge}>
                          <CheckCircle size={14} /> Đã hoàn thành
                        </span>
                      ) : isCurrent ? (
                        <span className={styles.currentBadge}>
                          <Play size={12} /> Đang học
                        </span>
                      ) : (
                        <span className={styles.lockedMsg}>
                          <Clock size={13} /> Chưa mở
                        </span>
                      )}
                    </div>

                    {/* Word Preview Chips */}
                    <div className={styles.wordPreview}>
                      {words.slice(0, 10).map(
                        (w) =>
                          w && (
                            <span
                              key={w.id}
                              className={styles.wordChip}
                              title={`${w.reading ? `[${w.reading}] ` : ''}${w.meanings[0] || ''}`}
                            >
                              {w.word}
                            </span>
                          )
                      )}
                      {words.length > 10 && (
                        <span className={styles.moreWords}>+{words.length - 10} từ nữa</span>
                      )}
                    </div>

                    {/* Action button */}
                    <div className={styles.dayActions}>
                      {day.is_completed ? (
                        <Link
                          href={`/lo-trinh/${planId}/${day.day_number}/flashcard`}
                          className={styles.reviewBtn}
                        >
                          <RotateCcw size={14} /> Ôn tập lại Flashcard
                        </Link>
                      ) : isCurrent ? (
                        <Link
                          href={`/lo-trinh/${planId}/${day.day_number}/flashcard`}
                          className={styles.studyBtn}
                        >
                          <Play size={16} /> Bắt đầu học Flashcard
                        </Link>
                      ) : (
                        <span className={styles.lockedMsg}>
                          <Lock size={14} /> Hoàn thành Ngày {day.day_number - 1} để mở khoá
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 7. Global Footer */}
      <Footer />
    </div>
  );
}
