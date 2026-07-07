import Layout from '../components/Layout';
import HeroBanner from '../components/HeroBanner';
import VirtualGrid from '../components/VirtualGrid';
import useCatalogStore from '../stores/catalogStore';

export default function Home() {
  const syncStatus = useCatalogStore((s) => s.syncStatus);

  const header = (
    <>
      <HeroBanner />
      <div className="catalog-section" style={{ paddingBottom: 0 }}>
        <div className="section-header">
          <h2>Browse Catalog</h2>
          {syncStatus === 'syncing' && <span className="sync-badge">Syncing...</span>}
          {syncStatus === 'cached' && <span className="sync-badge cached">Offline Cache</span>}
        </div>
      </div>
    </>
  );

  return (
    <div className="home-page">
      <VirtualGrid header={header} />
    </div>
  );
}
