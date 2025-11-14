import LivePanel from '../components/LivePanel';
import DielinePreview from '../components/DielinePreview';
import { useEffect, useState, useRef } from 'react';
import { measurementsService } from '../services/api';
import { getLiveStatus } from '../services/liveService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ProgressPage = () => {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const res = await measurementsService.getAll();
        if (!mounted) return;
        const list = res.data || [];
        setLatest(list[0] || null);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err);
        setLatest(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLatest();
    const t = setInterval(fetchLatest, 5000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  const images = latest?.images || [];
  // Try to detect dieline image by filename
  const dielineImage = images.find((src) => /dieline/i.test(src));
  const segmentationImage = images.find((src) => /segment|segmentation/i.test(src));

  // live data for preview is handled inside the DielineChangeBox

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Live Progress</h1>
        <div>
          <Button variant="secondary" size="sm">Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Live Overview, Latest Measurement, Dieline Changes */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-medium mb-3">Live Overview</h2>
          <Card className="mb-6 p-4">
            <LivePanel />
          </Card>

          <h2 className="text-lg font-medium mb-3">Latest Measurement</h2>
          <Card className="mb-6 p-4">
            {loading && <p className="text-sm text-muted">Loading latest measurement...</p>}
            {error && <p className="text-sm text-rose-500">Unable to load measurements.</p>}
            {!loading && !latest && (
              <div className="text-sm text-muted mt-2">No measurements yet.</div>
            )}

            {latest && (
              <div>
                <div className="mb-3">
                  {images.length > 0 ? (
                    <img src={images[0]} alt="capture" className="w-full h-64 object-cover rounded" />
                  ) : (
                    <div className="h-64 bg-gray-50 flex items-center justify-center rounded">No image available</div>
                  )}
                </div>

                <div className="text-sm space-y-2">
                  <div><strong>Status:</strong> {latest.status}</div>
                  <div><strong>Captured:</strong> {new Date(latest.createdAt).toLocaleString()}</div>
                  <div>
                    <strong>Dimensions:</strong>
                    {latest.dimensions ? (
                      <ul className="pl-4 list-disc text-sm">
                        <li>Length: {latest.dimensions.length ?? '—'} mm</li>
                        <li>Width: {latest.dimensions.width ?? '—'} mm</li>
                        <li>Height: {latest.dimensions.height ?? '—'} mm</li>
                      </ul>
                    ) : (
                      <div className="text-muted">No dimensions available</div>
                    )}
                  </div>
                  <div><strong>Weight:</strong> {latest.weight ?? '—'}</div>
                </div>

                {dielineImage && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Dieline (flat carton)</h3>
                    <img src={dielineImage} alt="dieline" className="w-full object-contain border rounded" />
                  </div>
                )}

                {segmentationImage && !dielineImage && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Segmentation result</h3>
                    <img src={segmentationImage} alt="segmentation" className="w-full object-contain border rounded" />
                  </div>
                )}
              </div>
            )}
          </Card>

          <h2 className="text-lg font-medium mb-3">Dieline Changes</h2>
          <Card className="mb-6 p-4">
            <DielineChangeBox />
          </Card>
        </div>

        {/* Right: Details/Logs */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-medium mb-3">Details / Logs</h2>
          <Card className="p-4 text-sm">
            <p className="text-muted">This panel displays the latest image(s) captured by the Raspberry Pi and associated measurement data (dimensions, weight) and generated dieline/segmentation images if available.</p>
            <div className="mt-3">
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">{latest ? JSON.stringify(latest, null, 2) : 'No data'}</pre>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;

function DielineChangeBox() {
  const [live, setLive] = useState(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const [lastChangedAt, setLastChangedAt] = useState(null);
  const prevLiveRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoadingLive(true);
      try {
        const res = await getLiveStatus();
        if (!mounted) return;
        const next = res?.data ?? null;
        // detect any change vs previous and set lastChangedAt when something changed
        const prev = prevLiveRef.current;
        if (prev && next) {
          const keys = ['measurementCount', 'dielineCount', 'segmentationPct', 'creasingPct'];
          const changed = keys.some((k) => {
            const a = Number(prev[k]);
            const b = Number(next[k]);
            return (!Number.isNaN(a) && !Number.isNaN(b)) ? (a !== b) : false;
          });
          if (changed) setLastChangedAt(new Date());
        }
        prevLiveRef.current = next;
        setLive(next);
      } catch (err) {
        if (!mounted) return;
        setLive(null);
      } finally {
        if (mounted) setLoadingLive(false);
      }
    };

    fetch();
    const t = setInterval(fetch, 5000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-gray-700">Live values (updates every 5s)</div>
        {loadingLive && <div className="text-xs text-gray-400">Updating...</div>}
      </div>
      {live == null && (
        <div className="mb-2 text-sm text-yellow-600">No live data available — preview will show placeholders.</div>
      )}
      {/* Values removed per request - only the preview is shown here now */}

      {/* Compact dieline thumbnail for quick visual review inside the Changes box */}
      <div className="mt-2">
        <div className="w-full">{/* larger thumbnail: fill available width */}
          <DielinePreview
            measurementCount={live?.measurementCount ?? '—'}
            dielineCount={live?.dielineCount ?? '—'}
            segmentationPct={live?.segmentationPct ?? 0}
            creasingPct={live?.creasingPct ?? 0}
            highlight={false}
          />
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">This box shows the current live dieline values. Use this to review changes.</div>
      {lastChangedAt && (
        <div className="mt-2 text-xs text-gray-400">Last change detected: {new Date(lastChangedAt).toLocaleTimeString()}</div>
      )}
    </div>
  );
}




