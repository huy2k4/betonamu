/**
 * Admin root layout — chỉ cung cấp wrapper tối giản.
 * Auth check + Sidebar nằm trong app/admin/(protected)/layout.tsx
 * để trang /admin/login không bị kéo vào vòng redirect.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
