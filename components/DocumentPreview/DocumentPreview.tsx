'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DocumentPreview.module.css';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Config PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentPreviewProps {
  fileUrl: string;
  fileType: string;
  fallbackImages: string[];
}

export default function DocumentPreview({ fileUrl, fileType, fallbackImages }: DocumentPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isThrottled = useRef(false);
  const [numPages, setNumPages] = useState<number>(0);
  
  const isPdf = fileType.toLowerCase().includes('pdf');
  const totalPages = isPdf ? Math.min(numPages || 5, 5) : fallbackImages.length; // Max 5 pages for preview
  const displayPages = Array.from(new Array(totalPages), (val, index) => index);

  const deltaYAccumulator = useRef(0);

  // Touch tracking refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const throttle = useCallback(() => {
    isThrottled.current = true;
    setTimeout(() => {
      isThrottled.current = false;
      deltaYAccumulator.current = 0;
    }, 400); // 400ms throttle for responsive switching
  }, []);

  // Wheel scroll handler (Desktop)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || totalPages <= 1) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isThrottled.current) {
        deltaYAccumulator.current = 0;
        return;
      }

      deltaYAccumulator.current += e.deltaY;
      const threshold = 50;

      if (deltaYAccumulator.current > threshold && currentPage < totalPages - 1) {
        goToNextPage();
        deltaYAccumulator.current = 0;
        throttle();
      } else if (deltaYAccumulator.current < -threshold && currentPage > 0) {
        goToPrevPage();
        deltaYAccumulator.current = 0;
        throttle();
      } else if (Math.abs(deltaYAccumulator.current) > threshold) {
        deltaYAccumulator.current = 0;
      }
    };

    // Native Touch Handlers to strictly prevent outer page scrolling
    const handleTouchStart = (e: TouchEvent) => {
      if (totalPages <= 1) return;
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Ngăn toàn bộ hiện tượng cuộn trang bên ngoài khi đang vuốt trong preview
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || totalPages <= 1 || isThrottled.current) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touchStartRef.current.x - touch.clientX;
      const deltaY = touchStartRef.current.y - touch.clientY;
      const deltaTime = Date.now() - touchStartRef.current.time;
      
      touchStartRef.current = null;

      // Fast swipe or distance > 30px threshold
      const minDistance = 30;
      const maxTime = 600;

      if (deltaTime > maxTime) return;

      // Determine primary gesture direction
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // Vertical swipe: Vuốt lên = trang tiếp theo, Vuốt xuống = trang trước
        if (deltaY > minDistance && currentPage < totalPages - 1) {
          goToNextPage();
          throttle();
        } else if (deltaY < -minDistance && currentPage > 0) {
          goToPrevPage();
          throttle();
        }
      } else {
        // Horizontal swipe: Vuốt sang trái = trang tiếp theo, Vuốt sang phải = trang trước
        if (deltaX > minDistance && currentPage < totalPages - 1) {
          goToNextPage();
          throttle();
        } else if (deltaX < -minDistance && currentPage > 0) {
          goToPrevPage();
          throttle();
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentPage, totalPages, goToNextPage, goToPrevPage, throttle]);

  // Keyboard navigation (Arrow keys)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      goToNextPage();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevPage();
    }
  };

  const [containerWidth, setContainerWidth] = useState<number>(400);

  // Measure the container width on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    
    observer.observe(containerRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className={styles.previewWrapper}>
      {/* Vùng hiển thị trang */}
      <div 
        className={styles.previewContainer} 
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="region"
        aria-label="Xem trước tài liệu"
      >
        {/* Badge trạng thái trang */}
        <div className={styles.pageBadge}>
          <span>Trang {currentPage + 1}/{totalPages}</span>
        </div>

        {/* Hint Overlay khi hover trên desktop */}
        <div className={styles.hintOverlay}>
          <span>Cuộn chuột hoặc vuốt để đổi trang</span>
        </div>

        {/* Nút Previous (hiển thị khi trang > 0) */}
        {totalPages > 1 && (
          <>
            <button
              type="button"
              className={`${styles.sideNavBtn} ${styles.sideNavPrev}`}
              onClick={(e) => {
                e.stopPropagation();
                goToPrevPage();
              }}
              disabled={currentPage === 0}
              aria-label="Trang trước"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              className={`${styles.sideNavBtn} ${styles.sideNavNext}`}
              onClick={(e) => {
                e.stopPropagation();
                goToNextPage();
              }}
              disabled={currentPage === totalPages - 1}
              aria-label="Trang tiếp theo"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div className={styles.pagesSlider}>
          {isPdf ? (
            <Document 
              file={fileUrl} 
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className={styles.loadingState}>Đang tải tài liệu PDF...</div>}
              error={<div className={styles.loadingState}>Không thể tải PDF.</div>}
              className={styles.pdfDocument}
            >
              {displayPages.map((pageIndex) => (
                <div 
                  key={pageIndex} 
                  className={styles.pageItem}
                  style={{ transform: `translateY(${(pageIndex - currentPage) * 100}%)` }}
                >
                  <Page 
                    pageNumber={pageIndex + 1} 
                    width={containerWidth} 
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              ))}
            </Document>
          ) : (
            fallbackImages.map((src, index) => (
              <div 
                key={index} 
                className={styles.pageItem}
                style={{ transform: `translateY(${(index - currentPage) * 100}%)` }}
              >
                <Image 
                  src={src} 
                  alt={`Trang ${index + 1}`} 
                  fill
                  style={{ objectFit: 'contain', backgroundColor: '#e2e8f0' }} 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Thanh phân trang và điều hướng dưới */}
      {totalPages > 1 && (
        <div className={styles.paginationBar}>
          <button
            type="button"
            className={styles.paginationArrowBtn}
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            aria-label="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>

          <div className={styles.paginationDots}>
            {displayPages.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`${styles.pageDot} ${index === currentPage ? styles.activeDot : ''}`}
                onClick={() => setCurrentPage(index)}
                aria-label={`Đi tới trang ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.paginationArrowBtn}
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            aria-label="Trang tiếp theo"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
