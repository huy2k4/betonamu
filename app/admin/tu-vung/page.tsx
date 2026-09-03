'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Plus, Upload, Download, Search, Filter, ChevronLeft,
  ChevronRight, Trash2, Edit2, CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import styles from './tu-vung.module.css';

type Vocab = {
  id: string;
  word: string;
  reading: string;
  han_viet: string;
  meanings: string[];
  jlpt_level: string;
  topic: string[];
  lesson: string;
  part_of_speech: string[];
  is_active: boolean;
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

const JLPT_OPTIONS = ['', 'N5', 'N4', 'N3', 'N2', 'N1'];

export default function AdminVocabPage() {
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [jlptFilter, setJlptFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lessonFilter, setLessonFilter] = useState('');

  // CSV upload state
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success?: boolean; imported?: number; failed?: number; errors?: string[]; error?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // fetchPage is a stable ref to avoid re-triggering the effect
  const fetchPage = async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (jlptFilter) params.set('jlpt', jlptFilter);
      if (searchQuery) params.set('search', searchQuery);
      if (lessonFilter) params.set('lesson', lessonFilter);

      const res = await fetch(`/api/vocab?${params}`);
      const json = await res.json();
      if (json.success) {
        setVocabs(json.data);
        setPagination(json.pagination);
      }
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: '1', limit: '20' });
        if (jlptFilter) params.set('jlpt', jlptFilter);
        if (searchQuery) params.set('search', searchQuery);
        if (lessonFilter) params.set('lesson', lessonFilter);
        const res = await fetch(`/api/vocab?${params}`);
        const json = await res.json();
        if (!cancelled && json.success) {
          setVocabs(json.data);
          setPagination(json.pagination);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [jlptFilter, searchQuery, lessonFilter]);

  const handleDelete = async (id: string, word: string) => {
    if (!confirm(`Xoá từ "${word}"?`)) return;
    const res = await fetch(`/api/vocab/${id}`, { method: 'DELETE' });
    if (res.ok) fetchPage(pagination.page);
  };


  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/vocab/import-csv', { method: 'POST', body: fd });
      const json = await res.json();
      setUploadResult(json);
      if (json.success) fetchPage(1);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý Từ vựng</h1>
          <p className={styles.subtitle}>
            {pagination.total.toLocaleString()} từ vựng trong hệ thống
          </p>
        </div>
        <div className={styles.headerActions}>
          <a
            href="/templates/vocab_template.csv"
            download
            className={styles.btnOutline}
          >
            <Download size={15} /> Tải file mẫu CSV
          </a>
          <label className={`${styles.btnOutline} ${uploading ? styles.btnDisabled : ''}`}>
            <Upload size={15} />
            {uploading ? 'Đang import...' : 'Import CSV'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              hidden
              onChange={handleCSVUpload}
              disabled={uploading}
            />
          </label>
          <Link href="/admin/tu-vung/them" className={styles.btnPrimary}>
            <Plus size={15} /> Thêm từ vựng
          </Link>
        </div>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className={`${styles.uploadResult} ${uploadResult.error || (uploadResult.failed ?? 0) > 0 ? styles.uploadError : styles.uploadSuccess}`}>
          {uploadResult.error ? (
            <span><XCircle size={16} /> {uploadResult.error}</span>
          ) : (
            <span>
              <CheckCircle size={16} />
              Import thành công <strong>{uploadResult.imported}</strong> từ
              {(uploadResult.failed ?? 0) > 0 && `, thất bại ${uploadResult.failed} từ`}
            </span>
          )}
          {uploadResult.errors?.map((e, i) => (
            <div key={i} className={styles.uploadErrorLine}>• {e}</div>
          ))}
          <button onClick={() => setUploadResult(null)} className={styles.uploadClose}>✕</button>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm từ vựng, furigana, Hán Việt..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchPage(1)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <Filter size={14} />
          <select value={jlptFilter} onChange={e => setJlptFilter(e.target.value)} className={styles.select}>
            {JLPT_OPTIONS.map(j => <option key={j} value={j}>{j || 'Tất cả JLPT'}</option>)}
          </select>
          <input
            type="text"
            placeholder="Lọc theo bài (vd: Bài 1)"
            value={lessonFilter}
            onChange={e => setLessonFilter(e.target.value)}
            className={styles.selectInput}
          />
          <button onClick={() => fetchPage(1)} className={styles.btnSearch}>Lọc</button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loading}><Loader2 size={28} className={styles.spinner} /> Đang tải...</div>
        ) : vocabs.length === 0 ? (
          <div className={styles.empty}>Chưa có từ vựng nào. Hãy thêm hoặc import CSV!</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Từ vựng</th>
                <th>Đọc</th>
                <th>Hán Việt</th>
                <th>Nghĩa</th>
                <th>JLPT</th>
                <th>Bài</th>
                <th>Chủ đề</th>
                <th>Từ loại</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vocabs.map(v => (
                <tr key={v.id} className={!v.is_active ? styles.rowInactive : ''}>
                  <td className={styles.wordCell}>
                    <span className={styles.wordJa}>{v.word}</span>
                  </td>
                  <td className={styles.readingCell}>{v.reading}</td>
                  <td>{v.han_viet}</td>
                  <td className={styles.meaningsCell}>
                    {v.meanings.slice(0, 2).join(', ')}
                    {v.meanings.length > 2 && <span className={styles.more}>+{v.meanings.length - 2}</span>}
                  </td>
                  <td><span className={`${styles.badge} ${styles[`badge${v.jlpt_level}`]}`}>{v.jlpt_level}</span></td>
                  <td className={styles.lessonCell}>{v.lesson}</td>
                  <td className={styles.topicCell}>
                    {v.topic.slice(0, 2).map(t => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </td>
                  <td className={styles.posCell}>
                    {v.part_of_speech[0]}
                  </td>
                  <td className={styles.actionCell}>
                    <Link href={`/admin/tu-vung/${v.id}/sua`} className={styles.btnEdit} title="Sửa">
                      <Edit2 size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(v.id, v.word)}
                      className={styles.btnDelete}
                      title="Xoá"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => fetchPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className={styles.pageBtn}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.pageInfo}>
            Trang {pagination.page} / {pagination.totalPages}
            &nbsp;·&nbsp; {pagination.total} từ
          </span>
          <button
            onClick={() => fetchPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className={styles.pageBtn}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
