// Original implementation archived to ../.trash/useApi.js
// Kept as a safe stub to avoid breaking imports during cleanup.
export const useApi = () => {
  console.warn('useApi is archived and currently a stub. Restore from .trash/useApi.js if needed.');
  const execute = async () => { throw new Error('useApi is archived'); };
  return { data: null, error: null, loading: false, execute, setData: () => {} };
};