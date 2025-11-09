import { useEffect, useState } from 'react';
import { measurementsService } from '../services/api';
import { getDeviceStatus } from '../services/liveService';
import { Server, Archive, CheckCircle, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';

const DashboardPage = () => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);

  const [device, setDevice] = useState(null);
  const [deviceLoading, setDeviceLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await measurementsService.getAll();
        if (!mounted) return;
        setMeasurements(res.data || []);
      } catch (e) {
        if (!mounted) return;
        setMeasurements([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => { mounted = false; };
  }, []);

  // callable fetch for manual refresh (Refresh button)
  const fetchDevice = async () => {
    if (deviceLoading) return; // Prevent multiple simultaneous requests
    
    setDeviceLoading(true);
    try {
      const res = await getDeviceStatus();
      setDevice(res.data || null);
      // Update last seen timestamp
      if (res.data) {
        const updatedDevice = {
          ...res.data,
          lastSeen: new Date().toISOString()
        };
        setDevice(updatedDevice);
      }
    } catch (e) {
      console.error('Failed to fetch device status:', e);
      setDevice(null);
      toast.error('Failed to check device status. Please try again.');
    } finally {
      setDeviceLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setDeviceLoading(true);
      try {
        const res = await getDeviceStatus();
        if (!mounted) return;
        setDevice(res.data || null);
      } catch (e) {
        if (!mounted) return;
        setDevice(null);
      } finally {
        if (mounted) setDeviceLoading(false);
      }
    };

    run();
    const t = setInterval(run, 10000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  const total = measurements.length;
  const completed = measurements.filter(m => m.status === 'completed').length;
  const pending = measurements.filter(m => m.status === 'pending' || m.status === 'segmenting').length;
  const latest = measurements[0];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-body mb-2">Welcome to CartonIQ Dashboard</h1>
            <p className="text-sm text-muted">Monitor your system status and recent measurements</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => fetchDevice()} 
              disabled={deviceLoading}
            >
              <Server size={16} className={`mr-2 ${deviceLoading ? 'animate-spin' : ''}`} />
              {deviceLoading ? 'Checking...' : 'Check Status'}
            </Button>
          </div>
        </header>

        {/* Status Banner */}
        <Card className="bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-l-primary p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Server 
                className={`${
                  deviceLoading ? 'text-amber-500 animate-pulse' : 
                  device ? 'text-primary' : 'text-rose-500'
                }`} 
                size={24} 
              />
              <div>
                <div className="font-medium text-body">Raspberry Pi Status</div>
                <div className="text-sm text-muted mt-1">
                  {deviceLoading ? (
                    <span className="text-amber-600 flex items-center gap-2">
                      <Clock size={14} className="animate-spin" />
                      Checking connection...
                    </span>
                  ) : device ? (
                    <span className="text-emerald-600 flex items-center gap-2">
                      <CheckCircle size={14} />
                      Connected and running
                    </span>
                  ) : (
                    <span className="text-rose-500 flex items-center gap-2">
                      <Clock size={14} />
                      Offline — No connection
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              {device && (
                <div className="text-sm text-muted">
                  Last seen: {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : '—'}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchDevice()}
                disabled={deviceLoading}
                className="ml-2"
              >
                <svg
                  className={`w-4 h-4 ${deviceLoading ? 'animate-spin' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="sr-only">Refresh status</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            label="Total Measurements"
            value={loading ? '—' : total}
            icon={<Archive className="text-primary" size={20} />}
            trend={total > 0 ? '+1 today' : undefined}
            className="bg-white hover:shadow-lg transition-shadow"
          />
          <StatCard
            label="Completed"
            value={loading ? '—' : completed}
            icon={<CheckCircle className="text-emerald-500" size={20} />}
            trend={completed > 0 ? `${((completed/total) * 100).toFixed(1)}% success` : undefined}
            className="bg-white hover:shadow-lg transition-shadow"
          />
          <StatCard
            label="In Progress"
            value={loading ? '—' : pending}
            icon={<Clock className="text-amber-500" size={20} />}
            trend={pending > 0 ? 'Processing...' : 'All clear'}
            className="bg-white hover:shadow-lg transition-shadow"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Measurement Card */}
          <Card className="lg:col-span-2 overflow-hidden bg-white">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-body">Latest Measurement</h2>
                <div className="text-sm text-muted">
                  {latest ? new Date(latest.createdAt).toLocaleString() : 'No data'}
                </div>
              </div>
            </div>

            {latest ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    {latest.images && latest.images.length > 0 ? (
                      <>
                        <img 
                          src={latest.images[0]} 
                          alt="capture" 
                          className="w-full aspect-[4/3] object-cover rounded-lg shadow-sm" 
                        />
                        {latest.images.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {latest.images.map((src, i) => (
                              <img 
                                key={i} 
                                src={src} 
                                alt={`thumb-${i}`} 
                                className="w-24 h-16 object-cover rounded border hover:border-primary transition-colors cursor-pointer" 
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full aspect-[4/3] bg-gray-50 rounded-lg flex items-center justify-center text-muted">
                        No image available
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-4">
                        <div className="text-sm text-muted mb-1">Status</div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          latest.status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {latest.status}
                        </div>
                      </div>

                      {latest.weight && (
                        <div className="mb-4">
                          <div className="text-sm text-muted mb-1">Weight</div>
                          <div className="text-lg font-semibold">{latest.weight} g</div>
                        </div>
                      )}

                      {latest.dimensions && (
                        <div>
                          <div className="text-sm text-muted mb-2">Dimensions</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Length:</span>
                              <span className="font-medium">{latest.dimensions.length ?? '—'} mm</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Width:</span>
                              <span className="font-medium">{latest.dimensions.width ?? '—'} mm</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Height:</span>
                              <span className="font-medium">{latest.dimensions.height ?? '—'} mm</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-muted">
                No measurements recorded yet
              </div>
            )}
          </Card>

          {/* System Info Card */}
          <Card className="bg-white">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-body">System Status</h3>
            </div>
            
            <div className="p-6">
              {deviceLoading ? (
                <div className="text-center text-muted py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <div>Checking system status...</div>
                </div>
              ) : device ? (
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-muted mb-2">Device Details</div>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">IP Address:</span>
                        <span className="text-sm font-medium">{device.ip || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Model:</span>
                        <span className="text-sm font-medium">{device.model || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Uptime:</span>
                        <span className="text-sm font-medium">
                          {device.uptime ? `${Math.floor(device.uptime / 3600)}h ${Math.floor((device.uptime % 3600) / 60)}m` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted mb-2">System Health</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 rounded-lg p-4 text-center">
                        <div className="text-emerald-600 text-2xl font-semibold">99.9%</div>
                        <div className="text-sm text-muted mt-1">Uptime</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-blue-600 text-2xl font-semibold">{pending}</div>
                        <div className="text-sm text-muted mt-1">Active Jobs</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-rose-500 py-8">
                  <Server size={32} className="mx-auto mb-2" />
                  <div>System is currently offline</div>
                  <Button 
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => fetchDevice()}
                  >
                    Retry Connection
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;