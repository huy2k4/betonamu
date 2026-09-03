import { Suspense } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import LeftSidebar from '@/components/LeftSidebar/LeftSidebar';
import RightSidebar from '@/components/RightSidebar/RightSidebar';
import HomeContentTabs from '@/components/HomeContent/HomeContentTabs';
import { HomeTabId } from '@/components/HomeContent/types';
import { BannerSlide } from '@/components/HeroBannerCarousel/HeroBannerCarousel';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { fixThumbnailUrl } from '@/utils/url';
import { TaiLieuCardProps } from '@/components/TaiLieuCard/TaiLieuCard';
import styles from './page.module.css';

// ===== DỮ LIỆU BANNER CAROUSEL =====
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

// Fallback cards khi DB chưa có nhiều tài liệu
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
    thumbnail: '/assets/minano-nihongo.jpg',
    title: 'Minna no Nihongo N4 – Quyển 2',
    description: 'Nối tiếp quyển 1, hoàn thành ngữ pháp và từ vựng sơ cấp tiếng Nhật.',
    tags: ['N4', 'Ebook', 'Sơ cấp'],
    level: 'N4',
    fileSize: '45 MB',
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

export const metadata = {
  title: 'Betonamu — Nền tảng học tiếng Nhật & Kho tài liệu miễn phí',
  description:
    'Nền tảng học tiếng Nhật toàn diện: Kho tài liệu Minna no Nihongo, Somatome, Flashcard từ vựng Spaced Repetition và lộ trình học cá nhân hoá.',
};

interface HomePageProps {
  searchParams: Promise<{ tab?: string; intent?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tab, intent } = await searchParams;
  const initialTab: HomeTabId =
    tab === 'vocab' || intent === 'vocab'
      ? 'vocab'
      : tab === 'plan' || intent === 'plan'
      ? 'plan'
      : 'explore';

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch featured documents
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

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
      tags: ['Tài liệu chọn lọc'],
      level: (doc.level || 'N5') as 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
      fileSize: fileSizeMb,
      fileType: fileType,
    };
  });

  const displayDocs = featuredDocs.length > 0 ? featuredDocs : FALLBACK_CARDS;

  return (
    <div className={styles.container}>
      {/* 1. HEADER */}
      <header className={styles.header}>
        <Header />
      </header>

      {/* 2. LEFT SIDEBAR */}
      <div className={styles.leftSidebar}>
        <Suspense fallback={<div className={styles.sidebarSkeleton} />}>
          <LeftSidebar />
        </Suspense>
      </div>

      {/* 3. MAIN AREA: SEAMLESS FOLDER TABS COMPONENT */}
      <main className={styles.mainArea}>
        <Suspense fallback={<div style={{ minHeight: 480 }} />}>
          <HomeContentTabs
            initialTab={initialTab}
            featuredDocs={displayDocs}
            heroBanners={HERO_BANNERS}
          />
        </Suspense>
      </main>

      {/* 4. RIGHT SIDEBAR */}
      <div className={styles.rightSidebar}>
        <RightSidebar />
      </div>

      {/* 5. FOOTER */}
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  );
}
