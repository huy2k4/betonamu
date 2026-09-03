'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Compass,
  Sparkles,
  CalendarCheck2,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import styles from './tabs.module.css';

const JLPT_MILESTONES = [
  {
    level: 'N5',
    name: 'Sơ cấp 1',
    hours: '~150 giờ',
    outcome: 'Nắm vững bảng chữ cái Hiragana/Katakana, 800 từ vựng và giao tiếp cơ bản.',
    colorClass: 'levelN5',
    href: '/tai-lieu?level=N5',
  },
  {
    level: 'N4',
    name: 'Sơ cấp 2',
    hours: '~300 giờ',
    outcome: '1.500 từ vựng, nắm chắc ngữ pháp cơ bản, đọc hiểu các bài văn ngắn.',
    colorClass: 'levelN4',
    href: '/tai-lieu?level=N4',
  },
  {
    level: 'N3',
    name: 'Trung cấp',
    hours: '~450 giờ',
    outcome: '3.750 từ vựng, giao tiếp tự nhiên trong cuộc sống, đọc báo hiểu ý chính.',
    colorClass: 'levelN3',
    href: '/tai-lieu?level=N3',
  },
  {
    level: 'N2',
    name: 'Trung cao cấp',
    hours: '~600 giờ',
    outcome: '6.000 từ vựng, đủ năng lực làm việc trực tiếp tại doanh nghiệp Nhật Bản.',
    colorClass: 'levelN2',
    href: '/tai-lieu?level=N2',
  },
  {
    level: 'N1',
    name: 'Cao cấp',
    hours: '~900 giờ',
    outcome: '10.000 từ vựng, đọc hiểu bài luận, văn học chuyên sâu và đàm phán thương mại.',
    colorClass: 'levelN1',
    href: '/tai-lieu?level=N1',
  },
];

export default function RoadmapTab() {
  return (
    <div className={styles.roadmapContainer}>
      {/* 1. Roadmap Hero Banner */}
      <div className={styles.roadmapHero}>
        <div className={styles.roadmapHeroLeft}>
          <div className={styles.roadmapHeroBadge}>
            <Sparkles size={13} />
            Lộ trình học theo cấp độ JLPT
          </div>
          <h2 className={styles.roadmapHeroTitle}>
            Xây Lộ Trình & Chinh Phục Tiếng Nhật Từng Bước
          </h2>
          <p className={styles.roadmapHeroDesc}>
            Lộ trình học từ vựng được cá nhân hoá theo từng ngày. Tự do chia nhỏ bài học, kéo thả số lượng từ phù hợp với lịch trình bận rộn của bạn.
          </p>
        </div>

        <Link href="/tu-vung" className={styles.roadmapHeroBtn}>
          <Compass size={18} /> Bắt đầu tạo lộ trình
        </Link>
      </div>

      {/* 2. JLPT 5 Milestones Grid */}
      <div>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>🗺️ 5 Cột Mốc Chinh Phục JLPT</h3>
            <p className={styles.sectionSubtitle}>
              Khám phá yêu cầu kiến thức và lộ trình mục tiêu cho từng trình độ
            </p>
          </div>

          <Link href="/lo-trinh" className={styles.seeAllLink}>
            Xem lộ trình của bạn <ArrowRight size={15} />
          </Link>
        </div>

        <div className={styles.milestonesGrid}>
          {JLPT_MILESTONES.map((m) => (
            <Link key={m.level} href={m.href} className={styles.milestoneCard}>
              <div>
                <div className={styles.milestoneTop}>
                  <span className={`${styles.milestoneLevel} ${styles[m.colorClass]}`}>
                    {m.level}
                  </span>
                  <span className={styles.milestoneHourBadge}>{m.hours}</span>
                </div>
                <div className={styles.milestoneName}>{m.name}</div>
                <p className={styles.milestoneOutcome}>{m.outcome}</p>
              </div>

              <div className={styles.milestoneAction}>
                <span>Xem tài liệu {m.level}</span>
                <ArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. 3-Step Visual Guide */}
      <div className={styles.guideSection}>
        <h3 className={styles.guideTitle}>
          ✨ 3 Bước Xây Lộ Trình Học Thông Minh Cùng Betonamu
        </h3>

        <div className={styles.stepsRow}>
          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>1</div>
            <div>
              <h4 className={styles.stepHeading}>Chọn Bài Học</h4>
              <p className={styles.stepDesc}>
                Chọn bài Minna no Nihongo hoặc chủ đề từ vựng bạn muốn chinh phục trong kho từ vựng.
              </p>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>2</div>
            <div>
              <h4 className={styles.stepHeading}>Kéo Thả Ngày Học</h4>
              <p className={styles.stepDesc}>
                Phân chia số lượng từ vào từng ngày bằng thao tác kéo thả trực quan theo khả năng của bạn.
              </p>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>3</div>
            <div>
              <h4 className={styles.stepHeading}>Luyện & Giữ Streak</h4>
              <p className={styles.stepDesc}>
                Học Flashcard mỗi ngày, hệ thống tự động nhắc nhở từ hay quên và tích luỹ chuỗi Streak rực rỡ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
