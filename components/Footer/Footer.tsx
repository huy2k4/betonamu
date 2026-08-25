import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';
import styles from './Footer.module.css';

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={`${styles.footer} ${className || ''}`}>
      <div className={styles.container}>
        
        {/* Column 1: Brand & About */}
        <div className={styles.logoSection}>
          <Link href="/">
            <Image 
              src="/assets/betonamu_logo.png" 
              alt="Betonamu Logo" 
              width={140} 
              height={46} 
              className={styles.logoImage}
            />
          </Link>
          <p className={styles.description}>
            Betonamu là nền tảng cung cấp tài liệu học tiếng Nhật miễn phí, chất lượng cao, giúp bạn chinh phục JLPT và cải thiện kỹ năng giao tiếp một cách dễ dàng.
          </p>
          <div className={styles.socialRow}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://instagram.com/hanasynex/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Youtube">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className={styles.columnTitle}>Liên kết nhanh</h3>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}><Link href="/">Trang chủ</Link></li>
            <li className={styles.linkItem}><Link href="/tai-lieu">Tài liệu miễn phí</Link></li>
            <li className={styles.linkItem}><Link href="#">Học từ vựng</Link></li>
            <li className={styles.linkItem}><Link href="#">Luyện thi JLPT</Link></li>
            <li className={styles.linkItem}><Link href="#">Góc văn hóa</Link></li>
          </ul>
        </div>

        {/* Column 3: Hỗ trợ */}
        <div>
          <h3 className={styles.columnTitle}>Hỗ trợ học viên</h3>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}><Link href="#">Hướng dẫn tải tài liệu</Link></li>
            <li className={styles.linkItem}><Link href="#">Câu hỏi thường gặp (FAQ)</Link></li>
            <li className={styles.linkItem}><Link href="#">Chính sách bảo mật</Link></li>
            <li className={styles.linkItem}><Link href="#">Điều khoản sử dụng</Link></li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div>
          <h3 className={styles.columnTitle}>Liên hệ</h3>
          <div className={styles.contactItem}>
            <Mail size={16} />
            <span>hotro@betonamu.com</span>
          </div>
          <div className={styles.contactItem}>
            <Phone size={16} />
            <span>0123 456 789</span>
          </div>
          <div className={styles.contactItem}>
            <MapPin size={16} />
            <span>Hà Nội, Việt Nam</span>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <p>
          &copy; {new Date().getFullYear()} Betonamu. All rights reserved.<br/>
          Designed and developed by <strong>Trivelet Aisling</strong>.
        </p>
        <div className={styles.bottomLinks}>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
