import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/axios";
import { formatDate } from "../lib/utils";

const NoteDetailPage = () => {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchMeasurement = async () => {
      try {
        const res = await api.get(`/measurements/${id}`);
        if (mounted) setNote(res.data);
      } catch (error) {
        console.error("Failed to fetch measurement", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchMeasurement();
    return () => (mounted = false);
  }, [id]);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="btn btn-ghost mb-4">Back</Link>
          {loading ? (
            <div>Loading...</div>
          ) : !note ? (
            <div>Item not found</div>
          ) : (
            <div className="card bg-base-100">
              <div className="card-body">
                <h1 className="text-2xl font-bold mb-2">Measurement Details</h1>
                <p className="text-sm text-base-content/60 mb-4">{formatDate(new Date(note.createdAt))}</p>
                <p className="mb-2">Status: <strong>{note.status}</strong></p>
                {note.dimensions && (
                  <div className="mb-2">
                    <p>Dimensions:</p>
                    <ul>
                      <li>Length: {note.dimensions.length || '—'}</li>
                      <li>Width: {note.dimensions.width || '—'}</li>
                      <li>Height: {note.dimensions.height || '—'}</li>
                    </ul>
                  </div>
                )}
                {note.weight && <p>Weight: {note.weight}</p>}
                {note.images && note.images.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {note.images.map((src, i) => (
                      <img key={i} src={src} alt={`img-${i}`} className="w-40 h-40 object-cover" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteDetailPage;
