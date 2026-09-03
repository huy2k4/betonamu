'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, GripVertical, Plus, Trash2, Save, Volume2,
  ChevronDown, ChevronUp, BookOpen, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import styles from './bo-tu.module.css';

type Vocab = {
  id: string;
  word: string;
  reading: string;
  romaji: string;
  han_viet: string;
  meanings: string[];
  part_of_speech: string[];
  jlpt_level: string;
  lesson: string;
  topic: string[];
};

type DayPlan = {
  dayNumber: number;
  words: Vocab[];
};

// Text-to-speech helper
function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export default function BoTuVungPage() {
  const params = useParams();
  const router = useRouter();
  const boTuId = params['bo-tu'] as string;

  const [allWords, setAllWords] = useState<Vocab[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [days, setDays] = useState<DayPlan[]>([{ dayNumber: 1, words: [] }, { dayNumber: 2, words: [] }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [dragWord, setDragWord] = useState<Vocab | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [setTitle, setSetTitle] = useState('');

  const decodeBoTu = useCallback(() => {
    // boTuId format: lesson-N5-bai-1 hoặc topic-N5-dong-vat
    // Hỗ trợ cả URL cũ: lesson-N5-Ba%CC%80i-1 hoặc lesson-N5-Bài-1
    let cleanId = boTuId || '';
    try {
      cleanId = decodeURIComponent(cleanId).normalize('NFC');
    } catch {
      // ignore
    }

    const parts = cleanId.split('-');
    const type = parts[0]; // lesson | topic
    const jlpt = parts[1] || 'N5'; // N5
    const rest = parts.slice(2).join(' ').replace(/-/g, ' ');
    return { type, jlpt, rest };
  }, [boTuId]);

  useEffect(() => {
    const { type, jlpt, rest } = decodeBoTu();
    const topicMap: Record<string, string> = {
      'dong vat': 'Động vật', 'thuc vat': 'Thực vật', 'am thuc': 'Ẩm thực',
      'gia dinh': 'Gia đình', 'thoi tiet': 'Thời tiết', 'mau sac': 'Màu sắc',
      'thoi gian': 'Thời gian', 'co the': 'Cơ thể', 'quan ao': 'Quần áo',
      'phuong tien': 'Phương tiện', 'giao duc': 'Giáo dục', 'cong viec': 'Công việc',
      'noi chon': 'Nơi chốn', 'hanh dong': 'Hành động', 'cam xuc': 'Cảm xúc',
      'doi song': 'Đời sống', 'tu nhien': 'Thiên nhiên', 'tinh chat': 'Tính chất',
    };

    const params = new URLSearchParams({ jlpt, limit: '100' });
    let titleStr = '';

    if (type === 'lesson') {
      // Bóc tách số bài học (ví dụ "bai 1", "Bài 1", "1")
      const numMatch = rest.match(/\d+/);
      const lessonNum = numMatch ? numMatch[0] : rest;
      // Luôn chuẩn hóa NFC để không bao giờ bị lỗi font Tiếng Việt
      const cleanLessonTitle = `Bài ${lessonNum}`.normalize('NFC');
      params.set('lesson', cleanLessonTitle);
      titleStr = `${cleanLessonTitle} · ${jlpt}`;

      // Nếu URL cũ có dấu, chuyển hướng sang slug không dấu sạch sẽ
      const cleanSlug = `lesson-${jlpt}-bai-${lessonNum}`;
      if (boTuId !== cleanSlug && !boTuId.startsWith(`lesson-${jlpt}-bai-`)) {
        router.replace(`/tu-vung/${cleanSlug}`);
      }
    } else {
      const normalizedRest = rest.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      const topicName = (topicMap[normalizedRest] || rest).normalize('NFC');
      params.set('topic', topicName);
      titleStr = `${topicName} · ${jlpt}`;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setSetTitle(titleStr);
      try {
        const r = await fetch(`/api/vocab?${params}`);
        const json = await r.json();
        if (!cancelled && json.success) {
          setAllWords(json.data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [decodeBoTu, boTuId, router]);

  const toggleSelect = (id: string) => {
    setSelectedWords(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedWords(new Set(allWords.map(w => w.id)));
  const clearAll  = () => setSelectedWords(new Set());

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Drag from table → drop to day
  const handleDragStart = (word: Vocab) => setDragWord(word);
  const handleDragOver = (e: React.DragEvent, dayNum: number) => {
    e.preventDefault(); setDragOverDay(dayNum);
  };
  const handleDrop = (e: React.DragEvent, dayNum: number) => {
    e.preventDefault();
    if (!dragWord) return;
    setDays(prev => prev.map(d => {
      if (d.dayNumber !== dayNum) return d;
      if (d.words.some(w => w.id === dragWord.id)) return d; // already in day
      return { ...d, words: [...d.words, dragWord] };
    }));
    setDragWord(null);
    setDragOverDay(null);
  };

  // Drag selected words to day
  const addSelectedToDay = (dayNum: number) => {
    const wordsToAdd = allWords.filter(w => selectedWords.has(w.id));
    setDays(prev => prev.map(d => {
      if (d.dayNumber !== dayNum) return d;
      const existingIds = new Set(d.words.map(w => w.id));
      const newWords = wordsToAdd.filter(w => !existingIds.has(w.id));
      return { ...d, words: [...d.words, ...newWords] };
    }));
  };

  const removeFromDay = (dayNum: number, wordId: string) => {
    setDays(prev => prev.map(d =>
      d.dayNumber === dayNum ? { ...d, words: d.words.filter(w => w.id !== wordId) } : d
    ));
  };

  const addDay = () => setDays(prev => [...prev, { dayNumber: prev.length + 1, words: [] }]);
  const removeDay = (dayNum: number) => setDays(prev => prev.filter(d => d.dayNumber !== dayNum).map((d, i) => ({ ...d, dayNumber: i + 1 })));

  const savePlan = async () => {
    const totalWords = days.reduce((sum, d) => sum + d.words.length, 0);
    if (totalWords === 0) { alert('Hãy kéo ít nhất 1 từ vào lộ trình!'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/vocab/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: setTitle,
          jlpt_level: decodeBoTu().jlpt,
          days: days.map(d => ({
            day_number: d.dayNumber,
            vocab_ids: d.words.map(w => w.id),
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push(`/lo-trinh/${json.planId}`);
      } else {
        alert(json.error || 'Lỗi khi lưu lộ trình');
      }
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <Loader2 size={36} className={styles.spinner} />
        <p>Đang tải bộ từ vựng...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            Trang chủ
          </Link>
          <span className={styles.breadcrumbSep}>›</span>
          <Link href="/tu-vung" className={styles.breadcrumbLink}>
            Học từ vựng
          </Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{setTitle || 'Lập lộ trình'}</span>
        </nav>

        <div className={styles.page}>
          {/* Header */}
          <div className={styles.header}>
            <button onClick={() => router.back()} className={styles.backBtn}>
              <ArrowLeft size={16} /> Quay lại
            </button>
            <div className={styles.headerInfo}>
              <h1 className={styles.title}>{setTitle}</h1>
              <p className={styles.subtitle}>{allWords.length} từ vựng · Chọn hoặc kéo từ để phân chia lộ trình từng ngày</p>
            </div>
          </div>

      <div className={styles.layout}>
        {/* LEFT: từ vựng */}
        <div className={styles.wordList}>
          <div className={styles.wordListHeader}>
            <span className={styles.wordListTitle}>
              <BookOpen size={16} /> Danh sách từ ({selectedWords.size} đã chọn)
            </span>
            <div className={styles.wordListActions}>
              <button onClick={selectAll} className={styles.btnSm}>Chọn tất cả</button>
              <button onClick={clearAll} className={styles.btnSm}>Bỏ chọn</button>
            </div>
          </div>

          <div className={styles.table}>
            {allWords.map(word => (
              <div
                key={word.id}
                className={`${styles.wordRow} ${selectedWords.has(word.id) ? styles.wordRowSelected : ''}`}
                draggable
                onDragStart={() => handleDragStart(word)}
              >
                <div className={styles.wordRowMain}>
                  <button
                    className={styles.grip}
                    title="Kéo vào lộ trình"
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <GripVertical size={16} />
                  </button>
                  <input
                    type="checkbox"
                    checked={selectedWords.has(word.id)}
                    onChange={() => toggleSelect(word.id)}
                    className={styles.checkbox}
                  />
                  <div className={styles.wordJa}>{word.word}</div>
                  <div className={styles.wordReading}>{word.reading}</div>
                  <div className={styles.wordHanViet}>{word.han_viet}</div>
                  <div className={styles.wordMeaning}>
                    {word.meanings.slice(0, 2).join(', ')}
                  </div>
                  <div className={styles.wordActions}>
                    <button
                      onClick={() => speak(word.word)}
                      className={styles.btnIcon}
                      title="Phát âm"
                    >
                      <Volume2 size={14} />
                    </button>
                    <button
                      onClick={() => toggleExpand(word.id)}
                      className={styles.btnIcon}
                    >
                      {expandedRows.has(word.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedRows.has(word.id) && (
                  <div className={styles.wordExpanded}>
                    <div><span className={styles.expandLabel}>Romaji:</span> {word.romaji}</div>
                    <div><span className={styles.expandLabel}>Từ loại:</span> {word.part_of_speech.join(', ')}</div>
                    <div><span className={styles.expandLabel}>Chủ đề:</span> {word.topic.join(', ')}</div>
                    {word.meanings.length > 2 && (
                      <div><span className={styles.expandLabel}>Nghĩa đầy đủ:</span> {word.meanings.join(' / ')}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: lộ trình */}
        <div className={styles.planPanel}>
          <div className={styles.planHeader}>
            <span className={styles.planTitle}>📅 Lộ trình học</span>
            <button onClick={addDay} className={styles.addDayBtn}><Plus size={14} /> Thêm ngày</button>
          </div>

          {days.map(day => (
            <div
              key={day.dayNumber}
              className={`${styles.dayBox} ${dragOverDay === day.dayNumber ? styles.dayBoxOver : ''}`}
              onDragOver={e => handleDragOver(e, day.dayNumber)}
              onDrop={e => handleDrop(e, day.dayNumber)}
              onDragLeave={() => setDragOverDay(null)}
            >
              <div className={styles.dayHeader}>
                <span className={styles.dayLabel}>Ngày {day.dayNumber}</span>
                <div className={styles.dayActions}>
                  {selectedWords.size > 0 && (
                    <button
                      onClick={() => addSelectedToDay(day.dayNumber)}
                      className={styles.addSelectedBtn}
                      title={`Thêm ${selectedWords.size} từ đã chọn`}
                    >
                      +{selectedWords.size} từ
                    </button>
                  )}
                  {days.length > 1 && (
                    <button onClick={() => removeDay(day.dayNumber)} className={styles.removeDayBtn}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.dayWords}>
                {day.words.length === 0 ? (
                  <div className={styles.dropZone}>
                    <GripVertical size={20} className={styles.dropIcon} />
                    <span>Kéo từ vào đây</span>
                  </div>
                ) : (
                  day.words.map(w => (
                    <div key={w.id} className={styles.dayWord}>
                      <span className={styles.dayWordJa}>{w.word}</span>
                      <span className={styles.dayWordMeaning}>{w.meanings[0]}</span>
                      <button
                        onClick={() => removeFromDay(day.dayNumber, w.id)}
                        className={styles.removeWordBtn}
                      >×</button>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.dayCount}>{day.words.length} từ</div>
            </div>
          ))}

          <button
            onClick={savePlan}
            disabled={saving}
            className={styles.savePlanBtn}
          >
            {saving ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
            {saving ? 'Đang lưu...' : 'Lưu Lộ Trình'}
          </button>
        </div>
      </div>
    </div>
  </main>
  <Footer />
</div>
  );
}

