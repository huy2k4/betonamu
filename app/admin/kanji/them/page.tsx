'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Save, Loader2 } from 'lucide-react';
import styles from '../../tu-vung/them/them.module.css';

const JLPT_OPTIONS = ['N5', 'N4', 'N3', 'N2', 'N1'];

function ArrayFields({
  label,
  arr,
  onAdd,
  onRemove,
  onChange,
  placeholder,
}: {
  label: string;
  arr: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
  placeholder: string;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {arr.map((v, i) => (
        <div key={i} className={styles.rowWithBtn} style={{ marginBottom: '0.4rem' }}>
          <input
            className={styles.input}
            value={v}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder={placeholder}
          />
          {arr.length > 1 && (
            <button type="button" onClick={() => onRemove(i)} className={styles.removeBtn}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={onAdd} className={styles.addRowBtn}>
        <Plus size={14} /> Thêm
      </button>
    </div>
  );
}

export default function AdminAddKanjiPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [character, setCharacter] = useState('');
  const [hanViet, setHanViet] = useState('');
  const [jlptLevel, setJlptLevel] = useState('N5');
  const [strokeCount, setStrokeCount] = useState('');
  const [frequency, setFrequency] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [notes, setNotes] = useState('');
  const [strokeOrderUrl, setStrokeOrderUrl] = useState('');

  const [onyomi, setOnyomi] = useState<string[]>(['']);
  const [kunyomi, setKunyomi] = useState<string[]>(['']);
  const [meanings, setMeanings] = useState<string[]>(['']);
  const [radicals, setRadicals] = useState<string[]>(['']);
  const [examples, setExamples] = useState<string[]>(['']);
  const [tags, setTags] = useState('');

  const handleArrChange = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (i: number, val: string) => {
    setter((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const handleArrAdd = (setter: React.Dispatch<React.SetStateAction<string[]>>) => () => {
    setter((prev) => [...prev, '']);
  };

  const handleArrRemove = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (i: number) => {
    setter((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/kanji', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: character.trim(),
          han_viet: hanViet.trim() || null,
          jlpt_level: jlptLevel,
          stroke_count: parseInt(strokeCount) || null,
          frequency: parseInt(frequency) || null,
          mnemonic: mnemonic.trim() || null,
          notes: notes.trim() || null,
          stroke_order_url: strokeOrderUrl.trim() || null,
          onyomi: onyomi.filter(Boolean),
          kunyomi: kunyomi.filter(Boolean),
          meanings: meanings.filter(Boolean),
          radicals: radicals.filter(Boolean),
          examples: examples.filter(Boolean),
          tags: tags.split('|').map((t) => t.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Lỗi không xác định');
        return;
      }
      router.push('/admin/kanji');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <h1 className={styles.title}>Thêm Kanji mới</h1>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Thông tin cơ bản */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🈶 Thông tin cơ bản</h2>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>
                Chữ Hán <span className={styles.req}>*</span>
              </label>
              <input
                className={styles.input}
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                placeholder="無"
                maxLength={5}
                required
                style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.1em' }}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Hán Việt</label>
              <input
                className={styles.input}
                value={hanViet}
                onChange={(e) => setHanViet(e.target.value)}
                placeholder="Vô"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Cấp JLPT</label>
              <select className={styles.select} value={jlptLevel} onChange={(e) => setJlptLevel(e.target.value)}>
                {JLPT_OPTIONS.map((j) => (
                  <option key={j}>{j}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Số nét</label>
              <input
                className={styles.input}
                type="number"
                value={strokeCount}
                onChange={(e) => setStrokeCount(e.target.value)}
                placeholder="12"
                min={1}
                max={64}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Thứ hạng phổ biến</label>
              <input
                className={styles.input}
                type="number"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="225"
                min={1}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Link thứ tự nét</label>
              <input
                className={styles.input}
                value={strokeOrderUrl}
                onChange={(e) => setStrokeOrderUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className={styles.field} style={{ marginTop: '1rem' }}>
            <label className={styles.label}>Tags (ngăn cách bởi |)</label>
            <input
              className={styles.input}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="bộ hoả|ký tự ghép"
            />
          </div>
        </section>

        {/* Âm đọc & Nghĩa */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔊 Âm đọc & Nghĩa</h2>
          <div className={styles.grid2}>
            <ArrayFields
              label="On'yomi"
              arr={onyomi}
              onAdd={handleArrAdd(setOnyomi)}
              onRemove={handleArrRemove(setOnyomi)}
              onChange={handleArrChange(setOnyomi)}
              placeholder="む"
            />
            <ArrayFields
              label="Kun'yomi"
              arr={kunyomi}
              onAdd={handleArrAdd(setKunyomi)}
              onRemove={handleArrRemove(setKunyomi)}
              onChange={handleArrChange(setKunyomi)}
              placeholder="ない"
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <ArrayFields
              label="Nghĩa *"
              arr={meanings}
              onAdd={handleArrAdd(setMeanings)}
              onRemove={handleArrRemove(setMeanings)}
              onChange={handleArrChange(setMeanings)}
              placeholder="vô lý, không"
            />
          </div>
        </section>

        {/* Bộ thủ & Ví dụ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📐 Bộ thủ & Từ ví dụ</h2>
          <div className={styles.grid2}>
            <ArrayFields
              label="Bộ thủ (Radical)"
              arr={radicals}
              onAdd={handleArrAdd(setRadicals)}
              onRemove={handleArrRemove(setRadicals)}
              onChange={handleArrChange(setRadicals)}
              placeholder="灬"
            />
            <ArrayFields
              label="Từ ví dụ"
              arr={examples}
              onAdd={handleArrAdd(setExamples)}
              onRemove={handleArrRemove(setExamples)}
              onChange={handleArrChange(setExamples)}
              placeholder="無料"
            />
          </div>
        </section>

        {/* Câu chuyện ghi nhớ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🧠 Câu chuyện ghi nhớ</h2>
          <div className={styles.field}>
            <label className={styles.label}>Mnemonic (câu chuyện)</label>
            <textarea
              className={styles.input}
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="Hình phạt bắt người nằm 𠂉 trên giàn 卌 lửa 灬 thiêu thật quá vô 無 lý"
              rows={3}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
          <div className={styles.field} style={{ marginTop: '0.75rem' }}>
            <label className={styles.label}>Ghi chú thêm</label>
            <textarea
              className={styles.input}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhớ bộ hoả 4 chấm nên dàn củi trên cũng có 4 cây đứng..."
              rows={2}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        </section>

        <div className={styles.formActions}>
          <button type="button" onClick={() => router.back()} className={styles.btnCancel}>
            Huỷ
          </button>
          <button type="submit" disabled={saving} className={styles.btnSave}>
            {saving ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
            {saving ? 'Đang lưu...' : 'Lưu Kanji'}
          </button>
        </div>
      </form>
    </div>
  );
}
