'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import HeroBannerCarousel, { BannerSlide } from '@/components/HeroBannerCarousel/HeroBannerCarousel';
import TaiLieuCard, { TaiLieuCardProps } from '@/components/TaiLieuCard/TaiLieuCard';
import styles from './tabs.module.css';

interface ExploreTabProps {
  featuredDocs: TaiLieuCardProps[];
  heroBanners: BannerSlide[];
}

const FILTER_TAGS = [
  { id: 'all', label: 'Tất cả tài liệu' },
  { id: 'minna', label: 'Minna no Nihongo' },
  { id: 'somatome', label: 'Somatome' },
  { id: 'mimikara', label: 'Mimikara Oboeru' },
  { id: 'exam', label: 'Đề thi JLPT' },
];

export default function ExploreTab({ featuredDocs, heroBanners }: ExploreTabProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredDocs = useMemo(() => {
    if (activeFilter === 'all') return featuredDocs;
    if (activeFilter === 'minna') {
      return featuredDocs.filter((d) => d.title.toLowerCase().includes('minna') || d.title.toLowerCase().includes('mina'));
    }
    if (activeFilter === 'somatome') {
      return featuredDocs.filter((d) => d.title.toLowerCase().includes('somatome'));
    }
    if (activeFilter === 'mimikara') {
      return featuredDocs.filter((d) => d.title.toLowerCase().includes('mimikara'));
    }
    if (activeFilter === 'exam') {
      return featuredDocs.filter((d) => d.title.toLowerCase().includes('jlpt') || d.tags.some((t) => t.includes('Đề thi')));
    }
    return featuredDocs;
  }, [featuredDocs, activeFilter]);

  return (
    <div className={styles.exploreContainer}>
      {/* 1. Hero Carousel Banner */}
      <div className={styles.carouselSection}>
        <HeroBannerCarousel slides={heroBanners} autoPlayInterval={5000} />
      </div>

      {/* 2. Section Header with Filters */}
      <div>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>📚 Kho Tài Liệu Tuyển Chọn</h2>
            <p className={styles.sectionSubtitle}>
              Giáo trình, sách luyện thi JLPT và tài liệu ngữ pháp từ N5 đến N1
            </p>
          </div>

          <Link href="/tai-lieu" className={styles.seeAllLink}>
            Xem toàn bộ kho tài liệu <ArrowRight size={15} />
          </Link>
        </div>

        {/* Filter chips */}
        <div className={styles.filterChips} role="tablist" aria-label="Bộ lọc tài liệu">
          {FILTER_TAGS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`${styles.filterChip} ${activeFilter === filter.id ? styles.filterChipActive : ''}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className={styles.cardsGrid}>
          {filteredDocs.map((doc, idx) => (
            <TaiLieuCard key={doc.slug ?? idx} {...doc} />
          ))}
        </div>
      </div>
    </div>
  );
}
