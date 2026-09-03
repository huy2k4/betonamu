'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Save, Loader2 } from 'lucide-react';
import styles from './them.module.css';

const JLPT_OPTIONS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const POS_OPTIONS = [
  'Danh từ', 'Động từ nhóm 1', 'Động từ nhóm 2', 'Động từ nhóm 3',
  'Tính từ い', 'Tính từ な', 'Trạng từ', 'Liên từ', 'Trợ từ', 'Cảm thán từ',
];
const TOPIC_OPTIONS = [
  'Động vật', 'Thực vật', 'Ẩm thực', 'Gia đình', 'Thời tiết',
  'Màu sắc', 'Số đếm', 'Thời gian', 'Cơ thể', 'Quần áo',
  'Phương tiện', 'Giáo dục', 'Công việc', 'Nơi chốn', 'Hành động',
  'Cảm xúc', 'Thương mại', 'Đời sống', 'Tính chất', 'Thiên nhiên',
];

type Example = { sentence: string; reading: string; translation: string };

export default function AdminAddVocabPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fields
  const [word, setWord] = useState('');
  const [reading, setReading] = useState('');
  const [romaji, setRomaji] = useState('');
  const [hanViet, setHanViet] = useState('');
  const [jlptLevel, setJlptLevel] = useState('N5');
  const [lesson, setLesson] = useState('');
  const [difficulty, setDifficulty] = useState(1);

  // Multi-value fields
  const [meanings, setMeanings] = useState<string[]>(['']);
  const [partOfSpeech, setPartOfSpeech] = useState<string[]>([]);
  const [topic, setTopic] = useState<string[]>([]);
  const [synonyms, setSynonyms] = useState('');
  const [antonyms, setAntonyms] = useState('');
  const [examples, setExamples] = useState<Example[]>([{ sentence: '', reading: '', translation: '' }]);

  const toggleMulti = (arr: string[], set: (v: string[]) => void, val: string) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/vocab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: word.trim(),
          reading: reading.trim(),
          romaji: romaji.trim() || null,
          han_viet: hanViet.trim() || null,
          jlpt_level: jlptLevel,
          lesson: lesson.trim() || null,
          difficulty,
          meanings: meanings.filter(Boolean),
          part_of_speech: partOfSpeech,
          topic,
          synonyms: synonyms.split('|').map(s => s.trim()).filter(Boolean),
          antonyms: antonyms.split('|').map(s => s.trim()).filter(Boolean),
          examples: examples.filter(ex => ex.sentence.trim()),
        }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error || 'Lỗi không xác định'); return; }
      router.push('/admin/tu-vung');
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
        <h1 className={styles.title}>Thêm từ vựng mới</h1>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* === Thông tin cơ bản === */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📝 Thông tin cơ bản</h2>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Từ vựng <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                value={word}
                onChange={e => setWord(e.target.value)}
                placeholder="無料"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Furigana <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                value={reading}
                onChange={e => setReading(e.target.value)}
                placeholder="むりょう"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Romaji</label>
              <input
                className={styles.input}
                value={romaji}
                onChange={e => setRomaji(e.target.value)}
                placeholder="muryou"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Hán Việt</label>
              <input
                className={styles.input}
                value={hanViet}
                onChange={e => setHanViet(e.target.value)}
                placeholder="Vô Liệu"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Cấp JLPT <span className={styles.req}>*</span></label>
              <select className={styles.select} value={jlptLevel} onChange={e => setJlptLevel(e.target.value)}>
                {JLPT_OPTIONS.map(j => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Bài (Minna no Nihongo)</label>
              <input
                className={styles.input}
                value={lesson}
                onChange={e => setLesson(e.target.value)}
                placeholder="Bài 1"
              />
            </div>
          </div>

          {/* Độ khó */}
          <div className={styles.field} style={{ marginTop: '1rem' }}>
            <label className={styles.label}>Độ khó: <strong>{difficulty}/5</strong></label>
            <input
              type="range"
              min={1} max={5} step={1}
              value={difficulty}
              onChange={e => setDifficulty(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
        </section>

        {/* === Nghĩa === */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🌏 Nghĩa</h2>
          {meanings.map((m, i) => (
            <div key={i} className={styles.rowWithBtn}>
              <input
                className={styles.input}
                value={m}
                onChange={e => {
                  const arr = [...meanings]; arr[i] = e.target.value; setMeanings(arr);
                }}
                placeholder={`Nghĩa ${i + 1} (vd: miễn phí)`}
              />
              {meanings.length > 1 && (
                <button
                  type="button"
                  onClick={() => setMeanings(meanings.filter((_, j) => j !== i))}
                  className={styles.removeBtn}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setMeanings([...meanings, ''])} className={styles.addRowBtn}>
            <Plus size={14} /> Thêm nghĩa
          </button>
        </section>

        {/* === Từ loại === */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🏷️ Từ loại</h2>
          <div className={styles.chipGroup}>
            {POS_OPTIONS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => toggleMulti(partOfSpeech, setPartOfSpeech, p)}
                className={`${styles.chip} ${partOfSpeech.includes(p) ? styles.chipActive : ''}`}
              >{p}</button>
            ))}
          </div>
        </section>

        {/* === Chủ đề === */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📂 Chủ đề</h2>
          <div className={styles.chipGroup}>
            {TOPIC_OPTIONS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => toggleMulti(topic, setTopic, t)}
                className={`${styles.chip} ${topic.includes(t) ? styles.chipActive : ''}`}
              >{t}</button>
            ))}
          </div>
        </section>

        {/* === Từ liên quan === */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔗 Từ liên quan</h2>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Từ đồng nghĩa (ngăn cách bởi |)</label>
              <input
                className={styles.input}
                value={synonyms}
                onChange={e => setSynonyms(e.target.value)}
                placeholder="タダ|無償"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Từ trái nghĩa (ngăn cách bởi |)</label>
              <input
                className={styles.input}
                value={antonyms}
                onChange={e => setAntonyms(e.target.value)}
                placeholder="有料"
              />
            </div>
          </div>
        </section>

        {/* === Câu ví dụ === */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📖 Câu ví dụ</h2>
          {examples.map((ex, i) => (
            <div key={i} className={styles.exampleBox}>
              <div className={styles.exampleHeader}>
                <span className={styles.exampleLabel}>Ví dụ {i + 1}</span>
                {examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setExamples(examples.filter((_, j) => j !== i))}
                    className={styles.removeBtn}
                  ><Trash2 size={14} /></button>
                )}
              </div>
              <input
                className={styles.input}
                value={ex.sentence}
                onChange={e => { const arr = [...examples]; arr[i].sentence = e.target.value; setExamples(arr); }}
                placeholder="このアプリは無料でダウンロードできます。"
              />
              <input
                className={`${styles.input} ${styles.inputSmall}`}
                value={ex.reading}
                onChange={e => { const arr = [...examples]; arr[i].reading = e.target.value; setExamples(arr); }}
                placeholder="Furigana câu ví dụ..."
              />
              <input
                className={styles.input}
                value={ex.translation}
                onChange={e => { const arr = [...examples]; arr[i].translation = e.target.value; setExamples(arr); }}
                placeholder="Ứng dụng này có thể tải xuống miễn phí."
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setExamples([...examples, { sentence: '', reading: '', translation: '' }])}
            className={styles.addRowBtn}
          ><Plus size={14} /> Thêm câu ví dụ</button>
        </section>

        {/* Submit */}
        <div className={styles.formActions}>
          <button type="button" onClick={() => router.back()} className={styles.btnCancel}>
            Huỷ
          </button>
          <button type="submit" disabled={saving} className={styles.btnSave}>
            {saving ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
            {saving ? 'Đang lưu...' : 'Lưu từ vựng'}
          </button>
        </div>
      </form>
    </div>
  );
}
