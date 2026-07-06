import Layout from '../components/Layout';
import HeroBanner from '../components/HeroBanner';
import VirtualGrid from '../components/VirtualGrid';
import useCatalogStore from '../stores/catalogStore';

export default function Home() {
  const syncStatus = useCatalogStore((s) => s.syncStatus);

  return (
    <Layout>
      <HeroBanner />
      <section className="catalog-section">
        <div className="section-header">
          <h2>Browse Catalog</h2>
          {syncStatus === 'syncing' && <span className="sync-badge">Syncing...</span>}
          {syncStatus === 'cached' && <span className="sync-badge cached">Offline Cache</span>}
        </div>
        <VirtualGrid />
      </section>
    </Layout>
  );
}
