import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download, Bookmark, Share2, FileText, CheckCircle } from 'lucide-react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import DocumentPreview from '@/components/DocumentPreview/DocumentPreviewWrapper';
import styles from './page.module.css';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { fixUrl, fixThumbnailUrl } from '@/utils/url';

export default async function DocumentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch document from database
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !document) {
    console.error('Failed to fetch document:', error);
    notFound();
  }

  // Format data
  const title = document.title;
  const description = document.summary || 'Chưa có mô tả.';
  const fileType = document.file_type ? document.file_type.toUpperCase() : 'PDF';
  const fileSizeMb = document.file_size_bytes 
    ? (document.file_size_bytes / (1024 * 1024)).toFixed(2) + ' MB'
    : 'Không xác định';
  const pages = document.page_count || 1;
  const downloads = document.download_count || 0;
  
  // Fallback for fields not yet in DB
  const author = 'Ẩn danh';
  const publishedYear = 'Khác';
  const level = 'Khác';
  const tags = ['Mới cập nhật'];

  // Prepare fallback images in case it's not a PDF or loading fails
  const thumbnailUrl = fixThumbnailUrl(document.thumbnail_url);
  const images = document.preview_file_url 
    ? document.preview_file_url.split(',').map(fixUrl)
    : [thumbnailUrl, thumbnailUrl, thumbnailUrl, thumbnailUrl, thumbnailUrl];
    
  const fileUrl = fixUrl(document.file_url);
  const fileTypeProp = document.file_type || 'pdf';

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            Trang chủ
          </Link>
          <span className={styles.breadcrumbSep}>›</span>
          <Link href="/tai-lieu" className={styles.breadcrumbLink}>
            Tài liệu miễn phí
          </Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{title}</span>
        </nav>

        {/* Cấu trúc 2 cột kiểu E-commerce */}
        <div className={styles.productContainer}>
          
          {/* Cột Trái: Preview */}
          <div className={styles.leftColumn}>
            <DocumentPreview 
              fileUrl={fileUrl} 
              fileType={fileTypeProp} 
              fallbackImages={images} 
            />
          </div>

          {/* Cột Phải: Thông tin & Hành động */}
          <div className={styles.rightColumn}>
            <div className={styles.productInfo}>
              
              <div className={styles.tagList}>
                <span className={styles.levelBadge}>{level}</span>
                {tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>

              <h1 className={styles.title}>{title}</h1>
              
              <div className={styles.metaRow}>
                <span>Bởi: <strong>{author}</strong></span>
                <span className={styles.metaDot}>•</span>
                <span>{downloads} Lượt tải</span>
              </div>

              <div className={styles.priceSection}>
                <span className={styles.priceLabel}>Giá:</span>
                <span className={styles.priceValue}>Miễn phí</span>
              </div>

              <p className={styles.description}>
                {description}
              </p>

              {/* Thông số kỹ thuật */}
              <div className={styles.specsBox}>
                <h3 className={styles.specsTitle}>Thông tin file</h3>
                <ul className={styles.specsList}>
                  <li>
                    <FileText size={16} className={styles.specIcon} />
                    <span>Định dạng: <strong>{fileType}</strong></span>
                  </li>
                  <li>
                    <CheckCircle size={16} className={styles.specIcon} />
                    <span>Dung lượng: <strong>{fileSizeMb}</strong></span>
                  </li>
                  <li>
                    <CheckCircle size={16} className={styles.specIcon} />
                    <span>Số trang: <strong>{pages}</strong></span>
                  </li>
                  <li>
                    <CheckCircle size={16} className={styles.specIcon} />
                    <span>Năm XB: <strong>{publishedYear}</strong></span>
                  </li>
                </ul>
              </div>

              <div className={styles.actionSection}>
                <a href={`/api/download/${document.id}`} className={`${styles.btn} ${styles.btnPrimary}`} style={{ textDecoration: 'none' }}>
                  <Download size={20} />
                  <span>Tải xuống ngay</span>
                </a>
                <div className={styles.secondaryActions}>
                  <button className={`${styles.btn} ${styles.btnOutline}`}>
                    <Bookmark size={20} />
                    <span>Lưu vào thư viện</span>
                  </button>
                  <button className={`${styles.btn} ${styles.btnIcon}`}>
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
