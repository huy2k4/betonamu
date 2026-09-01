import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register';

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  if (!isOpen) return null;

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(null);
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const normalizeEmail = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.includes('@')) {
      return trimmed.toLowerCase();
    }
    // Quy ước username -> username@betonamu.user
    return `${trimmed.toLowerCase()}@betonamu.user`;
  };

  // Submit Password-based Login / Register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic Validation
    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập hoặc Email');
      return;
    }

    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (mode === 'register') {
      if (!confirmPassword) {
        setErrorMsg('Vui lòng nhập lại mật khẩu xác nhận');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận không trùng khớp');
        return;
      }
    }

    const email = normalizeEmail(username);

    try {
      setLoading(mode);
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác');
          } else {
            setErrorMsg(error.message);
          }
          return;
        }

        setSuccessMsg('Đăng nhập thành công!');
        setTimeout(() => {
          handleClose();
        }, 800);
      } else {
        // Register
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
              display_name: username.trim(),
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        if (data?.user?.identities?.length === 0) {
          setErrorMsg('Tài khoản này đã tồn tại');
          return;
        }

        setSuccessMsg('Đăng ký thành công! Đang tự động đăng nhập...');
        // Tự động sign-in luôn nếu Supabase hỗ trợ
        const { error: autoSignInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!autoSignInErr) {
          setTimeout(() => {
            handleClose();
          }, 1000);
        } else {
          setTimeout(() => {
            setMode('login');
            setSuccessMsg('Đăng ký thành công! Vui lòng đăng nhập.');
          }, 1200);
        }
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setErrorMsg(errorObj?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(null);
    }
  };

  // OAuth Login
  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(provider);
      setErrorMsg(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(`${provider} login error: ${error.message}`);
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setErrorMsg(errorObj?.message || 'Không thể đăng nhập bằng mạng xã hội');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className={styles.scrim} onClick={handleClose} />
      <div className={`${styles.modalContainer} ${isOpen ? styles.open : ''}`}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className={styles.modalContent}>
          <h2 className={styles.title}>
            {mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
          </h2>
          <p className={styles.subtitle}>
            {mode === 'login'
              ? 'Đăng nhập để lưu tài liệu và theo dõi lộ trình học'
              : 'Đăng ký ngay để khám phá kho tài liệu tiếng Nhật'}
          </p>

          {/* Alert Messages */}
          {errorMsg && (
            <div className={styles.alertError}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className={styles.alertSuccess}>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            {/* Field 1: Username / Email */}
            <div className={styles.fieldGroup}>
              <label htmlFor="auth-username" className={styles.label}>
                Tên đăng nhập / Email
              </label>
              <div className={styles.inputWrapper}>
                <User size={16} className={styles.inputIcon} />
                <input
                  id="auth-username"
                  type="text"
                  placeholder="Nhập tên tài khoản hoặc email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.input}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className={styles.fieldGroup}>
              <label htmlFor="auth-password" className={styles.label}>
                Mật khẩu
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Field 3: Confirm Password (Register mode only) */}
            {mode === 'register' && (
              <div className={styles.fieldGroup}>
                <label htmlFor="auth-confirm-password" className={styles.label}>
                  Xác nhận mật khẩu
                </label>
                <div className={styles.inputWrapper}>
                  <Lock size={16} className={styles.inputIcon} />
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu để xác nhận"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.input}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading !== null}
              className={styles.submitBtn}
            >
              {loading === mode ? (
                <>
                  <Loader2 size={16} className={styles.spinnerIcon} />
                  {mode === 'login' ? 'Đang đăng nhập...' : 'Đang tạo tài khoản...'}
                </>
              ) : (
                mode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'
              )}
            </button>
          </form>

          {/* Toggle Mode Link */}
          <div className={styles.toggleRow}>
            {mode === 'login' ? (
              <p className={styles.toggleText}>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  className={styles.toggleLink}
                  onClick={() => toggleMode('register')}
                >
                  Đăng ký ngay
                </button>
              </p>
            ) : (
              <p className={styles.toggleText}>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  className={styles.toggleLink}
                  onClick={() => toggleMode('login')}
                >
                  Đăng nhập ngay
                </button>
              </p>
            )}
          </div>

          {/* Divider */}
          <div className={styles.divider}>
            <span>Hoặc tiếp tục với</span>
          </div>

          {/* OAuth Buttons */}
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={loading !== null}
              className={styles.googleBtn}
            >
              {loading === 'google' ? (
                <div className={styles.spinner}></div>
              ) : (
                <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                  <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                  <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                  <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                </svg>
              )}
              Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('facebook')}
              disabled={loading !== null}
              className={styles.facebookBtn}
            >
              {loading === 'facebook' ? (
                <div className={styles.spinnerWhite}></div>
              ) : (
                <svg className={styles.iconWhite} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              )}
              Facebook
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
