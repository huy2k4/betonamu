'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Download, Info, Bookmark, BookmarkCheck } from 'lucide-react';
import { fixThumbnailUrl } from '@/utils/url';
import styles from './TaiLieuCard.module.css';

export interface TaiLieuCardProps {
  slug?: string;
  thumbnail: string;
  title: string;
  description: string;
  tags: string[];
  level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  fileSize?: string;
  fileType?: 'PDF' | 'MP3' | 'ZIP' | 'DOCX';
}

export default function TaiLieuCard({
  slug = 'minna-no-nihongo-n5', // Default slug for mock data if not provided
  thumbnail,
  title,
  description,
  tags,
  level,
  fileSize,
  fileType = 'PDF',
}: TaiLieuCardProps) {
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/tai-lieu/${slug}`);
  };

  const safeThumbnail = fixThumbnailUrl(thumbnail);

  return (
    <div className={styles.card} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {/* Cột 1: Bìa sách */}
      <div className={styles.coverCol}>
        <div className={styles.coverWrapper}>
          <Image
            src={safeThumbnail}
            alt={title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="100px"
          />
          {level && <span className={styles.levelBadge}>{level}</span>}
        </div>
        {fileType && (
          <span className={styles.fileTypeBadge}>{fileType}</span>
        )}
      </div>

      {/* Cột 2: Thông tin + nút */}
      <div className={styles.infoCol}>
        <div className={styles.textArea}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
          <div className={styles.tagList}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          {fileSize && (
            <span className={styles.fileSize}>{fileSize}</span>
          )}
        </div>

        {/* 3 nút hành động */}
        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnDownload}`}
            title="Tải xuống"
            aria-label="Tải xuống tài liệu"
            onClick={(e) => {
              e.stopPropagation();
              // Thêm logic tải xuống ở đây
            }}
          >
            <Download size={15} />
            <span>Tải xuống</span>
          </button>
          <button
            className={`${styles.btn} ${styles.btnDetail}`}
            title="Xem chi tiết"
            aria-label="Xem chi tiết tài liệu"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick(); // Tương tự click vào card
            }}
          >
            <Info size={15} />
            <span>Chi tiết</span>
          </button>
          <button
            className={`${styles.btn} ${styles.btnSave} ${saved ? styles.btnSaved : ''}`}
            title={saved ? 'Đã lưu' : 'Lưu tài liệu'}
            aria-label={saved ? 'Đã lưu' : 'Lưu tài liệu'}
            onClick={(e) => {
              e.stopPropagation();
              setSaved(!saved);
            }}
          >
            {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            <span>{saved ? 'Đã lưu' : 'Lưu'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
