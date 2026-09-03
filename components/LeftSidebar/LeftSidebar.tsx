'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './LeftSidebar.module.css';

const INTENTS = [
  { id: 'explore', emoji: '📚', label: 'Khám phá tài liệu', sub: 'Giáo trình, sách, audio',  href: '/?tab=explore' },
  { id: 'vocab',   emoji: '🧠', label: 'Ôn luyện từ vựng',  sub: 'Flashcard, Minna, N5–N1',  href: '/?tab=vocab' },
  { id: 'plan',    emoji: '🗺️', label: 'Xây lộ trình học', sub: 'Từ N5 lên N1 theo bước',   href: '/?tab=plan' },
  { id: 'exam',    emoji: '📝', label: 'Luyện thi JLPT',    sub: 'Đề thi các năm, mô phỏng', href: '/tai-lieu?type=exam' },
  { id: 'listen',  emoji: '🎧', label: 'Luyện nghe',        sub: 'Audio bài học, hội thoại', href: '/tai-lieu?type=audio' },
  { id: 'teach',   emoji: '👩‍🏫', label: 'Soạn giáo án',  sub: 'Tài liệu cho giáo viên',   href: '/tai-lieu' },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isHome = pathname === '/';
  const currentTab = searchParams.get('tab') || searchParams.get('intent') || 'explore';

  const isActive = (id: string) => {
    if (isHome) {
      return currentTab === id;
    }
    if (id === 'vocab') return pathname.startsWith('/tu-vung') || pathname.startsWith('/lo-trinh');
    return false;
  };

  const handleItemClick = (id: string, e: React.MouseEvent) => {
    // Nếu đang ở trang chủ và là 1 trong 3 tab chính thì đổi tab mượt mà không reload
    if (isHome && ['explore', 'vocab', 'plan'].includes(id)) {
      e.preventDefault();
      window.dispatchEvent(
        new CustomEvent('betonamu:switch-home-tab', { detail: { tabId: id } })
      );
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('tab', id);
      newUrl.searchParams.delete('intent');
      window.history.replaceState({}, '', newUrl.toString());
    }
  };

  return (
    <nav className={styles.sidebar} aria-label="Mục tiêu học tập">
      <div className={styles.intentHeader}>
        <span className={styles.intentQuestion}>Hôm nay bạn muốn làm gì?</span>
      </div>

      <ul className={styles.intentList}>
        {INTENTS.map(({ id, emoji, label, sub, href }) => {
          const active = isActive(id);
          return (
            <li key={id}>
              <Link
                href={href}
                data-intent={id}
                onClick={(e) => handleItemClick(id, e)}
                className={`${styles.intentItem} ${active ? styles.intentItemActive : ''}`}
              >
                <span className={styles.intentEmoji}>{emoji}</span>
                <span className={styles.intentText}>
                  <span className={styles.intentLabel}>{label}</span>
                  <span className={styles.intentSub}>{sub}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className={styles.divider} />

      <div className={styles.quickLinks}>
        <span className={styles.quickLinksLabel}>Truy cập nhanh</span>
        <Link href="/tai-lieu" className={styles.quickLink}>Tất cả tài liệu</Link>
        <Link href="/tu-vung" className={styles.quickLink}>🧠 Học từ vựng</Link>
        <Link href="/lo-trinh" className={styles.quickLink}>🗺️ Lộ trình của tôi</Link>
        <Link href="/account/balo" className={styles.quickLink}>🎒 Balo của tôi</Link>
      </div>
    </nav>
  );
}
