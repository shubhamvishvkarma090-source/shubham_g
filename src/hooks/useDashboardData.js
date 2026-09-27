import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  claimEarningFeature,
  fetchActivity,
  fetchEarningFeatures,
  fetchLevels,
  fetchProfile,
  submitGameSession,
} from '../api/services.js';

export const useProfile = () => useQuery({ queryKey: ['profile'], queryFn: fetchProfile });
export const useLevels = () => useQuery({ queryKey: ['levels'], queryFn: fetchLevels, select: (d) => d.levels ?? [] });
export const useActivity = (limit = 20) =>
  useQuery({ queryKey: ['activity', limit], queryFn: () => fetchActivity(limit), select: (d) => d.activity ?? [] });
export const useEarningFeatures = () =>
  useQuery({ queryKey: ['earning-features'], queryFn: fetchEarningFeatures, select: (d) => d.features ?? [] });

function useInvalidateAll() {
  const qc = useQueryClient();
  return () =>
    Promise.all(['profile', 'levels', 'activity', 'earning-features'].map((k) => qc.invalidateQueries({ queryKey: [k] })));
}

export function useClaimFeature() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: claimEarningFeature, onSettled: invalidate });
}

export function useSubmitGame() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: submitGameSession, onSuccess: invalidate });
}
