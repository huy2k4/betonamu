'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame } from 'lucide-react';
import styles from './CategoryModal.module.css';

export default function CategoryModal() {
  const [activeTab, setActiveTab] = useState('tai-lieu');
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  // Kỹ thuật "Debounce Hover" để giải quyết vấn đề quẹt chéo chuột (Amazon Menu Aim problem).
  // Đợi 120ms mới đổi tab, nếu chuột lướt ngang qua tab khác để vào Main Content thì sẽ bị hủy trước khi kịp đổi.
  const handleMouseEnter = (tab: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setActiveTab(tab);
    }, 120); 
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  };

  return (
    <div className={styles.CategoryModal}>
      <div className={styles.CategoryModalContainer}>
        {/* Left Sidebar */}
        <aside className={styles.LeftSidebar}>
          <ul className={styles.PrimaryCategories}>
            <li 
              className={`${styles.menuItem} ${activeTab === 'tai-lieu' ? styles.activeMenuItem : ''}`}
              onMouseEnter={() => handleMouseEnter('tai-lieu')}
              onMouseLeave={handleMouseLeave}
            >
              <Link href="/tai-lieu" className={styles.menuItemLink}>Tài liệu miễn phí</Link>
            </li>
            <li 
              className={`${styles.menuItem} ${activeTab === 'tu-vung' ? styles.activeMenuItem : ''}`}
              onMouseEnter={() => handleMouseEnter('tu-vung')}
              onMouseLeave={handleMouseLeave}
            >
              Học từ vựng
            </li>
            <li 
              className={`${styles.menuItem} ${activeTab === 'kaiwa' ? styles.activeMenuItem : ''}`}
              onMouseEnter={() => handleMouseEnter('kaiwa')}
              onMouseLeave={handleMouseLeave}
            >
              Học kaiwa
            </li>
            <li className={`${styles.menuItem} ${styles.disabledMenuItem}`}>
              Luyện thi JLPT N5-N1 <span className={styles.soonLabel}>(Soon)</span>
            </li>
            <li className={`${styles.menuItem} ${styles.disabledMenuItem}`}>
              Văn hóa Nhật <span className={styles.soonLabel}>(Soon)</span>
            </li>
          </ul>

          <div className={styles.Section}>
            <h3 className={styles.SectionTitle}>Trình độ JLPT</h3>
            <div className={styles.Grid2Col}>
               <a href="#" className={styles.LevelLink}><span className={styles.LevelBadge}>Sơ cấp N5</span></a>
               <a href="#" className={styles.LevelLink}><span className={styles.LevelBadge}>Sơ cấp N4</span></a>
               <a href="#" className={styles.LevelLink}><span className={styles.LevelBadge}>Trung cấp N3</span></a>
               <a href="#" className={styles.LevelLink}><span className={styles.LevelBadge}>Trung cấp N2</span></a>
               <a href="#" className={styles.LevelLink}><span className={styles.LevelBadge}>Cao cấp N1</span></a>
            </div>
          </div>
          
          <div className={styles.Section}>
            <h3 className={styles.SectionTitle}>Kỹ năng</h3>
             <ul className={styles.SkillList}>
               <li><a href="#">Hán tự</a></li>
               <li><a href="#">Ngữ pháp</a></li>
               <li><a href="#">Từ vựng</a></li>
               <li><a href="#">Nghe</a></li>
               <li><a href="#">Nói</a></li>
               <li><a href="#">Đọc</a></li>
             </ul>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={styles.MainContent}>
          {activeTab === 'tai-lieu' && (
            <>
              <h2 className={styles.MainTitle}>🔥 Gợi ý cho bạn</h2>
              
              <div className={styles.TagsList}>
                 <span className={`${styles.Tag} ${styles.TagOrange}`}>
                   Minna no Nihongo
                   <span className={styles.HotBadge} title="Hot">
                     <Flame size={14} fill="currentColor" color="currentColor" />
                   </span>
                 </span>
                 <span className={`${styles.Tag} ${styles.TagYellow}`}>Somatome</span>
                 <span className={`${styles.Tag} ${styles.TagGreen}`}>Mimi Kara Oboeru</span>
              </div>

              <div className={styles.VisualCategories}>
                 <div className={styles.VisualItem}>
                   <div className={styles.BookCover}>
                     <Image src="/assets/minano-nihongo.jpg" alt="Minna N5" fill style={{objectFit: 'cover'}} sizes="80px" />
                   </div>
                   <span>Mina N5</span>
                 </div>
                 <div className={styles.VisualItem}>
                   <div className={styles.BookCover}>
                     <Image src="/assets/minano-nihongo.jpg" alt="Minna N4" fill style={{objectFit: 'cover'}} sizes="80px" />
                   </div>
                   <span>Mina N4</span>
                 </div>
                 <div className={styles.VisualItem}>
                   <div className={styles.BookCover}>
                     <Image src="/assets/somatome.jpeg" alt="Somatome N5" fill style={{objectFit: 'cover'}} sizes="80px" />
                   </div>
                   <span>Somatome N5</span>
                 </div>
                 <div className={styles.VisualItem}>
                   <div className={styles.BookCover}>
                     <Image src="/assets/mimikara-oboeru.webp" alt="Mimikara N4" fill style={{objectFit: 'cover'}} sizes="80px" />
                   </div>
                   <span>Mimikara N4</span>
                 </div>
              </div>

              <div className={styles.Grid3Col}>
                 <div className={styles.Column}>
                   <h4 className={styles.ColTitle}>Sơ cấp</h4>
                   <ul className={styles.ColList}>
                     <li><a href="#">Bảng chữ cái Kana</a></li>
                     <li><a href="#">Minna no Nihongo N5</a></li>
                     <li><a href="#">Minna no Nihongo N4</a></li>
                     <li><a href="#">Tài liệu N5, N4 Khác</a></li>
                   </ul>
                 </div>
                 <div className={styles.Column}>
                   <h4 className={styles.ColTitle}>Trung cấp - Cao cấp</h4>
                   <ul className={styles.ColList}>
                     <li><a href="#">Shinkanzen Master</a></li>
                     <li><a href="#">Nihongo Soumatome</a></li>
                     <li><a href="#">Mimi Kara Oboeru</a></li>
                     <li><a href="#">Tài liệu N3, N2, N1</a></li>
                   </ul>
                 </div>
                 <div className={styles.Column}>
                   <h4 className={styles.ColTitle}>Kỹ năng</h4>
                   <ul className={styles.ColList}>
                     <li><a href="#">Tài liệu Đọc hiểu</a></li>
                     <li><a href="#">Tài liệu Nghe hiểu</a></li>
                     <li><a href="#">Sách Từ vựng chuyên ngành</a></li>
                     <li><a href="#">Flashcard Hán tự</a></li>
                   </ul>
                 </div>
              </div>

              <div className={styles.ExamSection}>
                 <h3 className={styles.ExamTitle}>Đề thi JLPT các năm</h3>
                 <div className={styles.ExamGrid}>
                    <a href="#" className={styles.ExamLink}>JLPT N5 T7/2022</a>
                    <a href="#" className={styles.ExamLink}>JLPT N4 T7/2022</a>
                    <a href="#" className={styles.ExamLink}>JLPT N3 T7/2022</a>
                    <a href="#" className={styles.ExamLink}>JLPT N2 T7/2022</a>
                    
                    <a href="#" className={styles.ExamLink}>JLPT N5 T12/2022</a>
                    <a href="#" className={styles.ExamLink}>JLPT N4 T12/2022</a>
                    <a href="#" className={styles.ExamLink}>JLPT N3 T12/2022</a>
                    <a href="#" className={styles.ExamLink}>JLPT N2 T12/2022</a>
                    
                    <a href="#" className={styles.ExamLink}>JLPT N5 T7/2023</a>
                    <a href="#" className={styles.ExamLink}>JLPT N4 T7/2023</a>
                    <a href="#" className={styles.ExamLink}>JLPT N3 T7/2023</a>
                    <a href="#" className={styles.ExamLink}>JLPT N2 T7/2023</a>

                    <a href="#" className={styles.ExamLink}>JLPT N5 T12/2023</a>
                    <a href="#" className={styles.ExamLink}>JLPT N4 T12/2023</a>
                    <a href="#" className={styles.ExamLink}>JLPT N3 T12/2023</a>
                    <a href="#" className={styles.ExamLink}>JLPT N2 T12/2023</a>
                 </div>
              </div>
            </>
          )}

          {activeTab === 'tu-vung' && (
            <div className={styles.EmptyState}>
              <div>
                <h3 className={styles.EmptyTitle}>Học từ vựng</h3>
                <p className={styles.EmptyText}>Nội dung đang được cập nhật...</p>
              </div>
            </div>
          )}

          {activeTab === 'kaiwa' && (
             <div className={styles.EmptyState}>
              <div>
                <h3 className={styles.EmptyTitle}>Học Kaiwa</h3>
                <p className={styles.EmptyText}>Nội dung đang được cập nhật...</p>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar Utilities */}
        <aside className={styles.RightSidebar}>
           <div className={styles.UtilityList}>
             <div className={styles.UtilityItem}>
                <div className={styles.UtilityIcon}>Thi</div>
                <span className={styles.UtilityLabel}>Thi thử JLPT <br/><span className={styles.UtilitySoon}>(Coming soon)</span></span>
             </div>
             <div className={styles.UtilityItem}>
                <div className={styles.UtilityIcon}>✒️</div>
                <span className={styles.UtilityLabel}>Chấm bài viết <br/><span className={styles.UtilitySoon}>(Coming soon)</span></span>
             </div>
             <div className={styles.UtilityItem}>
                <div className={styles.UtilityIcon}>1-1</div>
                <span className={styles.UtilityLabel}>Giao tiếp 1-1 <br/><span className={styles.UtilitySoon}>(Coming soon)</span></span>
             </div>
             <div className={styles.UtilityItem}>
                <div className={styles.UtilityIcon}>📇</div>
                <span className={styles.UtilityLabel}>Luyện FlashCard <br/><span className={styles.UtilitySoon}>(Coming soon)</span></span>
             </div>
           </div>

           <a href="https://www.instagram.com/hanasynex/" target="_blank" rel="noopener noreferrer" className={styles.PromoBanner}>
              <Image src="/assets/Thao.branch.png" alt="Thảo Banner" fill style={{objectFit: 'contain'}} sizes="256px" />
           </a>
        </aside>
      </div>
    </div>
  );
}
