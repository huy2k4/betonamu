'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import {
  BookOpen,
  LayoutGrid,
  ChevronRight,
  Sparkles,
  Flame,
  Search,
  X,
  Compass,
  GraduationCap,
  CalendarCheck2,
} from 'lucide-react';
import { toCleanSlug } from '@/utils/url';
import styles from './tu-vung.module.css';

type VocabSet = {
  id: string;         // slug để navigate: lesson-N5-bai-1 hoặc topic-N5-dong-vat
  title: string;      // "Bài 1" hoặc "Động vật"
  subtitle: string;
  count: number;
  jlpt: string;
  type: 'lesson' | 'topic';
  icon: string;
};

type StreakData = {
  current_streak: number;
  longest_streak: number;
  total_words_learned: number;
} | null;

const JLPT_TABS = ['N5', 'N4', 'N3', 'N2', 'N1'];

const SYSTEM_TABS = [
  { id: 'lesson', label: 'Theo bài (Minna no Nihongo)', icon: BookOpen },
  { id: 'topic',  label: 'Theo chủ đề đời sống',        icon: LayoutGrid },
];

const TOPICS = [
  { id: 'dong-vat',    label: 'Động vật',    icon: '🐾', topic: 'Động vật' },
  { id: 'thuc-vat',    label: 'Thực vật',    icon: '🌿', topic: 'Thực vật' },
  { id: 'am-thuc',     label: 'Ẩm thực',     icon: '🍜', topic: 'Ẩm thực' },
  { id: 'gia-dinh',    label: 'Gia đình',    icon: '👨‍👩‍👧', topic: 'Gia đình' },
  { id: 'thoi-tiet',   label: 'Thời tiết',   icon: '🌤️', topic: 'Thời tiết' },
  { id: 'mau-sac',     label: 'Màu sắc',     icon: '🎨', topic: 'Màu sắc' },
  { id: 'thoi-gian',   label: 'Thời gian',   icon: '⏰', topic: 'Thời gian' },
  { id: 'co-the',      label: 'Cơ thể',      icon: '🧍', topic: 'Cơ thể' },
  { id: 'quan-ao',     label: 'Quần áo',     icon: '👕', topic: 'Quần áo' },
  { id: 'phuong-tien', label: 'Phương tiện', icon: '🚗', topic: 'Phương tiện' },
  { id: 'giao-duc',    label: 'Giáo dục',    icon: '📚', topic: 'Giáo dục' },
  { id: 'cong-viec',   label: 'Công việc',   icon: '💼', topic: 'Công việc' },
  { id: 'noi-chon',    label: 'Nơi chốn',    icon: '🏢', topic: 'Nơi chốn' },
  { id: 'hanh-dong',   label: 'Hành động',   icon: '⚡', topic: 'Hành động' },
  { id: 'cam-xuc',     label: 'Cảm xúc',     icon: '💭', topic: 'Cảm xúc' },
  { id: 'doi-song',    label: 'Đời sống',    icon: '🌟', topic: 'Đời sống' },
  { id: 'tu-nhien',    label: 'Thiên nhiên', icon: '🌲', topic: 'Thiên nhiên' },
  { id: 'tinh-chat',   label: 'Tính chất',   icon: '✨', topic: 'Tính chất' },
];

export default function TuVungPage() {
  const [activeSystem, setActiveSystem] = useState<'lesson' | 'topic'>('lesson');
  const [activeJlpt, setActiveJlpt] = useState('N5');
  const [sets, setSets] = useState<VocabSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [streak, setStreak] = useState<StreakData>(null);

  // 1. Fetch Streak data cho Widget cá nhân
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/vocab/streak');
        const json = await res.json();
        if (isMounted && json.success) {
          setStreak(json.data);
        }
      } catch {
        // Guest user or offline
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch danh sách bộ từ vựng theo System và JLPT
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeSystem === 'lesson') {
          const res = await fetch(`/api/vocab?jlpt=${activeJlpt}&limit=100`);
          const json = await res.json();
          if (!cancelled && json.success) {
            const lessonMap: Record<string, number> = {};
            for (const v of json.data) {
              const rawLesson = (v.lesson || 'Chưa phân bài').normalize('NFC');
              const numMatch = rawLesson.match(/\d+/);
              const cleanLesson = numMatch ? `Bài ${numMatch[0]}` : rawLesson;
              lessonMap[cleanLesson] = (lessonMap[cleanLesson] || 0) + 1;
            }

            const lessons = Object.keys(lessonMap).sort((a, b) => {
              const aNum = parseInt(a.replace(/[^0-9]/g, '')) || 999;
              const bNum = parseInt(b.replace(/[^0-9]/g, '')) || 999;
              return aNum - bNum;
            });

            setSets(
              lessons.map((lesson) => {
                const numMatch = lesson.match(/\d+/);
                const slugPart = numMatch ? `bai-${numMatch[0]}` : toCleanSlug(lesson);
                return {
                  id: `lesson-${activeJlpt}-${slugPart}`,
                  title: lesson,
                  subtitle: `Giáo trình Minna no Nihongo · ${activeJlpt}`,
                  count: lessonMap[lesson],
                  jlpt: activeJlpt,
                  type: 'lesson',
                  icon: '📖',
                };
              })
            );
          }
        } else {
          const topicCounts: Record<string, number> = {};
          const results = await Promise.all(
            TOPICS.map((t) =>
              fetch(`/api/vocab?jlpt=${activeJlpt}&topic=${encodeURIComponent(t.topic)}&limit=1`)
                .then((r) => r.json())
                .catch(() => ({ pagination: { total: 0 } }))
            )
          );

          TOPICS.forEach((t, i) => {
            topicCounts[t.id] = results[i]?.pagination?.total ?? 0;
          });

          if (!cancelled) {
            setSets(
              TOPICS.filter((t) => topicCounts[t.id] > 0).map((t) => ({
                id: `topic-${activeJlpt}-${t.id}`,
                title: t.label,
                subtitle: `Bộ từ chủ đề · JLPT ${activeJlpt}`,
                count: topicCounts[t.id],
                jlpt: activeJlpt,
                type: 'topic',
                icon: t.icon,
              }))
            );
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [activeSystem, activeJlpt]);

  // 3. Client-side Instant Filter theo ô Search
  const filteredSets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sets;
    return sets.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.subtitle.toLowerCase().includes(query)
    );
  }, [sets, searchQuery]);

  return (
    <div className={styles.container}>
      {/* 1. Global Header */}
      <Header />

      <main className={styles.main}>
        {/* 2. Breadcrumb định vị */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            Trang chủ
          </Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>Học từ vựng</span>
        </nav>

        <div className={styles.pageContent}>
          {/* 3. Hero Learning Hub Banner */}
          <section className={styles.heroBanner} aria-label="Trung tâm học từ vựng">
            <div className={styles.heroLeft}>
              <div className={styles.heroBadge}>
                <Sparkles size={14} />
                Phương pháp Spaced Repetition (Lặp lại ngắt quãng)
              </div>
              <h1 className={styles.heroTitle}>Kho Từ Vựng & Lộ Trình Học</h1>
              <p className={styles.heroDesc}>
                Luyện nhớ từ vựng tiếng Nhật theo bài Minna no Nihongo hoặc theo chủ đề đời sống.
                Hỗ trợ Flashcard lật thẻ, phát âm âm thanh và tự động nhắc lại những từ hay quên.
              </p>
            </div>

            <div className={styles.heroRight}>
              {/* Streak Widget */}
              <div className={styles.streakCard} title="Chuỗi ngày học liên tục">
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

              {/* Nút vào nhanh Lộ trình cá nhân */}
              <Link href="/lo-trinh" className={styles.myPlansBtn}>
                <CalendarCheck2 size={18} />
                Lộ trình của tôi
              </Link>
            </div>
          </section>

          {/* 4. Control Bar: Switcher + Search + JLPT Pills */}
          <div className={styles.controlBar}>
            <div className={styles.controlTopRow}>
              {/* Segmented Switcher */}
              <div className={styles.segmentedGroup} role="tablist">
                {SYSTEM_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeSystem === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveSystem(tab.id as 'lesson' | 'topic')}
                      className={`${styles.segmentBtn} ${isActive ? styles.segmentBtnActive : ''}`}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className={styles.searchWrapper}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder={
                    activeSystem === 'lesson'
                      ? 'Tìm kiếm theo bài (vd: Bài 1, Bài 2...)'
                      : 'Tìm kiếm theo chủ đề (vd: Động vật, Ẩm thực...)'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className={styles.searchClearBtn}
                    title="Xoá tìm kiếm"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* JLPT Level Pills */}
            <div className={styles.jlptRow}>
              <span className={styles.jlptLabel}>Cấp độ JLPT:</span>
              <div className={styles.jlptPills} role="radiogroup">
                {JLPT_TABS.map((level) => {
                  const isActive = activeJlpt === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setActiveJlpt(level)}
                      className={`${styles.jlptPill} ${isActive ? styles[`jlptPillActive${level}`] : ''}`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Section Header with count */}
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>
              {activeSystem === 'lesson' ? (
                <>
                  <GraduationCap size={20} style={{ color: '#4F46E5' }} />
                  Danh sách bài học Minna no Nihongo {activeJlpt}
                </>
              ) : (
                <>
                  <Compass size={20} style={{ color: '#0EA5E9' }} />
                  Chủ đề từ vựng JLPT {activeJlpt}
                </>
              )}
            </h2>
            {!loading && (
              <span className={styles.sectionCountBadge}>
                {filteredSets.length} bộ từ
              </span>
            )}
          </div>

          {/* 6. Sets Grid / Loading / Empty */}
          {loading ? (
            <div className={styles.loadingGrid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : filteredSets.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}>
                <BookOpen size={30} />
              </div>
              <h3 className={styles.emptyTitle}>
                {searchQuery
                  ? `Không tìm thấy bộ từ nào khớp với "${searchQuery}"`
                  : `Chưa có từ vựng cho cấp độ ${activeJlpt}`}
              </h3>
              <p className={styles.emptyDesc}>
                {searchQuery
                  ? 'Vui lòng kiểm tra lại từ khóa hoặc xóa bộ lọc tìm kiếm.'
                  : 'Hãy chọn cấp độ JLPT khác hoặc tạo thêm từ vựng mới trong trang quản trị.'}
              </p>
            </div>
          ) : (
            <div className={styles.setsGrid}>
              {filteredSets.map((set) => (
                <Link
                  key={set.id}
                  href={`/tu-vung/${set.id}`}
                  className={styles.setCard}
                >
                  <div className={styles.setCardTop}>
                    <div className={styles.setCardIcon}>{set.icon}</div>
                    <div className={styles.setCardDetails}>
                      <h3 className={styles.setCardTitle}>{set.title}</h3>
                      <p className={styles.setCardSub}>{set.subtitle}</p>
                    </div>
                  </div>

                  <div className={styles.setCardFooter}>
                    <div className={styles.setCardMeta}>
                      <span className={`${styles.jlptBadge} ${styles[`badge${set.jlpt}`]}`}>
                        {set.jlpt}
                      </span>
                      <span className={styles.wordCountTag}>
                        <BookOpen size={13} />
                        {set.count} từ
                      </span>
                    </div>
                    <span className={styles.setCardAction}>
                      Học ngay <ChevronRight size={15} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 7. Global Footer */}
      <Footer />
    </div>
  );
}
