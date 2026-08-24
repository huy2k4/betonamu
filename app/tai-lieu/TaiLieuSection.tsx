'use client';

import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import TaiLieuCard, { TaiLieuCardProps } from '@/components/TaiLieuCard/TaiLieuCard';
import styles from './TaiLieuSection.module.css';

const FILTER_OPTIONS = ['Tất cả', 'Ebook', 'Từ vựng', 'Audio', 'Giáo Án'];
const EXAM_YEAR_FILTER = ['Tất cả', '2025', '2024', '2023', '2022'];

interface TaiLieuSectionProps {
  id: string;
  title: string;
  hotLevel?: 0 | 1 | 2 | 3; // 0 = không hot, 3 = siêu hot
  books: TaiLieuCardProps[];
  isExamSection?: boolean;
}

export default function TaiLieuSection({
  id,
  title,
  hotLevel = 0,
  books,
  isExamSection = false,
}: TaiLieuSectionProps) {
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  const filters = isExamSection ? EXAM_YEAR_FILTER : FILTER_OPTIONS;

  const filteredBooks =
    activeFilter === 'Tất cả'
      ? books
      : isExamSection
      ? books.filter((b) => b.tags.includes(activeFilter))
      : books.filter((b) => b.tags.includes(activeFilter));

  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      {/* Section header */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleRow}>
          <h2 id={`${id}-title`} className={styles.sectionTitle}>
            {title}
          </h2>
          {hotLevel > 0 && (
            <div className={styles.hotIcons} aria-label={`Độ hot: ${hotLevel}/3`}>
              {Array.from({ length: hotLevel }).map((_, i) => (
                <Flame
                  key={i}
                  size={16}
                  fill="currentColor"
                  color="currentColor"
                  className={styles.hotIcon}
                />
              ))}
            </div>
          )}
        </div>

        {/* Filter pills */}
        <div className={styles.filterRow} role="group" aria-label="Lọc tài liệu">
          {filters.map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${
                activeFilter === f ? styles.filterActive : ''
              }`}
              onClick={() => setActiveFilter(f)}
              aria-pressed={activeFilter === f}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Card grid */}
      <div className={styles.cardGrid}>
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book, i) => (
            <TaiLieuCard key={`${id}-${i}`} {...book} />
          ))
        ) : (
          <p className={styles.noResult}>Không có tài liệu phù hợp.</p>
        )}
      </div>
    </section>
  );
}
