import api from '../lib/axios';

// Fetch live status from backend (Raspberry Pi proxy or service)
// Expected backend endpoint: GET /live -> { measurementCount, segmentationPct, dielineCount, creasingPct }
export const getLiveStatus = () => api.get('/live');

// Check device / Raspberry Pi status. Backend should proxy this at GET /raspi/status
export const getDeviceStatus = () => api.get('/raspi/status');

export default { getLiveStatus };
