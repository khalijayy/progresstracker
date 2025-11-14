import { useEffect, useState } from 'react';
import { getLiveStatus } from '../services/liveService';

const Row = ({ label, value, percent }) => (
  <div className="mb-3">
    <div className="flex items-center justify-between text-sm mb-1">
      <span className="text-gray-700">{label}</span>
      <span className="text-gray-500">{value ?? '—'}</span>
    </div>
    <div className="w-full bg-gray-100 h-2 rounded overflow-hidden">
      <div className="h-2 bg-[#0d1b2a]" style={{ width: `${percent ?? 0}%` }} />
    </div>
  </div>
);

const LivePanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let timer;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getLiveStatus();
        if (!mounted) return;
        setData(res?.data ?? null);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err);
        setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    // Poll every 5 seconds
    timer = setInterval(fetchData, 5000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  // Expected data shape (example): { measurementCount, segmentationPct, dielineCount, creasingPct }
  const measurementCount = data?.measurementCount ?? '—';
  const segmentationPct = data?.segmentationPct ?? 0;
  const dielineCount = data?.dielineCount ?? '—';
  const creasingPct = data?.creasingPct ?? 0;

  return (
    <div className="bg-white border rounded-md p-3 text-sm shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800">Live Progress</h4>
        {loading && <span className="text-xs text-gray-400">Updating...</span>}
      </div>

      {error && (
        <div className="text-xs text-red-500 mb-2">Unable to fetch live data</div>
      )}

      <Row label="Measurements" value={measurementCount} percent={Math.min(100, measurementCount === '—' ? 0 : (Number(measurementCount) % 100))} />
      <Row label="Segmentation" value={`${segmentationPct}%`} percent={segmentationPct} />
      <Row label="Dielines" value={dielineCount} percent={Math.min(100, dielineCount === '—' ? 0 : (Number(dielineCount) % 100))} />
      <Row label="Creasing" value={`${creasingPct}%`} percent={creasingPct} />

      <div className="mt-2 text-xs text-gray-500">Note: display-only. Data will come from Raspberry Pi.</div>
      
      {/* Dieline preview removed here to avoid duplicate previews on the page.
          The main preview is shown at the top of the Progress page. */}
    </div>
  );
};

export default LivePanel;
