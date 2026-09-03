'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Volume2,
  ArrowRight,
  RotateCw,
  BookOpen,
  LayoutGrid,
  Lock,
} from 'lucide-react';
import styles from './tabs.module.css';

// Mẫu từ vựng cho trải nghiệm flashcard gọn gàng
const SAMPLE_WORDS = [
  { word: '先生', reading: 'せんせい', meaning: 'Giáo viên, thầy cô', hanViet: 'TIÊN SINH', level: 'N5' },
  { word: '勉強', reading: 'べんきょう', meaning: 'Học tập, nghiên cứu', hanViet: 'MIỄN CƯỜNG', level: 'N5' },
  { word: '家族', reading: 'かぞく', meaning: 'Gia đình, người thân', hanViet: 'GIA TỘC', level: 'N5' },
  { word: '約束', reading: 'やくそく', meaning: 'Lời hứa, cuộc hẹn', hanViet: 'ƯỚC THÚC', level: 'N4' },
  { word: '準備', reading: 'じゅんび', meaning: 'Sự chuẩn bị', hanViet: 'CHUẨN BỊ', level: 'N4' },
];

const MINNA_LESSONS = [
  { id: 'bai-1', label: 'Bài 01', sub: 'Chào hỏi & Giới thiệu', count: 32 },
  { id: 'bai-2', label: 'Bài 02', sub: 'Đồ vật & Sở hữu', count: 35 },
  { id: 'bai-3', label: 'Bài 03', sub: 'Nơi chốn & Mua sắm', count: 28 },
  { id: 'bai-4', label: 'Bài 04', sub: 'Thời gian & Thói quen', count: 30 },
  { id: 'bai-5', label: 'Bài 05', sub: 'Di chuyển & Đi lại', count: 34 },
  { id: 'bai-6', label: 'Bài 06', sub: 'Hành động & Ăn uống', count: 31 },
];

const TOPIC_SHORTCUTS = [
  { id: 'dong-vat',  label: 'Động vật',   sub: 'Thú cưng & muông thú', icon: '🐾', count: 45 },
  { id: 'am-thuc',   label: 'Ẩm thực',    sub: 'Món ăn & ẩm thực',     icon: '🍜', count: 68 },
  { id: 'thoi-tiet', label: 'Thời tiết',  sub: 'Bốn mùa & khí hậu',    icon: '🌤️', count: 38 },
  { id: 'gia-dinh',  label: 'Gia đình',   sub: 'Người thân & xưng hô', icon: '👨‍👩‍👧', count: 42 },
  { id: 'cong-viec', label: 'Công việc',  sub: 'Nghề nghiệp & công sở', icon: '💼', count: 55 },
  { id: 'cam-xuc',   label: 'Cảm xúc',    sub: 'Tâm trạng & tính cách', icon: '💭', count: 40 },
];

type DayStatus = 'done' | 'current' | 'locked';

interface DayProgressItem {
  dayNumber: number;
  status: DayStatus;
}

// MOCK DATA: 13 ngày đầu đã hoàn thành (Streak 13 ngày 🔥), Ngày 14 là Hôm nay (Học ngay), Ngày 15 và 16 bị khoá 🔒
const MOCK_DAYS: DayProgressItem[] = [
  ...Array.from({ length: 13 }, (_, i) => ({
    dayNumber: i + 1,
    status: 'done' as DayStatus,
  })),
  { dayNumber: 14, status: 'current' as DayStatus },
  { dayNumber: 15, status: 'locked' as DayStatus },
  { dayNumber: 16, status: 'locked' as DayStatus },
];

function speakText(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export default function VocabTab() {
  const [sampleIdx, setSampleIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Slider refs và kéo thả chuột (Mouse swipe drag)
  const sliderRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Tự động cuộn đến Ngày 14 (Hôm nay) để user nhìn thấy ngay lập tức
  useEffect(() => {
    const timer = setTimeout(() => {
      if (todayRef.current && sliderRef.current) {
        const todayEl = todayRef.current;
        const trackEl = sliderRef.current;
        const targetScroll = todayEl.offsetLeft - trackEl.clientWidth / 2 + todayEl.clientWidth / 2;
        trackEl.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // CHỈ CHO PHÉP KÉO KHI BẤM GIỮ CHUỘT (Mouse drag) HOẶC CHẠM GIỮ (Touch drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.3;
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
    }
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.3;
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
    }
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const currentSample = SAMPLE_WORDS[sampleIdx];

  const handleNextWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlipped(false);
    setSampleIdx((prev) => (prev + 1) % SAMPLE_WORDS.length);
  };

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(currentSample.word);
  };

  return (
    <div className={styles.vocabContainer}>
      {/* 1. SLIDER DAY TRACKER STRIP: Chỉ cho phép quẹt khi nhấn giữ chuột (drag), tắt hoàn toàn hover */}
      <div className={styles.dayTrackerBar}>
        {/* Header: Streak Badge */}
        <div className={styles.dayTrackerHeader}>
          <div className={styles.streakBadge}>
            <span className={styles.flameIcon}>🔥</span>
            <span>Streak 13 Ngày</span>
          </div>
        </div>

        {/* Slider Track (Bấm giữ chuột mới kéo được) */}
        <div className={styles.sliderWrapper}>
          <div
            ref={sliderRef}
            className={styles.daysSliderTrack}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={(e) => {
              // Tắt khả năng cuộn ngang khi chỉ hover chuột
              e.stopPropagation();
            }}
          >
            {MOCK_DAYS.map((item) => {
              if (item.status === 'done') {
                return (
                  <div key={item.dayNumber} className={styles.dayItemDone}>
                    <span className={styles.flameIcon}>🔥</span>
                    <span>Ngày {item.dayNumber}</span>
                  </div>
                );
              }

              if (item.status === 'current') {
                return (
                  <div
                    key={item.dayNumber}
                    ref={todayRef}
                    className={styles.dayItemCurrent}
                  >
                    <span>Ngày {item.dayNumber} (Hôm nay)</span>
                    <Link
                      href="/tu-vung"
                      className={styles.learnNowBtn}
                      onClick={(e) => {
                        if (hasMoved) {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                    >
                      Học ngay →
                    </Link>
                  </div>
                );
              }

              return (
                <div key={item.dayNumber} className={styles.dayItemLocked}>
                  <Lock size={12} className={styles.lockIcon} />
                  <span>Ngày {item.dayNumber}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Link xem lộ trình chi tiết */}
        <Link href="/lo-trinh" className={styles.dayTrackerRight}>
          Chi tiết <ArrowRight size={13} />
        </Link>
      </div>

      {/* 2. BENTO GRID: MINNA (2 CỘT, HÀNG 1) : FLASHCARD (1 CỘT, SPAN 2 HÀNG) / TOPIC (2 CỘT, HÀNG 2) : FLASHCARD */}
      <div className={styles.bentoVocabGrid}>
        {/* ROW 1: Minna no Nihongo (Span 2 columns) */}
        <div className={styles.bentoMinna}>
          <div className={styles.bentoCardHeader}>
            <h3 className={styles.bentoCardTitle}>
              <BookOpen size={18} style={{ color: '#4F46E5' }} />
              Giáo trình Minna no Nihongo (N5)
            </h3>
            <Link href="/tu-vung" className={styles.bentoSeeAllLink}>
              Tất cả 50 bài <ArrowRight size={13} />
            </Link>
          </div>

          <div className={styles.bentoMinnaGrid}>
            {MINNA_LESSONS.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/tu-vung/lesson-N5-${lesson.id}`}
                className={styles.minnaLessonCard}
              >
                <div className={styles.minnaLessonInfo}>
                  <span className={styles.minnaLessonTitle}>{lesson.label}</span>
                  <span className={styles.minnaLessonSub}>{lesson.sub}</span>
                </div>
                <span className={styles.minnaLessonBadge}>{lesson.count} từ</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ROW 2: Chủ đề giao tiếp (Span 2 columns) */}
        <div className={styles.bentoTopic}>
          <div className={styles.bentoCardHeader}>
            <h3 className={styles.bentoCardTitle}>
              <LayoutGrid size={18} style={{ color: '#059669' }} />
              Chủ đề từ vựng đời sống
            </h3>
            <Link href="/tu-vung" className={styles.bentoSeeAllLink} style={{ color: '#059669' }}>
              Tất cả 18 chủ đề <ArrowRight size={13} />
            </Link>
          </div>

          <div className={styles.bentoTopicGrid}>
            {TOPIC_SHORTCUTS.map((t) => (
              <Link
                key={t.id}
                href={`/tu-vung/topic-N5-${t.id}`}
                className={styles.topicItemCard}
              >
                <div className={styles.topicLeftInfo}>
                  <span className={styles.topicItemIcon}>{t.icon}</span>
                  <div className={styles.topicTextGroup}>
                    <span className={styles.topicItemName}>{t.label}</span>
                    <span className={styles.topicItemSub}>{t.sub}</span>
                  </div>
                </div>
                <span className={styles.topicItemBadge}>{t.count} từ</span>
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (Spans Row 1 & Row 2): Trải nghiệm Flashcard tương tác */}
        <div className={styles.bentoFlashcard}>
          <div className={styles.bentoFlashcardHeader}>
            <span className={styles.bentoFlashcardTitle}>
              🎴 Trải nghiệm Flashcard
            </span>
            <span className={styles.bentoFlashcardBadge}>
              JLPT {currentSample.level}
            </span>
          </div>

          <div className={styles.bentoCardWrap}>
            <div
              className={`${styles.bentoFlipCard} ${flipped ? styles.bentoFlipCardFlipped : ''}`}
              onClick={() => setFlipped(!flipped)}
              title="Nhấp để lật thẻ"
            >
              {/* Mặt trước: Kanji & Furigana */}
              <div className={styles.bentoFace}>
                <div className={styles.bentoFaceTop}>
                  <span>Mặt trước (Kanji)</span>
                  <div className={styles.bentoControls}>
                    <button
                      type="button"
                      onClick={handleAudio}
                      className={styles.bentoIconBtn}
                      title="Nghe phát âm"
                    >
                      <Volume2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextWord}
                      className={styles.bentoIconBtn}
                      title="Từ tiếp theo"
                    >
                      <RotateCw size={13} />
                    </button>
                  </div>
                </div>

                <div className={styles.bentoWordCenter}>
                  <div className={styles.bentoKanji}>{currentSample.word}</div>
                  <div className={styles.bentoReading}>【{currentSample.reading}】</div>
                </div>

                <div className={styles.bentoFaceBottom}>
                  💡 Chạm để lật xem nghĩa
                </div>
              </div>

              {/* Mặt sau: Nghĩa & Hán Việt */}
              <div className={`${styles.bentoFace} ${styles.bentoFaceBack}`}>
                <div className={styles.bentoFaceTop}>
                  <span style={{ color: '#059669' }}>Ý nghĩa tiếng Việt</span>
                  <button
                    type="button"
                    onClick={handleNextWord}
                    className={styles.bentoIconBtn}
                    title="Từ tiếp theo"
                  >
                    <RotateCw size={13} />
                  </button>
                </div>

                <div className={styles.bentoWordCenter}>
                  <div className={styles.bentoMeaning}>{currentSample.meaning}</div>
                  <div className={styles.bentoHanViet}>Hán Việt: {currentSample.hanViet}</div>
                </div>

                <div className={styles.bentoFaceBottom} style={{ color: '#6366F1' }}>
                  Chạm để lật lại
                </div>
              </div>
            </div>
          </div>

          <div className={styles.bentoTipBox}>
            💡 <strong>Spaced Repetition:</strong> Hệ thống tự động phân chia từ khó lặp lại vào ngày 15, 16.
          </div>

          <Link href="/tu-vung" className={styles.bentoFlashcardLink}>
            Vào phòng luyện Flashcard <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
