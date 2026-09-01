import Link from 'next/link';
import { BookOpen, FileText, Headphones, ClipboardList, Home, Bookmark } from 'lucide-react';
import styles from './LeftSidebar.module.css';

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

const CATEGORIES = [
  { label: 'Ebook / PDF', icon: BookOpen, type: 'ebook' },
  { label: 'Từ vựng', icon: FileText, type: 'vocabulary' },
  { label: 'Audio', icon: Headphones, type: 'audio' },
  { label: 'Đề thi', icon: ClipboardList, type: 'exam' },
];

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/', icon: Home },
  { label: 'Tài liệu', href: '/tai-lieu', icon: BookOpen },
  { label: 'Balo của tôi', href: '/account/balo', icon: Bookmark },
];

export default function LeftSidebar() {
  return (
    <nav className={styles.sidebar} aria-label="Điều hướng chính">
      <div className={styles.section}>
        <span className={styles.sectionLabel}>Điều hướng</span>
        <ul className={styles.navList}>
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className={styles.navLink}>
                <Icon size={16} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Cấp độ JLPT</span>
        <div className={styles.chipGroup}>
          {JLPT_LEVELS.map((level) => (
            <Link
              key={level}
              href={`/tai-lieu?level=${level}`}
              className={styles.chip}
            >
              {level}
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Thể loại</span>
        <ul className={styles.navList}>
          {CATEGORIES.map(({ label, icon: Icon, type }) => (
            <li key={type}>
              <Link href={`/tai-lieu?type=${type}`} className={styles.navLink}>
                <Icon size={16} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
