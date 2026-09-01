import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import LeftSidebar from '@/components/LeftSidebar/LeftSidebar';
import RightSidebar from '@/components/RightSidebar/RightSidebar';
import TaiLieuCard from '@/components/TaiLieuCard/TaiLieuCard';
import HeroBannerCarousel, { BannerSlide } from '@/components/HeroBannerCarousel/HeroBannerCarousel';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { fixThumbnailUrl } from '@/utils/url';
import { TaiLieuCardProps } from '@/components/TaiLieuCard/TaiLieuCard';
import styles from './page.module.css';

// ===== DỮ LIỆU BANNER (thêm slide mới vào đây) =====
const HERO_BANNERS: BannerSlide[] = [
  {
    id: 'minna',
    image: '/assets/Mina-no-nihongo-Banner.jpg',
    alt: 'Minna no Nihongo Banner',
    badge: 'Phổ biến nhất',
    badgeHot: true,
    title: 'Minna no Nihongo',
    subtitle: 'Bộ giáo trình tiếng Nhật sơ cấp phổ biến nhất — từ N5 đến N3',
    ctaLabel: 'Xem tài liệu',
    ctaHref: '/tai-lieu#minna-no-nihongo',
  },
  {
    id: 'somatome',
    image: '/assets/somatome.jpeg',
    alt: 'Somatome Banner',
    badge: 'Luyện thi JLPT',
    title: 'Somatome N3 → N1',
    subtitle: 'Bộ sách luyện Hán tự, Từ vựng, Ngữ pháp theo từng cấp độ JLPT chuyên sâu.',
    ctaLabel: 'Khám phá ngay',
    ctaHref: '/tai-lieu?level=N3',
  },
  {
    id: 'mimikara',
    image: '/assets/mimikara-oboeru.webp',
    alt: 'Mimikara Oboeru Banner',
    badge: 'Luyện nghe',
    title: 'Mimikara Oboeru',
    subtitle: 'Học từ vựng N4–N2 qua âm thanh tự nhiên — ghi nhớ nhanh hơn, lâu hơn.',
    ctaLabel: 'Nghe thử ngay',
    ctaHref: '/tai-lieu?type=audio',
  },
];

export const metadata = {
  title: 'Betonamu — Kho tài liệu tiếng Nhật miễn phí',
  description:
    'Nền tảng học tiếng Nhật với kho tài liệu miễn phí: Minna no Nihongo, Somatome, Mimikara Oboeru và đề thi JLPT các năm.',
};

type IntentType = 'explore' | 'vocab' | 'exam' | 'listen' | 'teach' | 'plan';

interface HomePageProps {
  searchParams: Promise<{ intent?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { intent: intentParam } = await searchParams;
  const intent: IntentType = (intentParam as IntentType) ?? 'explore';

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch tài liệu — tuỳ intent filter theo type khác nhau
  let query = supabase.from('documents').select('*').order('created_at', { ascending: false });

  if (intent === 'exam') {
    query = query.eq('file_type', 'pdf').ilike('title', '%JLPT%');
  } else if (intent === 'listen') {
    query = query.eq('file_type', 'mp3');
  } else if (intent === 'vocab') {
    query = query.ilike('title', '%từ vựng%');
  } else if (intent === 'teach') {
    query = query.ilike('summary', '%giáo án%');
  }

  const { data: documents } = await query.limit(6);

  const featuredDocs: TaiLieuCardProps[] = (documents || []).map((doc) => {
    const fileSizeMb = doc.file_size_bytes
      ? (doc.file_size_bytes / (1024 * 1024)).toFixed(2) + ' MB'
      : 'Không xác định';

    let fileType: 'PDF' | 'MP3' | 'ZIP' | 'DOCX' = 'PDF';
    if (doc.file_type) {
      const type = doc.file_type.toUpperCase();
      if (['PDF', 'MP3', 'ZIP', 'DOCX'].includes(type)) {
        fileType = type as 'PDF' | 'MP3' | 'ZIP' | 'DOCX';
      }
    }

    return {
      slug: doc.slug,
      thumbnail: fixThumbnailUrl(doc.thumbnail_url),
      title: doc.title,
      description: doc.summary || 'Chưa có mô tả.',
      tags: ['Mới cập nhật'],
      level: 'N5',
      fileSize: fileSizeMb,
      fileType,
    };
  });

  // ===== Intent-based content config =====
  const INTENT_CONFIG: Record<IntentType, { title: string; subtitle: string; banner?: boolean; ctaHref?: string; ctaLabel?: string; emptyHint: string }> = {
    explore: {
      title: '📚 Tài liệu mới cập nhật',
      subtitle: 'Tổng hợp giáo trình, sách bài tập và tài liệu học tiếng Nhật mới nhất.',
      banner: true,
      ctaHref: '/tai-lieu',
      ctaLabel: 'Xem tất cả',
      emptyHint: 'Chưa có tài liệu nào. Hãy quay lại sau!',
    },
    vocab: {
      title: '🧠 Tài liệu luyện từ vựng',
      subtitle: 'Flashcard, sổ tay từ vựng theo cấp độ N5–N1.',
      ctaHref: '/tai-lieu?type=vocabulary',
      ctaLabel: 'Xem tất cả',
      emptyHint: 'Chưa có tài liệu từ vựng. Hãy thử "Khám phá tài liệu" để xem toàn bộ kho.',
    },
    exam: {
      title: '📝 Đề thi JLPT các năm',
      subtitle: 'Bộ đề thi chính thức và mô phỏng N5–N1 từ 2018 đến nay.',
      ctaHref: '/tai-lieu?type=exam',
      ctaLabel: 'Xem tất cả đề thi',
      emptyHint: 'Chưa có đề thi. Hãy thử "Khám phá tài liệu" để xem toàn bộ kho.',
    },
    listen: {
      title: '🎧 Tài liệu luyện nghe',
      subtitle: 'File audio bài học, hội thoại tự nhiên, nghe JLPT.',
      ctaHref: '/tai-lieu?type=audio',
      ctaLabel: 'Xem tất cả audio',
      emptyHint: 'Chưa có tài liệu audio. Hãy thử "Khám phá tài liệu" để xem toàn bộ kho.',
    },
    teach: {
      title: '👩‍🏫 Tài liệu soạn giáo án',
      subtitle: 'Slide bài giảng, bảng tổng hợp ngữ pháp và giáo án mẫu.',
      ctaHref: '/tai-lieu',
      ctaLabel: 'Xem thêm',
      emptyHint: 'Chưa có giáo án. Hãy thử "Khám phá tài liệu" để xem toàn bộ kho.',
    },
    plan: {
      title: '🗺️ Lộ trình học tiếng Nhật',
      subtitle: 'Tài liệu được sắp xếp theo lộ trình từ N5 đến N1.',
      ctaHref: '/tai-lieu',
      ctaLabel: 'Bắt đầu từ N5',
      emptyHint: 'Đang cập nhật lộ trình. Hãy thử "Khám phá tài liệu" để xem toàn bộ kho.',
    },
  };

  const config = INTENT_CONFIG[intent];

  // Fallback cards khi DB trống
  const FALLBACK_CARDS: TaiLieuCardProps[] = [
    {
      thumbnail: '/assets/minano-nihongo.jpg',
      title: 'Minna no Nihongo N5 – Quyển 1',
      description: 'Giáo trình tiếng Nhật sơ cấp phổ biến nhất. Phù hợp cho người mới bắt đầu.',
      tags: ['N5', 'Ebook', 'Sơ cấp'],
      level: 'N5',
      fileSize: '42 MB',
      fileType: 'PDF',
    },
    {
      thumbnail: '/assets/somatome.jpeg',
      title: 'Somatome N3 – Hán tự',
      description: 'Học 365 Hán tự N3 theo phương pháp lặp lại ngắt quãng.',
      tags: ['N3', 'Hán tự', 'JLPT'],
      level: 'N3',
      fileSize: '25 MB',
      fileType: 'PDF',
    },
    {
      thumbnail: '/assets/mimikara-oboeru.webp',
      title: 'Mimikara Oboeru N4 – Từ vựng',
      description: 'Luyện nghe từ vựng N4 qua âm thanh tự nhiên, phân loại theo chủ đề.',
      tags: ['N4', 'Audio', 'Từ vựng'],
      level: 'N4',
      fileSize: '92 MB',
      fileType: 'ZIP',
    },
    {
      thumbnail: '/assets/somatome.jpeg',
      title: 'JLPT N2 – Đề thi tháng 7/2023',
      description: 'Bộ đề thi N2 kỳ 7/2023 đầy đủ 3 phần: Từ vựng, Ngữ pháp và Nghe hiểu.',
      tags: ['N2', 'Đề thi', '2023'],
      level: 'N2',
      fileSize: '9 MB',
      fileType: 'PDF',
    },
  ];

  const displayDocs = featuredDocs.length > 0 ? featuredDocs : FALLBACK_CARDS;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <Header />
      </header>

      {/* LEFT SIDEBAR */}
      <div className={styles.leftSidebar}>
        <Suspense fallback={<div className={styles.sidebarSkeleton} />}>
          <LeftSidebar />
        </Suspense>
      </div>

      {/* MAIN AREA */}
      <main className={styles.mainArea}>

        {/* HERO BANNER CAROUSEL — chỉ hiện khi intent = explore */}
        {config.banner && (
          <HeroBannerCarousel slides={HERO_BANNERS} autoPlayInterval={5000} />
        )}

        {/* INTENT SECTION HEADER — hiện cho tất cả intent */}
        <section className={styles.featuredSection} aria-label={config.title}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>{config.title}</h2>
              <p className={styles.intentSubtitle}>{config.subtitle}</p>
            </div>
            {config.ctaHref && (
              <Link href={config.ctaHref} className={styles.sectionLink}>
                {config.ctaLabel} <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {/* PLAN intent: hiển thị lộ trình thay vì cards */}
          {intent === 'plan' ? (
            <div className={styles.roadmapGrid}>
              {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((level) => (
                <Link key={level} href={`/tai-lieu?level=${level}`} className={styles.roadmapCard}>
                  <span className={styles.roadmapLevel}>{level}</span>
                  <span className={styles.roadmapDesc}>
                    {level === 'N5' ? 'Sơ cấp 1 — Bảng chữ, giao tiếp cơ bản' :
                     level === 'N4' ? 'Sơ cấp 2 — Ngữ pháp căn bản' :
                     level === 'N3' ? 'Trung cấp — Đọc hiểu, hội thoại' :
                     level === 'N2' ? 'Trung cao cấp — Văn phong trang trọng' :
                     'Cao cấp — Đọc báo, văn học'}
                  </span>
                  <ArrowRight size={14} className={styles.roadmapArrow} />
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.cardsGrid}>
              {displayDocs.map((doc, i) => (
                <TaiLieuCard key={doc.slug ?? i} {...doc} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* RIGHT SIDEBAR */}
      <div className={styles.rightSidebar}>
        <RightSidebar />
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  );
}
