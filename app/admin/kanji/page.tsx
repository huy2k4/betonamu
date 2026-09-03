'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Plus, Upload, Download, Search, Filter, ChevronLeft,
  ChevronRight, Trash2, Edit2, CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import styles from '../tu-vung/tu-vung.module.css';

type Kanji = {
  id: string;
  character: string;
  han_viet: string;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  jlpt_level: string;
  stroke_count: number;
  is_active: boolean;
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };
const JLPT_OPTIONS = ['', 'N5', 'N4', 'N3', 'N2', 'N1'];

export default function AdminKanjiPage() {
  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [jlptFilter, setJlptFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ imported?: number; failed?: number; errors?: string[]; error?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchKanjis = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (jlptFilter) params.set('jlpt', jlptFilter);
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/kanji?${params}`);
      const json = await res.json();
      if (json.success) { setKanjis(json.data); setPagination(json.pagination); }
    } finally { setLoading(false); }
  }, [jlptFilter, searchQuery]);

  useEffect(() => { fetchKanjis(1); }, [fetchKanjis]);

  const handleDelete = async (id: string, char: string) => {
    if (!confirm(`Xoá kanji "${char}"?`)) return;
    await fetch(`/api/kanji/${id}`, { method: 'DELETE' });
    fetchKanjis(pagination.page);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/kanji/import-csv', { method: 'POST', body: fd });
      const json = await res.json();
      setUploadResult(json);
      if (json.success) fetchKanjis(1);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý Kanji</h1>
          <p className={styles.subtitle}>{pagination.total.toLocaleString()} kanji trong hệ thống</p>
        </div>
        <div className={styles.headerActions}>
          <a href="/templates/kanji_template.csv" download className={styles.btnOutline}>
            <Download size={15} /> Tải file mẫu CSV
          </a>
          <label className={`${styles.btnOutline} ${uploading ? styles.btnDisabled : ''}`}>
            <Upload size={15} />
            {uploading ? 'Đang import...' : 'Import CSV'}
            <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={handleCSVUpload} disabled={uploading} />
          </label>
          <Link href="/admin/kanji/them" className={styles.btnPrimary}>
            <Plus size={15} /> Thêm Kanji
          </Link>
        </div>
      </div>

      {uploadResult && (
        <div className={`${styles.uploadResult} ${uploadResult.error || (uploadResult.failed ?? 0) > 0 ? styles.uploadError : styles.uploadSuccess}`}>
          {uploadResult.error ? (
            <span><XCircle size={16} /> {uploadResult.error}</span>
          ) : (
            <span>
              <CheckCircle size={16} /> Import thành công <strong>{uploadResult.imported}</strong> kanji
              {(uploadResult.failed ?? 0) > 0 && `, thất bại ${uploadResult.failed}`}
            </span>
          )}
          {uploadResult.errors?.map((e, i) => <div key={i} className={styles.uploadErrorLine}>• {e}</div>)}
          <button onClick={() => setUploadResult(null)} className={styles.uploadClose}>✕</button>
        </div>
      )}

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kanji hoặc Hán Việt..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchKanjis(1)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <Filter size={14} />
          <select value={jlptFilter} onChange={e => setJlptFilter(e.target.value)} className={styles.select}>
            {JLPT_OPTIONS.map(j => <option key={j} value={j}>{j || 'Tất cả JLPT'}</option>)}
          </select>
          <button onClick={() => fetchKanjis(1)} className={styles.btnSearch}>Lọc</button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loading}><Loader2 size={28} className={styles.spinner} /> Đang tải...</div>
        ) : kanjis.length === 0 ? (
          <div className={styles.empty}>Chưa có kanji nào. Hãy thêm hoặc import CSV!</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Chữ Hán</th>
                <th>Hán Việt</th>
                <th>Nghĩa</th>
                <th>On&apos;yomi</th>
                <th>Kun&apos;yomi</th>
                <th>JLPT</th>
                <th>Số nét</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {kanjis.map(k => (
                <tr key={k.id} className={!k.is_active ? styles.rowInactive : ''}>
                  <td className={styles.wordCell}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>{k.character}</span>
                  </td>
                  <td>{k.han_viet}</td>
                  <td className={styles.meaningsCell}>
                    {k.meanings.slice(0, 2).join(', ')}
                    {k.meanings.length > 2 && <span className={styles.more}>+{k.meanings.length - 2}</span>}
                  </td>
                  <td className={styles.readingCell}>{k.onyomi.join('、')}</td>
                  <td className={styles.readingCell}>{k.kunyomi.join('、')}</td>
                  <td><span className={`${styles.badge} ${styles[`badge${k.jlpt_level}`]}`}>{k.jlpt_level}</span></td>
                  <td className={styles.posCell}>{k.stroke_count}</td>
                  <td className={styles.actionCell}>
                    <Link href={`/admin/kanji/${k.id}/sua`} className={styles.btnEdit} title="Sửa"><Edit2 size={14} /></Link>
                    <button onClick={() => handleDelete(k.id, k.character)} className={styles.btnDelete} title="Xoá"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button onClick={() => fetchKanjis(pagination.page - 1)} disabled={pagination.page <= 1} className={styles.pageBtn}><ChevronLeft size={16} /></button>
          <span className={styles.pageInfo}>Trang {pagination.page} / {pagination.totalPages} · {pagination.total} kanji</span>
          <button onClick={() => fetchKanjis(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className={styles.pageBtn}><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
