'use client';

import React from 'react';
import Image from 'next/image';
import { Menu, Search, User } from 'lucide-react';
import styles from './Header.module.css';
import CategoryModal from '../CategoryModal/CategoryModal';

export default function Header() {
  return (
    <div className={styles.headerContainer}>
      {/* Div dọc rỗng 1 */}
      <div className={styles.topRow}>
        <div className={styles.leftVerticalBar}>
          {/* 1. Logo */}
          <div className={styles.logoContainer}>
            <Image 
              src="/assets/betonamu_logo.png" 
              alt="Betonamu Logo" 
              width={120} 
              height={40} 
              className={styles.logoImage}
              priority
            />
          </div>
        </div>
        <div className={styles.headerCenter}>
  {/* 2. Danh mục */}
          <div className={styles.categoryContainer}>
            <Menu size={20} />
            <span>Danh mục</span>
            
            {/* Modal component - Wrapper xử lý gap chống ngắt hover */}
            <div className={styles.categoryModalWrapper}>
              <CategoryModal />
            </div>
          </div>

          {/* 3. Searchbar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
              <input 
                type="text" 
                placeholder="Nhập tên khóa học, tài liệu... cần tìm" 
                className={styles.searchInput} 
              />
              <button title="Tìm kiếm" className={styles.searchBtn}>
                <Search size={16} className={styles.searchIcon} />
              </button>
            </div>
            {/* Luôn hiển thị từ khóa */}
            <div className={styles.hotKeyword}>
              <a href="#">jlpt n5</a>
              <a href="#">ngữ pháp</a>
              <a href="#">từ vựng</a>
              <a href="#">đề thi thử</a>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          {/* 4. Account (Chia 2 div dọc: icon và tên) */}
          <div className={styles.accountContainer}>
            <div className={styles.accountIconWrapper}>
              <User size={20} color="white" />
          </div>
            <div className={styles.accountName}>
              Admin
            </div>
          </div>
        </div>
      </div>

      {/* Div dọc rỗng 2 */}
      <div className={styles.bottomRow}>
        {/* Để trống theo yêu cầu */}
      </div>
    </div>
  );
}
