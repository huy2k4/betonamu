'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import styles from './AdminLogin.module.css';

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

function validate(username: string, password: string): FormErrors {
  const errors: FormErrors = {};
  if (!username.trim()) {
    errors.username = 'Tên đăng nhập không được để trống.';
  } else if (username.length < 3) {
    errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự.';
  }
  if (!password) {
    errors.password = 'Mật khẩu không được để trống.';
  } else if (password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
  }
  return errors;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ username: boolean; password: boolean }>({
    username: false,
    password: false,
  });

  const handleBlur = (field: 'username' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate(username, password);
    setErrors(errs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    const errs = validate(username, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setErrors({});

    // Supabase dùng email để đăng nhập — username admin được lưu dưới dạng email giả
    // Quy ước: username → username@betonamu.admin
    const email = `${username.trim().toLowerCase()}@betonamu.admin`;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setErrors({ general: 'Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.' });
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  };

  return (
    <div className={styles.page}>
      {/* Decorative background */}
      <div className={styles.bgDecor} aria-hidden="true">
        <div className={styles.bgBlob1} />
        <div className={styles.bgBlob2} />
      </div>

      <div className={styles.card}>
        {/* Logo & Header */}
        <div className={styles.header}>
          <div className={styles.logoMark}>
            <Lock size={22} color="#fff" />
          </div>
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>Betonamu — Hệ thống quản trị nội bộ</p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className={styles.alertError} role="alert">
            <AlertCircle size={16} />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          {/* Username */}
          <div className={styles.fieldGroup}>
            <label htmlFor="admin-username" className={styles.label}>
              Tên đăng nhập
            </label>
            <div className={`${styles.inputWrapper} ${touched.username && errors.username ? styles.inputError : ''}`}>
              <User size={16} className={styles.inputIcon} />
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleBlur('username')}
                className={styles.input}
                aria-describedby="username-error"
                aria-invalid={!!(touched.username && errors.username)}
              />
            </div>
            {touched.username && errors.username && (
              <p id="username-error" className={styles.errorMsg}>
                <AlertCircle size={12} /> {errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div className={styles.fieldGroup}>
            <label htmlFor="admin-password" className={styles.label}>
              Mật khẩu
            </label>
            <div className={`${styles.inputWrapper} ${touched.password && errors.password ? styles.inputError : ''}`}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={styles.input}
                aria-describedby="password-error"
                aria-invalid={!!(touched.password && errors.password)}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p id="password-error" className={styles.errorMsg}>
                <AlertCircle size={12} /> {errors.password}
              </p>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className={styles.spinner} /> Đang xác thực...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <p className={styles.footer}>
          Chỉ dành cho quản trị viên được uỷ quyền.
        </p>
      </div>
    </div>
  );
}
