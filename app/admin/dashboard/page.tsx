import {
  TrendingUp, TrendingDown, Users, Eye, Activity, DollarSign,
  BookOpen, Search, AlertTriangle, CheckCircle, XCircle, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import styles from './Dashboard.module.css';

// ===== MOCK DATA =====
const OVERVIEW = [
  {
    id: 'traffic',
    label: 'Lượt truy cập (7 ngày)',
    value: '24,813',
    change: +12.4,
    icon: Eye,
    color: 'blue',
  },
  {
    id: 'new-users',
    label: 'Người dùng mới',
    value: '1,247',
    change: +8.2,
    icon: Users,
    color: 'green',
  },
  {
    id: 'dau',
    label: 'DAU (hôm nay)',
    value: '3,581',
    change: -2.1,
    icon: Activity,
    color: 'purple',
  },
  {
    id: 'revenue',
    label: 'Doanh thu tháng',
    value: '₫0',
    change: 0,
    icon: DollarSign,
    color: 'yellow',
    note: 'Sắp ra mắt khóa học trả phí',
  },
];

const TOP_LESSONS = [
  { rank: 1, title: 'Minna no Nihongo N5 – Quyển 1', views: 4812, completion: 78 },
  { rank: 2, title: 'Somatome N3 – Hán tự', views: 3201, completion: 62 },
  { rank: 3, title: 'Mimikara Oboeru N4 – Từ vựng', views: 2987, completion: 55 },
  { rank: 4, title: 'JLPT N2 – Đề thi 7/2023', views: 2456, completion: 88 },
  { rank: 5, title: 'Minna no Nihongo N5 – Quyển 2', views: 1923, completion: 71 },
];

const TRENDING_KEYWORDS = [
  { keyword: 'minna no nihongo', count: 1842, trend: 'up' },
  { keyword: 'đề thi jlpt n3', count: 1203, trend: 'up' },
  { keyword: 'somatome n5', count: 987, trend: 'stable' },
  { keyword: 'từ vựng n2', count: 834, trend: 'up' },
  { keyword: 'ngữ pháp n4', count: 721, trend: 'down' },
  { keyword: 'mimikara n4', count: 615, trend: 'stable' },
];

const NO_RESULT_KEYWORDS = [
  { keyword: 'kanji n1 2024', count: 312 },
  { keyword: 'bài kiểm tra n5 online', count: 267 },
  { keyword: 'audio minna n3', count: 198 },
  { keyword: 'giáo án lớp n5', count: 143 },
];

const SYSTEM_STATS = [
  { label: 'Tỷ lệ thoát (Bounce Rate)', value: '38.4%', status: 'warning', note: 'Mục tiêu < 40%' },
  { label: 'Tỷ lệ hoàn thành tải file', value: '91.2%', status: 'good', note: 'Tốt' },
  { label: 'Lỗi 404 trong 7 ngày', value: '127', status: 'warning', note: '/tu-vung/kanji phổ biến nhất' },
  { label: 'Báo cáo lỗi người dùng', value: '4', status: 'good', note: 'Tuần này' },
];

const ERROR_404_PATHS = [
  { path: '/tu-vung/kanji', hits: 89 },
  { path: '/tu-vung/flashcard', hits: 71 },
  { path: '/kaiwa/bai-1', hits: 43 },
  { path: '/jlpt/thi-thu', hits: 31 },
];

// ===== HELPERS =====
function ChangeChip({ change }: { change: number }) {
  if (change === 0) return <span className={`${styles.chip} ${styles.chipNeutral}`}>Không đổi</span>;
  const isUp = change > 0;
  return (
    <span className={`${styles.chip} ${isUp ? styles.chipUp : styles.chipDown}`}>
      {isUp ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
      {Math.abs(change)}%
    </span>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <TrendingUp size={14} className={styles.trendUp} />;
  if (trend === 'down') return <TrendingDown size={14} className={styles.trendDown} />;
  return <Minus size={14} className={styles.trendStable} />;
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'good') return <CheckCircle size={14} className={styles.statusGood} />;
  if (status === 'warning') return <AlertTriangle size={14} className={styles.statusWarning} />;
  return <XCircle size={14} className={styles.statusBad} />;
}

// ===== COMPONENT (không phải page — được import bởi (protected)/dashboard/page.tsx) =====
export function AdminDashboardContent() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageDate}>{dateStr} · Dữ liệu mô phỏng (Mock)</p>
        </div>
        <span className={styles.mockBadge}>MOCK DATA</span>
      </div>

      {/* ==============================
          SECTION 1: OVERVIEW
      ============================== */}
      <section className={styles.section} id="overview">
        <h2 className={styles.sectionTitle}>
          <Eye size={16} /> Tổng quan
        </h2>
        <div className={styles.overviewGrid}>
          {OVERVIEW.map(({ id, label, value, change, icon: Icon, color, note }) => (
            <div key={id} className={`${styles.statCard} ${styles[`statCard_${color}`]}`}>
              <div className={styles.statCardTop}>
                <div className={`${styles.statIcon} ${styles[`statIcon_${color}`]}`}>
                  <Icon size={18} />
                </div>
                <ChangeChip change={change} />
              </div>
              <div className={styles.statValue}>{value}</div>
              <div className={styles.statLabel}>{label}</div>
              {note && <div className={styles.statNote}>{note}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ==============================
          SECTION 2: LEARNING ACTIVITY
      ============================== */}
      <section className={styles.section} id="learning">
        <h2 className={styles.sectionTitle}>
          <BookOpen size={16} /> Hoạt động học tập
        </h2>

        <div className={styles.learningGrid}>
          {/* Top Bài Học */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>🔥 Top tài liệu được xem</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tài liệu</th>
                    <th>Lượt xem</th>
                    <th>Hoàn thành</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_LESSONS.map((row) => (
                    <tr key={row.rank}>
                      <td className={styles.rankCell}>{row.rank}</td>
                      <td className={styles.titleCell}>{row.title}</td>
                      <td className={styles.numCell}>{row.views.toLocaleString()}</td>
                      <td className={styles.progressCell}>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${row.completion}%` }}
                          />
                        </div>
                        <span className={styles.progressLabel}>{row.completion}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Keywords */}
          <div className={styles.panelColumn}>
            {/* Trending */}
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>
                <Search size={14} /> Từ khóa thịnh hành
              </h3>
              <ul className={styles.keywordList}>
                {TRENDING_KEYWORDS.map((kw) => (
                  <li key={kw.keyword} className={styles.keywordItem}>
                    <span className={styles.keyword}>{kw.keyword}</span>
                    <span className={styles.keywordMeta}>
                      <span className={styles.keywordCount}>{kw.count.toLocaleString()}</span>
                      <TrendIcon trend={kw.trend} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* No Result Keywords */}
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>
                <AlertTriangle size={14} className={styles.statusWarning} /> Từ khóa thiếu kết quả
              </h3>
              <p className={styles.panelDesc}>Người dùng tìm kiếm nhưng không có tài liệu phù hợp — hãy bổ sung!</p>
              <ul className={styles.keywordList}>
                {NO_RESULT_KEYWORDS.map((kw) => (
                  <li key={kw.keyword} className={`${styles.keywordItem} ${styles.keywordItemWarn}`}>
                    <span className={styles.keyword}>&quot;{kw.keyword}&quot;</span>
                    <span className={styles.keywordCount}>{kw.count} lần</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================
          SECTION 3: SYSTEM HEALTH
      ============================== */}
      <section className={styles.section} id="system">
        <h2 className={styles.sectionTitle}>
          <AlertTriangle size={16} /> Hệ thống & Cải thiện
        </h2>

        <div className={styles.systemGrid}>
          {/* System Stats */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Chỉ số hệ thống</h3>
            <ul className={styles.systemStatList}>
              {SYSTEM_STATS.map((stat) => (
                <li key={stat.label} className={styles.systemStatItem}>
                  <StatusIcon status={stat.status} />
                  <div className={styles.systemStatInfo}>
                    <span className={styles.systemStatLabel}>{stat.label}</span>
                    <span className={styles.systemStatNote}>{stat.note}</span>
                  </div>
                  <span className={`${styles.systemStatValue} ${styles[`systemStat_${stat.status}`]}`}>
                    {stat.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 404 Paths */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>
              <XCircle size={14} className={styles.statusBad} /> Đường dẫn 404 nhiều nhất
            </h3>
            <p className={styles.panelDesc}>Những trang chưa tồn tại mà người dùng đang cố truy cập.</p>
            <ul className={styles.keywordList}>
              {ERROR_404_PATHS.map((p) => (
                <li key={p.path} className={`${styles.keywordItem} ${styles.keywordItemBad}`}>
                  <code className={styles.pathCode}>{p.path}</code>
                  <span className={styles.keywordCount}>{p.hits} lần</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
