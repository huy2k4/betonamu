/**
 * KHÔNG SỬ DỤNG — route group (protected) đã bị loại bỏ.
 * Auth guard nằm trong app/admin/layout.tsx dùng x-pathname header từ middleware.
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
