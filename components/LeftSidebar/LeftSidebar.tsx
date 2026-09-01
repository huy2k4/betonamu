'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './LeftSidebar.module.css';

const INTENTS = [
  {
    id: 'explore',
    emoji: '📚',
    label: 'Khám phá tài liệu',
    sub: 'Giáo trình, sách, audio',
  },
  {
    id: 'vocab',
    emoji: '🧠',
    label: 'Ôn luyện từ vựng',
    sub: 'Flashcard, Kanji, N5–N1',
  },
  {
    id: 'exam',
    emoji: '📝',
    label: 'Luyện thi JLPT',
    sub: 'Đề thi các năm, mô phỏng',
  },
  {
    id: 'listen',
    emoji: '🎧',
    label: 'Luyện nghe',
    sub: 'Audio bài học, hội thoại',
  },
  {
    id: 'teach',
    emoji: '👩‍🏫',
    label: 'Soạn giáo án',
    sub: 'Tài liệu cho giáo viên',
  },
  {
    id: 'plan',
    emoji: '🗺️',
    label: 'Xây lộ trình học',
    sub: 'Từ N5 lên N1 theo bước',
  },
];

export default function LeftSidebar() {
  const searchParams = useSearchParams();
  const activeIntent = searchParams.get('intent') ?? 'explore';

  return (
    <nav className={styles.sidebar} aria-label="Mục tiêu học tập">
      <div className={styles.intentHeader}>
        <span className={styles.intentQuestion}>Hôm nay bạn muốn làm gì?</span>
      </div>

      <ul className={styles.intentList}>
        {INTENTS.map(({ id, emoji, label, sub }) => (
          <li key={id}>
            <Link
              href={`/?intent=${id}`}
              className={`${styles.intentItem} ${activeIntent === id ? styles.intentItemActive : ''}`}
            >
              <span className={styles.intentEmoji}>{emoji}</span>
              <span className={styles.intentText}>
                <span className={styles.intentLabel}>{label}</span>
                <span className={styles.intentSub}>{sub}</span>
              </span>
              {activeIntent === id && <span className={styles.intentDot} />}
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.divider} />

      <div className={styles.quickLinks}>
        <span className={styles.quickLinksLabel}>Truy cập nhanh</span>
        <Link href="/tai-lieu" className={styles.quickLink}>Tất cả tài liệu</Link>
        <Link href="/account/balo" className={styles.quickLink}>🎒 Balo của tôi</Link>
      </div>
    </nav>
  );
}
