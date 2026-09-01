import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import AdminSidebar from '@/components/AdminSidebar/AdminSidebar';
import styles from '../admin.module.css';

/**
 * Layout cho tất cả trang admin được bảo vệ.
 * Route group (protected) → URL vẫn là /admin/dashboard, /admin/upload,...
 * nhưng /admin/login KHÔNG nằm trong group này → không bị auth guard.
 */
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // Chỉ cho phép email admin (quy ước @betonamu.admin) vào
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
