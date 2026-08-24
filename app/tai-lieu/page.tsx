import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import TaiLieuSection from '@/app/tai-lieu/TaiLieuSection';
import styles from './page.module.css';

export const metadata = {
  title: 'Tài liệu miễn phí | Betonamu',
  description:
    'Kho tài liệu tiếng Nhật miễn phí: Minna no Nihongo, Somatome, Mimikara Oboeru và đề thi JLPT các năm.',
};

export default function TaiLieuPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            Trang chủ
          </Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>Tài liệu miễn phí</span>
        </nav>

        <div className={styles.pageContent}>
          {/* Page heading */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              📚 Kho tài liệu tiếng Nhật miễn phí
            </h1>
            <p className={styles.pageSubtitle}>
              Tải về Ebook, Audio, Từ vựng và Giáo án – hoàn toàn miễn phí
            </p>
          </div>

          {/* Sections */}
          <TaiLieuSection
            id="minna-no-nihongo"
            title="Minna no Nihongo"
            hotLevel={3}
            books={[
              {
                thumbnail: '/assets/minano-nihongo.jpg',
                title: 'Minna no Nihongo N5 – Quyển 1',
                description:
                  'Giáo trình tiếng Nhật sơ cấp phổ biến nhất. Bao gồm bài học, bài tập và từ vựng cơ bản N5.',
                tags: ['N5', 'Ebook', 'Sơ cấp'],
                level: 'N5',
                fileSize: '42 MB',
                fileType: 'PDF',
              },
              {
                thumbnail: '/assets/minano-nihongo.jpg',
                title: 'Minna no Nihongo N5 – Từ vựng',
                description:
                  'Danh sách từ vựng đầy đủ N5 theo từng bài của Minna no Nihongo, kèm phiên âm romaji.',
                tags: ['N5', 'Từ vựng'],
                level: 'N5',
                fileSize: '8 MB',
                fileType: 'PDF',
              },
              {
                thumbnail: '/assets/minano-nihongo.jpg',
                title: 'Minna no Nihongo N5 – Audio',
                description:
                  'Bộ audio đầy đủ cho giáo trình Minna no Nihongo N5, định dạng MP3 chất lượng cao.',
                tags: ['N5', 'Audio', 'Nghe'],
                level: 'N5',
                fileSize: '230 MB',
                fileType: 'ZIP',
              },
              {
                thumbnail: '/assets/minano-nihongo.jpg',
                title: 'Minna no Nihongo N4 – Quyển 2',
                description:
                  'Giáo trình Minna no Nihongo tập 2 cho trình độ N4, gồm 25 bài học nâng cao.',
                tags: ['N4', 'Ebook', 'Sơ cấp'],
                level: 'N4',
                fileSize: '48 MB',
                fileType: 'PDF',
              },
              {
                thumbnail: '/assets/minano-nihongo.jpg',
                title: 'Minna no Nihongo N4 – Giáo Án',
                description:
                  'Giáo án chi tiết cho giáo viên dạy Minna no Nihongo N4, gồm kế hoạch bài dạy từng chương.',
                tags: ['N4', 'Giáo Án'],
                level: 'N4',
                fileSize: '15 MB',
                fileType: 'DOCX',
              },
            ]}
          />

          <TaiLieuSection
            id="somatome"
            title="Somatome (日本語総まとめ)"
            hotLevel={2}
            books={[
              {
                thumbnail: '/assets/somatome.jpeg',
                title: 'Somatome N5 – Từ vựng',
                description:
                  'Ôn luyện từ vựng N5 theo chủ đề, có ví dụ câu và bài tập kiểm tra cuối mỗi tuần.',
                tags: ['N5', 'Từ vựng', 'JLPT'],
                level: 'N5',
                fileSize: '18 MB',
                fileType: 'PDF',
              },
              {
                thumbnail: '/assets/somatome.jpeg',
                title: 'Somatome N4 – Ngữ pháp',
                description:
                  'Tổng hợp ngữ pháp N4 theo lộ trình 6 tuần, kèm bài tập mô phỏng đề thi JLPT.',
                tags: ['N4', 'Ngữ pháp', 'JLPT'],
                level: 'N4',
                fileSize: '22 MB',
                fileType: 'PDF',
              },
              {
                thumbnail: '/assets/somatome.jpeg',
                title: 'Somatome N3 – Hán tự',
                description:
                  'Học 365 Hán tự N3 theo phương pháp lặp lại ngắt quãng, bảng tra cứu đầy đủ.',
                tags: ['N3', 'Hán tự', 'JLPT'],
                level: 'N3',
                fileSize: '25 MB',
                fileType: 'PDF',
              },
              {
                thumbnail: '/assets/somatome.jpeg',
                title: 'Somatome N2 – Đọc hiểu',
                description:
                  'Bài tập đọc hiểu N2 dạng mô phỏng kỳ thi thật, 5 bài luyện tập mỗi tuần.',
                tags: ['N2', 'Đọc hiểu', 'JLPT'],
                level: 'N2',
                fileSize: '30 MB',
                fileType: 'PDF',
              },
              {
                thumbnail: '/assets/somatome.jpeg',
                title: 'Somatome N1 – Nghe hiểu',
                description:
                  'Luyện nghe N1 với các bài tập audio phân loại theo dạng đề, kèm script đầy đủ.',
                tags: ['N1', 'Nghe', 'JLPT'],
                level: 'N1',
                fileSize: '180 MB',
                fileType: 'ZIP',
              },
            ]}
          />

          <TaiLieuSection
            id="mimikara-oboeru"
            title="Mimikara Oboeru (耳から覚える)"
            hotLevel={2}
            books={[
              {
                thumbnail: '/assets/mimikara-oboeru.webp',
                title: 'Mimikara Oboeru N5 – Bộ đầy đủ',
                description:
                  'Học từ vựng và ngữ pháp N5 qua phương pháp luyện nghe, kèm audio tiêu chuẩn.',
                tags: ['N5', 'Audio', 'Từ vựng'],
                level: 'N5',
                fileSize: '85 MB',
                fileType: 'ZIP',
              },
              {
                thumbnail: '/assets/mimikara-oboeru.webp',
                title: 'Mimikara Oboeru N4 – Từ vựng',
                description:
                  'Luyện nghe từ vựng N4 qua âm thanh tự nhiên, phân loại theo chủ đề và tình huống.',
                tags: ['N4', 'Audio', 'Từ vựng'],
                level: 'N4',
                fileSize: '92 MB',
                fileType: 'ZIP',
              },
              {
                thumbnail: '/assets/mimikara-oboeru.webp',
                title: 'Mimikara Oboeru N3 – Bộ đầy đủ',
                description:
                  'Trọn bộ Mimikara Oboeru N3 gồm sách PDF và audio MP3, phù hợp luyện thi JLPT.',
                tags: ['N3', 'Ebook', 'Audio'],
                level: 'N3',
                fileSize: '110 MB',
                fileType: 'ZIP',
              },
              {
                thumbnail: '/assets/mimikara-oboeru.webp',
                title: 'Mimikara Oboeru N2 – Ngữ pháp',
                description:
                  'Ngữ pháp N2 luyện qua âm thanh, nhớ cấu trúc câu bằng cách nghe lặp lại.',
                tags: ['N2', 'Audio', 'Ngữ pháp'],
                level: 'N2',
                fileSize: '75 MB',
                fileType: 'ZIP',
              },
              {
                thumbnail: '/assets/mimikara-oboeru.webp',
                title: 'Mimikara Oboeru N1 – Từ vựng',
                description:
                  'Từ vựng nâng cao N1 được phát âm chuẩn bởi người bản ngữ, kèm ví dụ câu thực tế.',
                tags: ['N1', 'Audio', 'Từ vựng'],
                level: 'N1',
                fileSize: '95 MB',
                fileType: 'ZIP',
              },
            ]}
          />

          {/* Đề thi section */}
          <TaiLieuSection
            id="de-thi"
            title="Đề thi JLPT các năm"
            hotLevel={1}
            isExamSection
            books={[
              {
                thumbnail: '/assets/somatome.jpeg',
                title: 'JLPT N5 – Đề thi tháng 7/2024',
                description:
                  'Đề thi thật JLPT N5 kỳ tháng 7 năm 2024, kèm đáp án đầy đủ và bảng điểm tham khảo.',
                tags: ['N5', 'Đề thi', '2024'],
                level: 'N5',
                fileSize: '5 MB',
                fileType: 'PDF',
              },
              {
                thumbnail: '/assets/somatome.jpeg',
                title: 'JLPT N4 – Đề thi tháng 7/2024',
                description:
                  'Đề thi thật JLPT N4 kỳ tháng 7 năm 2024, kèm đáp án và hướng dẫn giải chi tiết.',
                tags: ['N4', 'Đề thi', '2024'],
                level: 'N4',
                fileSize: '6 MB',
                fileType: 'PDF',
              },
              {
                thumbnail: '/assets/somatome.jpeg',
                title: 'JLPT N3 – Đề thi tháng 12/2023',
                description:
                  'Đề thi JLPT N3 kỳ tháng 12/2023 với đáp án chi tiết, kèm phân tích điểm mạnh yếu.',
                tags: ['N3', 'Đề thi', '2023'],
                level: 'N3',
                fileSize: '7 MB',
                fileType: 'PDF',
              },
              {
                thumbnail: '/assets/somatome.jpeg',
                title: 'JLPT N2 – Đề thi tháng 7/2023',
                description:
                  'Bộ đề thi N2 kỳ 7/2023 đầy đủ 3 phần: Từ vựng, Ngữ pháp và Nghe hiểu.',
                tags: ['N2', 'Đề thi', '2023'],
                level: 'N2',
                fileSize: '9 MB',
                fileType: 'PDF',
              },
              {
                thumbnail: '/assets/somatome.jpeg',
                title: 'JLPT N1 – Đề thi tháng 12/2022',
                description:
                  'Đề thi N1 kỳ 12/2022 cho trình độ cao cấp, kèm giải thích ngữ pháp và từ vựng khó.',
                tags: ['N1', 'Đề thi', '2022'],
                level: 'N1',
                fileSize: '11 MB',
                fileType: 'PDF',
              },
            ]}
          />
        </div>
      </main>
    </>
  );
}
