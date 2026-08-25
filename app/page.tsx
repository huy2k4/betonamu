import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Header />
      </header>
      
      <aside className={`${styles.leftAside} ${styles.gridItem}`}>Left Aside</aside>
      
      <section className={`${styles.banner} ${styles.gridItem}`}>Banner</section>
      
      <main className={`${styles.mainContent} ${styles.gridItem}`}>Main Content</main>
      
      <aside className={`${styles.rightAside} ${styles.gridItem}`}>Right Aside</aside>
      
      <section className={`${styles.bottomSection} ${styles.gridItem}`}>Bottom Section</section>
      
      <div style={{ gridArea: 'footer' }}>
        <Footer />
      </div>
    </div>
  );
}
