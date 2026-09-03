'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Activity,
  AlertTriangle,
  Languages,
  Type,
  Plus,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import styles from './AdminSidebar.module.css';

const NAV_ITEMS = [
  {
    section: 'Tổng quan',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Thống kê học tập', href: '/admin/dashboard#learning', icon: Activity },
      { label: 'Hệ thống', href: '/admin/dashboard#system', icon: AlertTriangle },
    ],
  },
  {
    section: 'Quản lý nội dung',
    items: [
      { label: 'Tài liệu', href: '/admin/tai-lieu', icon: BookOpen },
      { label: 'Upload tài liệu', href: '/admin/upload', icon: Upload },
      { label: 'Người dùng', href: '/admin/users', icon: Users },
    ],
  },
  {
    section: 'Quản lý Từ vựng',
    items: [
      { label: 'Từ vựng', href: '/admin/tu-vung', icon: Languages },
      { label: 'Thêm từ vựng', href: '/admin/tu-vung/them', icon: Plus },
      { label: 'Kanji', href: '/admin/kanji', icon: Type },
      { label: 'Thêm Kanji', href: '/admin/kanji/them', icon: Plus },
    ],
  },
  {
    section: 'Hệ thống',
    items: [
      { label: 'Cài đặt', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <nav className={styles.sidebar} aria-label="Admin navigation">
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>B</div>
        <div>
          <div className={styles.brandName}>Betonamu</div>
          <div className={styles.brandRole}>Admin Portal</div>
        </div>
      </div>

      {/* Nav Sections */}
      <div className={styles.navBody}>
        {NAV_ITEMS.map((section) => (
          <div key={section.section} className={styles.navSection}>
            <span className={styles.sectionLabel}>{section.section}</span>
            <ul className={styles.navList}>
              {section.items.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className={styles.navFooter}>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </nav>
  );
}
