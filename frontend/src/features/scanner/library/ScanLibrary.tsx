import { useState, useEffect } from 'react';
import { useScannerStore } from '../stores/scannerStore';
import { ScanCard } from './ScanCard';
import * as scannerApi from '../../../api/scannerApi';

interface ScanLibraryProps {
  onBack: () => void;
  onSelectScan: (scanId: string) => void;
}

type TabFilter = 'all' | 'active' | 'paused' | 'draft';

export function ScanLibrary({ onBack, onSelectScan }: ScanLibraryProps) {
  const { savedScans, setSavedScans, removeSavedScan } = useScannerStore();
  const [tab, setTab] = useState<TabFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    scannerApi.listScans()
      .then((scans) => setSavedScans(scans))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setSavedScans]);

  const filtered = tab === 'all'
    ? savedScans
    : savedScans.filter((s) => s.status === tab);

  const handleDelete = async (id: string) => {
    removeSavedScan(id);
    try { await scannerApi.deleteScan(id); } catch { /* optimistic */ }
  };

  const tabs: { value: TabFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'draft', label: 'Drafts' },
  ];

  return (
    <div className="sc-library">
      <div className="sc-library-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="sc-back-btn" onClick={onBack}>&larr; Back</button>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#e6edf3' }}>My Scans</span>
        </div>
      </div>

      <div className="sc-library-tabs">
        {tabs.map((t) => (
          <button
            key={t.value}
            className={`sc-library-tab ${tab === t.value ? 'sc-library-tab--active' : ''}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#8b949e' }}>Loading scans...</div>
      ) : filtered.length === 0 ? (
        <div className="sc-empty">
          <div className="sc-empty-title">No scans found</div>
          <div className="sc-empty-text">
            {tab === 'all'
              ? 'Create your first scan from the dashboard or templates.'
              : `No ${tab} scans.`}
          </div>
        </div>
      ) : (
        <div className="sc-scan-list">
          {filtered.map((scan) => (
            <ScanCard
              key={scan.id}
              scan={scan}
              onSelect={() => onSelectScan(scan.id)}
              onDelete={() => handleDelete(scan.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
