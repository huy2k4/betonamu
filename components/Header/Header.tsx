'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, User, LogOut, Bookmark, UserCircle, BookOpen } from 'lucide-react';
import styles from './Header.module.css';
import CategoryModal from '../CategoryModal/CategoryModal';
import RecommendsModal from '../RecommendsModal/RecommendsModal';
import LoginModal from '../LoginModal/LoginModal';
import { createClient } from '@/utils/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Header() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const accountContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (categoryContainerRef.current && !categoryContainerRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (accountContainerRef.current && !accountContainerRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    // Fetch initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAccountOpen(false);
  };

  return (
    <div className={styles.headerContainer}>
      {/* Div dọc rỗng 1 */}
      <div className={styles.topRow}>
        <div className={styles.leftVerticalBar}>
          {/* 1. Logo */}
          <div className={styles.logoContainer}>
            <Link href="/">
              <Image 
                src="/assets/betonamu_logo.png" 
                alt="Betonamu Logo" 
                width={120} 
                height={40} 
                className={styles.logoImage}
                priority
              />
            </Link>
          </div>
        </div>
        <div className={styles.headerCenter}>
  {/* 2. Danh mục */}
          <div 
            ref={categoryContainerRef}
            className={styles.categoryContainer}
            onMouseEnter={() => {
              setIsCategoryOpen(true);
              setIsSearchFocused(false);
              searchInputRef.current?.blur();
            }}
            onMouseLeave={() => setIsCategoryOpen(false)}
            onClick={() => {
              const newState = !isCategoryOpen;
              setIsCategoryOpen(newState);
              if (newState) setIsSearchFocused(false);
            }}
          >
            <Menu size={20} />
            <span className={styles.categoryText}>Danh mục</span>
            
            {/* Modal component - Wrapper xử lý gap chống ngắt hover */}
            {isCategoryOpen && (
              <div className={styles.categoryModalWrapper}>
                <CategoryModal />
              </div>
            )}
          </div>

          {/* 3. Searchbar */}
          <div className={styles.searchContainer} ref={searchContainerRef}>
            <div className={styles.searchBar}>
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Nhập tên khóa học, tài liệu... cần tìm" 
                className={styles.searchInput}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setIsCategoryOpen(false);
                }}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button title="Tìm kiếm" className={styles.searchBtn}>
                <Search size={16} className={styles.searchIcon} />
              </button>
            </div>
            
            {/* Modal Recommends */}
            <div style={{ position: 'relative', width: '100%' }}>
              <RecommendsModal 
                isOpen={isSearchFocused} 
                searchValue={searchValue}
                onItemClick={(val) => {
                  setSearchValue(val);
                  setIsSearchFocused(false);
                }}
              />
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
          {/* 4. Account */}
          <div 
            className={styles.accountContainer} 
            ref={accountContainerRef}
            onClick={() => {
              if (user) {
                setIsAccountOpen(!isAccountOpen);
                setIsCategoryOpen(false);
              }
            }}
          >
            {user ? (
              <>
                <div className={styles.accountIconWrapper}>
                  {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                      alt="Avatar" 
                      className={styles.userAvatar} 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={20} color="white" />
                  )}
                </div>
                <div className={styles.accountName}>
                  {user.user_metadata?.full_name || 'Tài khoản'}
                </div>
                
                {/* Account Dropdown Modal */}
                {isAccountOpen && (
                  <div className={styles.accountModalWrapper}>
                    <div className={styles.accountModal}>
                      <Link href="/account" className={styles.accountModalItem} onClick={() => setIsAccountOpen(false)}>
                        <UserCircle size={18} /> Hồ sơ cá nhân
                      </Link>
                      <Link href="/account/balo" className={styles.accountModalItem} onClick={() => setIsAccountOpen(false)}>
                        <Bookmark size={18} /> Balo của tôi
                      </Link>
                      <Link href="/lo-trinh" className={styles.accountModalItem} onClick={() => setIsAccountOpen(false)}>
                        <BookOpen size={18} /> Lộ trình của tôi
                      </Link>
                      <button className={styles.accountModalItem} onClick={handleLogout}>
                        <LogOut size={18} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'inherit', padding: 0 }}
              >
                <div className={styles.accountIconWrapper}>
                  <User size={20} color="white" />
                </div>
                <div className={styles.accountName}>
                  Đăng nhập
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
}

