'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container || totalPages <= 1) return;

    const handleWheel = (e: WheelEvent) => {
      // Ngăn cuộn trang web khi đang hover trong vùng preview
      e.preventDefault();

      if (isThrottled.current) return;

      const delta = Math.sign(e.deltaY);
      if (delta > 0 && currentPage < totalPages - 1) {
        setCurrentPage((prev) => prev + 1);
        throttle();
      } else if (delta < 0 && currentPage > 0) {
        setCurrentPage((prev) => prev - 1);
        throttle();
      }
    };

    const throttle = () => {
      isThrottled.current = true;
      setTimeout(() => {
        isThrottled.current = false;
      }, 800); // Đợi 800ms để lật chậm và mượt hơn
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [currentPage, totalPages]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className={styles.previewWrapper}>
      {/* Vùng hiển thị trang */}
      <div className={styles.previewContainer} ref={containerRef}>
        <div className={styles.hintOverlay}>
          <span>Cuộn chuột để xem trước ({currentPage + 1}/{totalPages})</span>
        </div>
        <div 
          className={styles.pagesSlider} 
          style={{ transform: `translateY(-${currentPage * 100}%)` }}
        >
          {isPdf ? (
            <Document 
              file={fileUrl} 
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className={styles.loadingState}>Đang tải trang PDF...</div>}
              error={<div className={styles.loadingState}>Không thể tải PDF.</div>}
            >
              {displayPages.map((pageIndex) => (
                <div key={pageIndex} className={styles.pageItem}>
                  <Page 
                    pageNumber={pageIndex + 1} 
                    width={containerRef.current?.clientWidth || 400} 
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              ))}
            </Document>
          ) : (
            fallbackImages.map((src, index) => (
              <div key={index} className={styles.pageItem}>
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

      {/* Thanh phân trang */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          {displayPages.map((_, index) => (
            <button
              key={index}
              className={`${styles.pageDot} ${index === currentPage ? styles.activeDot : ''}`}
              onClick={() => setCurrentPage(index)}
              aria-label={`Đi tới trang ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
