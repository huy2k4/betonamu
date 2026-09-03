'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, RotateCcw, ChevronRight, ChevronLeft,
  Volume2, CheckCircle, XCircle, AlertCircle, Loader2,
} from 'lucide-react';
import styles from './flashcard.module.css';

type Vocab = {
  id: string;
  word: string;
  reading: string;
  romaji: string;
  han_viet: string;
  meanings: string[];
  part_of_speech: string[];
  jlpt_level: string;
  vocab_examples?: { sentence: string; reading: string; translation: string }[];
};

type ReviewResult = 'known' | 'unknown' | 'hard';

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export default function FlashcardPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;
  const dayNumber = parseInt(params.day as string);

  const [words, setWords] = useState<Vocab[]>([]);
  const [reviewWords, setReviewWords] = useState<Vocab[]>([]); // từ cần ôn từ ngày trước
  const [allCards, setAllCards] = useState<Vocab[]>([]);       // words + reviewWords
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, ReviewResult>>({});
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [dayId, setDayId] = useState('');

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vocab/study-plan/${planId}/day/${dayNumber}`);
      const json = await res.json();
      if (json.success) {
        const main: Vocab[] = json.words ?? [];
        const review: Vocab[] = json.reviewWords ?? [];
        setWords(main);
        setReviewWords(review);
        setAllCards([...main, ...review]);
        setDayId(json.dayId ?? '');
      }
    } finally { setLoading(false); }
  }, [planId, dayNumber]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const currentCard = allCards[currentIdx];
  const isReviewCard = currentIdx >= words.length;

  const handleFlip = () => setFlipped(prev => !prev);

  const handleResult = async (result: ReviewResult) => {
    if (!currentCard) return;

    // Record result
    setResults(prev => ({ ...prev, [currentCard.id]: result }));

    // Log to DB
    await fetch('/api/vocab/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vocab_id: currentCard.id, plan_day_id: dayId, result }),
    });

    if (currentIdx < allCards.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setFlipped(false);
    } else {
      setDone(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) { setCurrentIdx(prev => prev - 1); setFlipped(false); }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setFlipped(false);
    setDone(false);
    setResults({});
  };

  const markDayComplete = async () => {
    // Update streak
    const knownCount = Object.values(results).filter(r => r === 'known').length;
    await fetch('/api/vocab/streak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words_count: knownCount }),
    });
    router.push(`/lo-trinh/${planId}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <Loader2 size={36} className={styles.spinner} />
        <p>Đang tải bộ thẻ...</p>
      </div>
    );
  }

  if (allCards.length === 0) {
    return (
      <div className={styles.loadingPage}>
        <p style={{ color: '#64748b' }}>Không có từ vựng nào cho ngày này.</p>
        <button onClick={() => router.back()} className={styles.backBtn}>← Quay lại</button>
      </div>
    );
  }

  /* ===== DONE SCREEN ===== */
  if (done) {
    const knownCount  = Object.values(results).filter(r => r === 'known').length;
    const hardCount   = Object.values(results).filter(r => r === 'hard').length;
    const unknownCount = Object.values(results).filter(r => r === 'unknown').length;
    const total = allCards.length;
    const pct = Math.round((knownCount / total) * 100);

    return (
      <div className={styles.donePage}>
        <div className={styles.doneCard}>
          <div className={styles.doneEmoji}>{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}</div>
          <h2 className={styles.doneTitle}>Hoàn thành ngày {dayNumber}!</h2>
          <div className={styles.doneProgress}>
            <div className={styles.doneProgressBar}>
              <div className={styles.doneProgressFill} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.donePct}>{pct}%</span>
          </div>
          <div className={styles.doneStats}>
            <div className={`${styles.doneStat} ${styles.statKnown}`}>
              <CheckCircle size={20} />
              <div className={styles.doneStatNum}>{knownCount}</div>
              <div className={styles.doneStatLabel}>Thuộc</div>
            </div>
            <div className={`${styles.doneStat} ${styles.statHard}`}>
              <AlertCircle size={20} />
              <div className={styles.doneStatNum}>{hardCount}</div>
              <div className={styles.doneStatLabel}>Khó</div>
            </div>
            <div className={`${styles.doneStat} ${styles.statUnknown}`}>
              <XCircle size={20} />
              <div className={styles.doneStatNum}>{unknownCount}</div>
              <div className={styles.doneStatLabel}>Chưa thuộc</div>
            </div>
          </div>

          {(hardCount + unknownCount) > 0 && (
            <div className={styles.doneHint}>
              💡 <strong>{hardCount + unknownCount} từ khó/chưa thuộc</strong> sẽ được hỏi lại ở ngày học tiếp theo.
            </div>
          )}

          <div className={styles.doneActions}>
            <button onClick={handleRestart} className={styles.btnRestart}>
              <RotateCcw size={16} /> Học lại
            </button>
            <button onClick={markDayComplete} className={styles.btnDone}>
              Xong · Về lộ trình →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ===== FLASHCARD ===== */
  const progressPct = ((currentIdx) / allCards.length) * 100;
  const currentResult = results[currentCard.id];

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={18} />
        </button>
        <div className={styles.topInfo}>
          <span className={styles.dayLabel}>Ngày {dayNumber}</span>
          {isReviewCard && <span className={styles.reviewBadge}>Ôn tập</span>}
        </div>
        <span className={styles.counter}>{currentIdx + 1} / {allCards.length}</span>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
      </div>

      {/* Flashcard */}
      <div className={styles.cardWrapper} onClick={handleFlip}>
        <div className={`${styles.card} ${flipped ? styles.cardFlipped : ''}`}>
          {/* Front */}
          <div className={styles.cardFront}>
            {isReviewCard && <div className={styles.reviewTag}>Ôn tập từ ngày trước</div>}
            <button
              onClick={e => { e.stopPropagation(); speak(currentCard.word); }}
              className={styles.speakBtn}
            >
              <Volume2 size={20} />
            </button>
            <div className={styles.cardWord}>{currentCard.word}</div>
            <div className={styles.cardReading}>{currentCard.reading}</div>
            <div className={styles.cardRomaji}>{currentCard.romaji}</div>
            <div className={styles.flipHint}>Nhấn để xem nghĩa →</div>
          </div>

          {/* Back */}
          <div className={styles.cardBack}>
            <div className={styles.cardWordBack}>{currentCard.word}</div>
            <div className={styles.cardReadingBack}>{currentCard.reading}</div>
            <div className={styles.cardHanViet}>{currentCard.han_viet}</div>
            <div className={styles.cardMeanings}>
              {currentCard.meanings.map((m, i) => (
                <div key={i} className={styles.cardMeaning}>{i + 1}. {m}</div>
              ))}
            </div>
            {currentCard.part_of_speech?.length > 0 && (
              <div className={styles.cardPos}>{currentCard.part_of_speech.join(' · ')}</div>
            )}
            {currentCard.vocab_examples?.[0] && (
              <div className={styles.cardExample}>
                <div className={styles.exSentence}>{currentCard.vocab_examples[0].sentence}</div>
                <div className={styles.exReading}>{currentCard.vocab_examples[0].reading}</div>
                <div className={styles.exTranslation}>{currentCard.vocab_examples[0].translation}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result buttons (only shown when flipped) */}
      {flipped && (
        <div className={styles.resultBtns}>
          <button
            onClick={() => handleResult('unknown')}
            className={`${styles.resultBtn} ${styles.btnUnknown} ${currentResult === 'unknown' ? styles.resultBtnActive : ''}`}
          >
            <XCircle size={18} /> Chưa thuộc
          </button>
          <button
            onClick={() => handleResult('hard')}
            className={`${styles.resultBtn} ${styles.btnHard} ${currentResult === 'hard' ? styles.resultBtnActive : ''}`}
          >
            <AlertCircle size={18} /> Khó
          </button>
          <button
            onClick={() => handleResult('known')}
            className={`${styles.resultBtn} ${styles.btnKnown} ${currentResult === 'known' ? styles.resultBtnActive : ''}`}
          >
            <CheckCircle size={18} /> Đã thuộc
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className={styles.navBtns}>
        <button onClick={handlePrev} disabled={currentIdx === 0} className={styles.navBtn}>
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => { setCurrentIdx(prev => prev + 1); setFlipped(false); }}
          disabled={currentIdx >= allCards.length - 1}
          className={styles.navBtn}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Mini progress dots */}
      <div className={styles.dots}>
        {allCards.map((w, i) => (
          <div
            key={w.id}
            className={`${styles.dot} ${
              results[w.id] === 'known' ? styles.dotKnown :
              results[w.id] === 'hard' ? styles.dotHard :
              results[w.id] === 'unknown' ? styles.dotUnknown :
              i === currentIdx ? styles.dotCurrent : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
}
