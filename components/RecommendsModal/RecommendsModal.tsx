'use client';
import React, { useState } from 'react';
import { Clock, TrendingUp, Sparkles, Search, Book, FileText } from 'lucide-react';
import styles from './RecommendsModal.module.css';

interface RecommendsModalProps {
  isOpen: boolean;
  searchValue: string;
  onItemClick: (value: string) => void;
}

// Mock Data
const MOCK_HISTORY = ['minna no nihongo', 'đề thi n5', 'từ vựng n4'];

const MOCK_TRENDS = ['JLPT N3', 'Giao tiếp cơ bản', 'Từ vựng IT', 'Đề thi JLPT N4'];

const MOCK_SUGGESTIONS = [
  { title: 'Minna no Nihongo N5', icon: <Book size={16} /> },
  { title: 'Luyện nghe N3', icon: <FileText size={16} /> },
  { title: 'Kanji cơ bản', icon: <Book size={16} /> },
];

const MOCK_ALL_DOCS = [
  { title: 'Minna no Nihongo Sơ cấp 1 (N5)', category: 'Tài liệu Sơ cấp' },
  { title: 'Minna no Nihongo Sơ cấp 2 (N4)', category: 'Tài liệu Sơ cấp' },
  { title: 'Soumatome N3 Ngữ pháp', category: 'Tài liệu Trung cấp' },
  { title: 'Mimi Kara Oboeru N3 Từ vựng', category: 'Tài liệu Trung cấp' },
  { title: 'Đề thi JLPT N5 tháng 12/2023', category: 'Đề thi' },
  { title: 'Đề thi JLPT N4 tháng 7/2023', category: 'Đề thi' },
  { title: 'Học giao tiếp cơ bản tiếng Nhật', category: 'Kaiwa' },
  { title: 'Từ vựng chuyên ngành IT', category: 'Từ vựng' },
];

const ALL_KEYWORDS = [
  'minna no nihongo', 'đề thi n5', 'từ vựng n4', 'ngữ pháp n3',
  'giao tiếp cơ bản', 'từ vựng it', 'jlpt n5', 'jlpt n4',
  'luyện nghe n3', 'kanji cơ bản', 'sơ cấp', 'trung cấp'
];

const generateSlug = (str: string) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

export default function RecommendsModal({ isOpen, searchValue, onItemClick }: RecommendsModalProps) {
  const [history] = useState<string[]>(MOCK_HISTORY);
  
  if (!isOpen) return null;

  const isSearching = searchValue.trim().length > 0;
  
  // Filter search results using slug algorithm
  const searchSlug = generateSlug(searchValue);
  const searchResults = MOCK_ALL_DOCS.filter(doc => {
    const docSlug = generateSlug(doc.title);
    return docSlug.includes(searchSlug);
  });
  
  const keywordResults = ALL_KEYWORDS.filter(k => {
    const kSlug = generateSlug(k);
    return kSlug.includes(searchSlug);
  });

  return (
    <div className={styles.recommendsModal} onMouseDown={(e) => e.preventDefault()}>
      {/* 
        onMouseDown={e => e.preventDefault()} prevents the input from losing focus 
        when clicking inside the modal
      */}
      
      {!isSearching ? (
        <>
          {/* State 1.2: No search value but has history */}
          {history.length > 0 && (
            <div className={styles.historyList}>
              {history.map((item, index) => (
                <div 
                  key={index} 
                  className={styles.historyItem}
                  onClick={() => onItemClick(item)}
                >
                  <Clock size={14} />
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* State 1.1: No search value */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <TrendingUp size={18} color="#ff5722" />
              Xu hướng tìm kiếm
            </div>
            <div className={styles.trendList}>
              {MOCK_TRENDS.map((trend, index) => (
                <div 
                  key={index} 
                  className={styles.trendItem}
                  onClick={() => onItemClick(trend)}
                >
                  <TrendingUp size={14} />
                  {trend}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <Sparkles size={18} color="#4f46e5" />
              Gợi ý cho bạn
            </div>
            <div className={styles.suggestionList}>
              {MOCK_SUGGESTIONS.map((suggestion, index) => (
                <div 
                  key={index} 
                  className={styles.suggestionItem}
                  onClick={() => onItemClick(suggestion.title)}
                >
                  <div className={styles.suggestionIcon}>
                    {suggestion.icon}
                  </div>
                  <div className={styles.suggestionText}>{suggestion.title}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* State 2: Searching with value */}
          
          {/* Section 1: Từ khoá gợi ý (No Header) */}
          {keywordResults.length > 0 && (
            <div className={styles.section} style={{ marginTop: '0.5rem' }}>
              <div className={styles.trendList}>
                {keywordResults.slice(0, 3).map((keyword, index) => (
                  <div 
                    key={index} 
                    className={styles.trendItem}
                    onClick={() => onItemClick(keyword)}
                  >
                    <Search size={14} />
                    {keyword}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Tài liệu gợi ý */}
          <div className={styles.section} style={{ marginTop: '1rem' }}>
            <div className={styles.sectionTitle}>
              <Book size={18} color="#ff5722" />
              Tài liệu gợi ý
            </div>
            <div className={styles.resultList}>
              {searchResults.length > 0 ? (
                searchResults.slice(0, 4).map((result, index) => (
                  <div 
                    key={index} 
                    className={styles.resultItem}
                    onClick={() => onItemClick(result.title)}
                  >
                    <FileText size={18} color="#888" />
                    <div className={styles.resultContent}>
                      <span className={styles.resultTitle}>{result.title}</span>
                      <span className={styles.resultCategory}>{result.category}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noResult}>
                  Không có tài liệu phù hợp
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
