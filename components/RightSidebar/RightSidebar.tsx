import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import styles from './RightSidebar.module.css';

const FEATURED_ARTICLES = [
  {
    id: 1,
    title: 'Những lưu ý khi đi làm tại Nhật Bản',
    category: 'Văn hóa',
    readTime: '5 phút',
  },
  {
    id: 2,
    title: 'Sự khác biệt giữa keigo (kính ngữ) N4 và N3',
    category: 'Ngữ pháp',
    readTime: '8 phút',
  },
  {
    id: 3,
    title: 'Bí quyết học kanji hiệu quả cho người mới bắt đầu',
    category: 'Học thuật',
    readTime: '6 phút',
  },
  {
    id: 4,
    title: 'Top 5 ứng dụng học tiếng Nhật tốt nhất 2025',
    category: 'Công cụ',
    readTime: '4 phút',
  },
  {
    id: 5,
    title: 'Cách đọc thời khóa biểu và hóa đơn tiếng Nhật',
    category: 'Thực tế',
    readTime: '7 phút',
  },
];

export default function RightSidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Bài viết nổi bật">
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>✨ Bài viết nổi bật</span>
        </div>
        <ul className={styles.articleList}>
          {FEATURED_ARTICLES.map((article) => (
            <li key={article.id}>
              {/* href placeholder — tính năng bài viết chưa phát triển */}
              <Link href="#" className={styles.articleItem}>
                <div className={styles.articleMeta}>
                  <span className={styles.articleCategory}>{article.category}</span>
                  <span className={styles.articleReadTime}>{article.readTime}</span>
                </div>
                <p className={styles.articleTitle}>{article.title}</p>
                <ChevronRight size={14} className={styles.articleArrow} />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.divider} />

      {/* Placeholder CTA đăng ký */}
      <div className={styles.ctaBox}>
        <p className={styles.ctaText}>📬 Nhận tài liệu mới mỗi tuần</p>
        <p className={styles.ctaSubtext}>Đăng nhập để lưu tài liệu và theo dõi lộ trình học của bạn.</p>
        <Link href="#" className={styles.ctaBtn}>Đăng nhập / Đăng ký</Link>
      </div>
    </aside>
  );
}
