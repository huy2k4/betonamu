'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import styles from './HeroBannerCarousel.module.css';

export interface BannerSlide {
  id: string;
  image: string;
  alt: string;
  badge?: string;
  badgeHot?: boolean;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  accentColor?: string; // gradient overlay accent
}

interface HeroBannerCarouselProps {
  slides: BannerSlide[];
  autoPlayInterval?: number; // ms, default 5000
}

export default function HeroBannerCarousel({
  slides,
  autoPlayInterval = 5000,
}: HeroBannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progressKey, setProgressKey] = useState(0); // re-trigger progress animation

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || index === activeIndex) return;
      setIsAnimating(true);
      setActiveIndex(index);
      setProgressKey((k) => k + 1);
      setTimeout(() => setIsAnimating(false), 600);
    },
    [activeIndex, isAnimating]
  );

  const goNext = useCallback(() => {
    goTo((activeIndex + 1) % total);
  }, [activeIndex, total, goTo]);

  const goPrev = useCallback(() => {
    goTo((activeIndex - 1 + total) % total);
  }, [activeIndex, total, goTo]);

  // Autoplay
  useEffect(() => {
    if (isPaused || total <= 1) return;
    timerRef.current = setTimeout(goNext, autoPlayInterval);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIndex, isPaused, goNext, autoPlayInterval, total]);

  // Touch / swipe support
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = touchStartRef.current.x - e.changedTouches[0].clientX;
    const dy = touchStartRef.current.y - e.changedTouches[0].clientY;
    touchStartRef.current = null;
    if (Math.abs(dx) < Math.abs(dy)) return; // vertical scroll — ignore
    if (Math.abs(dx) < 30) return; // too short
    if (dx > 0) goNext();
    else goPrev();
  };

  if (!slides.length) return null;

  return (
    <section
      className={styles.carouselWrapper}
      aria-label="Banner nổi bật"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ===== SLIDES TRACK ===== */}
      <div className={styles.track} ref={trackRef}>
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${i === activeIndex ? styles.slideActive : ''}`}
            aria-hidden={i !== activeIndex}
          >
            {/* Background Image with Ken Burns */}
            <div className={`${styles.kenBurns} ${i === activeIndex ? styles.kenBurnsActive : ''}`}>
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                style={{ objectFit: 'cover' }}
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) calc(100vw - 260px), calc(100vw - 540px)"
              />
            </div>

            {/* Gradient Overlay */}
            <div className={styles.overlay} />

            {/* Badge */}
            {slide.badge && (
              <span className={styles.badge}>
                {slide.badgeHot && <Flame size={11} />}
                {slide.badge}
              </span>
            )}

            {/* Content */}
            <div className={styles.content}>
              <h1 className={styles.title}>{slide.title}</h1>
              <p className={styles.subtitle}>{slide.subtitle}</p>
              <Link href={slide.ctaHref} className={styles.cta}>
                {slide.ctaLabel} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ===== PREV / NEXT BUTTONS ===== */}
      {total > 1 && (
        <>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navPrev}`}
            onClick={goPrev}
            aria-label="Slide trước"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navNext}`}
            onClick={goNext}
            aria-label="Slide tiếp theo"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* ===== PROGRESS INDICATORS ===== */}
      {total > 1 && (
        <div className={styles.indicators}>
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className={`${styles.indicator} ${i === activeIndex ? styles.indicatorActive : ''}`}
              onClick={() => {
                setIsPaused(false);
                goTo(i);
              }}
              aria-label={`Đi tới slide ${i + 1}: ${slide.title}`}
            >
              <span
                className={styles.indicatorFill}
                // Reset animation by changing key when slide changes
                key={i === activeIndex ? `active-${progressKey}` : `idle-${i}`}
                style={
                  i === activeIndex && !isPaused
                    ? ({ '--duration': `${autoPlayInterval}ms` } as React.CSSProperties)
                    : undefined
                }
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
