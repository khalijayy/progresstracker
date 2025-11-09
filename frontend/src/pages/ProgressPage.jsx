import LivePanel from '../components/LivePanel';
import { useEffect, useState } from 'react';
import { measurementsService } from '../services/api';
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

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Live Progress</h1>
        <div>
          <Button variant="secondary" size="sm">Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-medium">Live Overview</h2>
            <div className="mt-3 max-w-md">
              <Card className="p-3"><LivePanel /></Card>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium">Latest Measurement</h2>
            {loading && <p className="text-sm text-muted">Loading latest measurement...</p>}
            {error && <p className="text-sm text-rose-500">Unable to load measurements.</p>}
            {!loading && !latest && (
              <div className="text-sm text-muted mt-2">No measurements yet.</div>
            )}

            {latest && (
              <Card className="mt-3 p-4">
                {images.length > 0 ? (
                  <div>
                    <img src={images[0]} alt="capture" className="w-full h-56 object-cover rounded" />
                    {images.length > 1 && (
                      <div className="flex gap-2 mt-2">
                        {images.map((src, i) => (
                          <img key={i} src={src} alt={`img-${i}`} className="w-20 h-14 object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-56 bg-gray-50 flex items-center justify-center rounded">No image available</div>
                )}

                <div className="mt-4 text-sm">
                  <div className="mb-2"><strong>Status:</strong> {latest.status}</div>
                  <div className="mb-2"><strong>Captured:</strong> {new Date(latest.createdAt).toLocaleString()}</div>
                  <div className="mb-2"><strong>Dimensions:</strong></div>
                  {latest.dimensions ? (
                    <ul className="pl-4 list-disc text-sm">
                      <li>Length: {latest.dimensions.length ?? '—'} mm</li>
                      <li>Width: {latest.dimensions.width ?? '—'} mm</li>
                      <li>Height: {latest.dimensions.height ?? '—'} mm</li>
                    </ul>
                  ) : (
                    <div className="text-muted">No dimensions available</div>
                  )}
                  <div className="mt-2"><strong>Weight:</strong> {latest.weight ?? '—'}</div>
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
              </Card>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium">Details / Logs</h2>
          <Card className="mt-3 p-4 text-sm">
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

