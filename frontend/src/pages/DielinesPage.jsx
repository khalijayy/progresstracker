import { useEffect, useState } from 'react';
import { measurementsService } from '../services/api';

const DielinesPage = () => {
  const [dielines, setDielines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await measurementsService.getAll();
        if (!mounted) return;
        const items = res.data || [];
        const diel = items.flatMap(m => (m.images || []).filter(src => /dieline/i.test(src)).map(src => ({ src, id: m._id })));
        setDielines(diel);
      } catch (e) {
        if (!mounted) return;
        setDielines([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dielines</h1>
      {loading ? (
        <div className="text-sm text-gray-500">Loading dielines...</div>
      ) : dielines.length === 0 ? (
        <div className="text-sm text-gray-500">No dieline images found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dielines.map((d, i) => (
            <div key={i} className="bg-white rounded shadow p-3">
              <img src={d.src} alt={`dieline-${i}`} className="w-full h-48 object-contain" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DielinesPage;
