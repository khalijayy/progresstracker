import { useEffect, useState } from 'react';
import { measurementsService } from '../services/api';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

const filenameFromUrl = (url) => {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : url;
  } catch {
    const parts = url.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : url;
  }
};

const Badge = ({ children }) => (
  <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">{children}</span>
);

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await measurementsService.getAll();
        if (!mounted) return;
        const items = res.data || [];
        const imgs = items.flatMap((m) => (m.images || []).filter(Boolean).map((src, idx) => ({
          id: `${m._id}:${idx}`,
          src,
          filename: filenameFromUrl(src),
          measurementId: m._id,
          timestamp: m.createdAt || m.updatedAt || null,
        })));
        setImages(imgs);
      } catch (err) {
        if (!mounted) return;
        setImages([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchImages();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <div className="text-sm text-muted">{images.length} images</div>
      </div>

      <Card>
        {loading ? (
          <div className="text-sm text-gray-500">Loading images...</div>
        ) : images.length === 0 ? (
          <div className="text-sm text-gray-500">No images found in the database.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((img) => (
              <div key={img.id} className="relative rounded overflow-hidden bg-gray-50 hover:shadow-md transition"> 
                {img.measurementId && <Badge>Captured</Badge>}
                <button className="block w-full h-full" onClick={() => setLightbox(img)}>
                  <img src={img.src} alt={img.filename} className="w-full h-40 object-cover" />
                </button>
                <div className="p-2 text-xs text-muted truncate">{img.filename}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={!!lightbox} onClose={() => setLightbox(null)}>
        {lightbox && (
          <div className="p-4">
            <div className="mb-3 text-sm text-muted">{lightbox.filename}</div>
            <img src={lightbox.src} alt={lightbox.filename} className="w-full max-h-[70vh] object-contain rounded" />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GalleryPage;