import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import AdminSidebar from '@/components/AdminSidebar/AdminSidebar';
import styles from './admin.module.css';

/**
 * Admin layout — đọc x-pathname từ middleware để biết đang ở trang nào.
 * Nếu là /admin/login → render children nguyên (không có auth guard, không sidebar).
 * Mọi route khác → check auth + render sidebar.
 *
 * Cách này tránh dùng route group (protected) gây ra pathname conflict.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';

  // Trang login không cần auth và không có sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Các trang admin còn lại → check quyền
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email?.endsWith('@betonamu.admin')) {
    redirect('/admin/login');
  }

  return (
    <div className={styles.adminShell}>
      <aside className={styles.sidebarArea}>
        <AdminSidebar />
      </aside>
      <main className={styles.contentArea}>
        {children}
      </main>
    </div>
  );
}
