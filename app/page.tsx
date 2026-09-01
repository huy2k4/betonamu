import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import LeftSidebar from '@/components/LeftSidebar/LeftSidebar';
import RightSidebar from '@/components/RightSidebar/RightSidebar';
import TaiLieuCard from '@/components/TaiLieuCard/TaiLieuCard';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { TaiLieuCardProps } from '@/components/TaiLieuCard/TaiLieuCard';
import styles from './page.module.css';

export const metadata = {
  title: 'Betonamu — Kho tài liệu tiếng Nhật miễn phí',
  description:
    'Nền tảng học tiếng Nhật với kho tài liệu miễn phí: Minna no Nihongo, Somatome, Mimikara Oboeru và đề thi JLPT các năm.',
};

const fixUrl = (url: string) => {
  if (!url) return url;
  let newUrl = url.replace('https://https://', 'https://').replace('https://https//', 'https://');
  newUrl = newUrl.replace(
    'https://f39ec6a63ea5e47ccdd6c1d892386666.r2.cloudflarestorage.com',
    'https://pub-3b036857fdd24996b2f83a969d8b61e8.r2.dev'
  );
  return newUrl;
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch 6 tài liệu mới nhất để hiển thị preview
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

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
      thumbnail: doc.thumbnail_url ? fixUrl(doc.thumbnail_url) : '/assets/minano-nihongo.jpg',
      title: doc.title,
      description: doc.summary || 'Chưa có mô tả.',
      tags: ['Mới cập nhật'],
      level: 'N5',
      fileSize: fileSizeMb,
      fileType,
    };
  });

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <Header />
      </header>

      {/* LEFT SIDEBAR */}
      <div className={styles.leftSidebar}>
        <LeftSidebar />
      </div>

      {/* MAIN AREA */}
      <main className={styles.mainArea}>
        {/* HERO BANNER */}
        <section className={styles.banner} aria-label="Banner Minna no Nihongo">
          <Image
            src="/assets/Mina-no-nihongo-Banner.jpg"
            alt="Minna no Nihongo Banner"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <span className={styles.bannerBadge}>
            <Flame size={12} /> Phổ biến nhất
          </span>
          <div className={styles.bannerContent}>
            <h1 className={styles.bannerTitle}>Minna no Nihongo</h1>
            <p className={styles.bannerSubtitle}>
              Bộ giáo trình tiếng Nhật sơ cấp phổ biến nhất — từ N5 đến N3
            </p>
            <Link href="/tai-lieu#minna-no-nihongo" className={styles.bannerCta}>
              Xem tài liệu <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* FEATURED DOCUMENTS */}
        <section className={styles.featuredSection} aria-label="Tài liệu mới cập nhật">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              📚 Tài liệu mới cập nhật
            </h2>
            <Link href="/tai-lieu" className={styles.sectionLink}>
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>

          {featuredDocs.length > 0 ? (
            <div className={styles.cardsGrid}>
              {featuredDocs.map((doc, i) => (
                <TaiLieuCard key={doc.slug ?? i} {...doc} />
              ))}
            </div>
          ) : (
            <div className={styles.cardsGrid}>
              {/* Fallback khi DB chưa có dữ liệu */}
              <TaiLieuCard
                thumbnail="/assets/minano-nihongo.jpg"
                title="Minna no Nihongo N5 – Quyển 1"
                description="Giáo trình tiếng Nhật sơ cấp phổ biến nhất. Phù hợp cho người mới bắt đầu."
                tags={['N5', 'Ebook', 'Sơ cấp']}
                level="N5"
                fileSize="42 MB"
                fileType="PDF"
              />
              <TaiLieuCard
                thumbnail="/assets/somatome.jpeg"
                title="Somatome N3 – Hán tự"
                description="Học 365 Hán tự N3 theo phương pháp lặp lại ngắt quãng."
                tags={['N3', 'Hán tự', 'JLPT']}
                level="N3"
                fileSize="25 MB"
                fileType="PDF"
              />
              <TaiLieuCard
                thumbnail="/assets/mimikara-oboeru.webp"
                title="Mimikara Oboeru N4 – Từ vựng"
                description="Luyện nghe từ vựng N4 qua âm thanh tự nhiên, phân loại theo chủ đề."
                tags={['N4', 'Audio', 'Từ vựng']}
                level="N4"
                fileSize="92 MB"
                fileType="ZIP"
              />
              <TaiLieuCard
                thumbnail="/assets/somatome.jpeg"
                title="JLPT N2 – Đề thi tháng 7/2023"
                description="Bộ đề thi N2 kỳ 7/2023 đầy đủ 3 phần: Từ vựng, Ngữ pháp và Nghe hiểu."
                tags={['N2', 'Đề thi', '2023']}
                level="N2"
                fileSize="9 MB"
                fileType="PDF"
              />
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
