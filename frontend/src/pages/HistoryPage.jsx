import { useEffect, useState } from 'react';
import { measurementsService } from '../services/api';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';

const HistoryPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await measurementsService.getAll();
        if (!mounted) return;
        setList(res.data || []);
      } catch (e) {
        if (!mounted) return;
        setList([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">History</h1>
      <Card>
        {loading ? (
          <div className="text-sm text-muted">Loading history...</div>
        ) : list.length === 0 ? (
          <div className="text-sm text-muted">No history yet.</div>
        ) : (
          <div className="space-y-3">
            {list.map((m) => (
              <Link key={m._id} to={`/measurements/${m._id}`} className="block bg-surface rounded shadow p-3 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Measurement {m._id.slice(-6)}</div>
                    <div className="text-xs text-muted">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                  <div className={`text-sm ${m.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>{m.status}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default HistoryPage;
