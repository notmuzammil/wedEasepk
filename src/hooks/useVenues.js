import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import {
  getVenues,
  getVenueById,
  getVendorVenues,
  getPendingVenues,
  createVenue,
  updateVenue,
  updateVenueStatus,
  uploadVenueImage,
  searchVenues,
  deleteVenue,
  getAllVenuesAdmin
} from '../services/venueService';

/**
 * Paginated venue list hook for the public browse page.
 * Returns { data: { data, count }, isLoading, isError, ... }
 */
export const useVenuesList = (filters = {}) => {
  return useQuery({
    queryKey: ['venues-list', filters],
    queryFn: () => getVenues(filters),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2, // 2-minute stale window
  });
};

/**
 * Simple venue query (non-paginated) — used on HomePage for featured venues.
 * getVenues now returns { data, count } — unwrap data for backward compatibility.
 */
export const useVenues = (filters = {}) => {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: async () => {
      const result = await getVenues({ ...filters, limit: 50 });
      return result.data;
    },
    keepPreviousData: true,
  });
};

export const useVenueDetail = (id) => {
  return useQuery({
    queryKey: ['venue', id],
    queryFn: () => getVenueById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useVenueSearch = (query) => {
  return useQuery({
    queryKey: ['venue-search', query],
    queryFn: () => searchVenues(query),
    enabled: !!query && query.trim().length >= 2,
    staleTime: 1000 * 30,
  });
};

export const useMyVenues = () => {
  const { profile } = useAuthStore();
  return useQuery({
    queryKey: ['my-venues', profile?.id],
    queryFn: () => getVendorVenues(profile.id),
    enabled: !!profile?.id && profile.role === 'vendor',
  });
};

export const usePendingVenues = () => {
  const { profile } = useAuthStore();
  return useQuery({
    queryKey: ['pending-venues'],
    queryFn: getPendingVenues,
    enabled: !!profile?.id && profile.role === 'admin',
  });
};

export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: createVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-venues'] });
      showToast('Venue submitted successfully! Awaiting Admin approval.', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Failed to create venue', 'error');
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({ id, data }) => updateVenue(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-venues'] });
      queryClient.invalidateQueries({ queryKey: ['venue', variables.id] });
      showToast('Venue updated successfully!', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Failed to update venue', 'error');
    },
  });
};

export const useUpdateVenueStatus = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({ id, status }) => updateVenueStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-venues'] });
      queryClient.invalidateQueries({ queryKey: ['pending-venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues-list'] });
      showToast(`Venue status updated to ${variables.status}.`, 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Failed to update status', 'error');
    },
  });
};

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: deleteVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues-list'] });
      showToast('Venue deleted successfully.', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Failed to delete venue', 'error');
    },
  });
};

export const useAdminAllVenues = () => {
  const { profile } = useAuthStore();
  return useQuery({
    queryKey: ['admin-all-venues'],
    queryFn: getAllVenuesAdmin,
    enabled: !!profile?.id && profile?.role === 'admin',
    retry: 2,
    staleTime: 1000 * 60 * 2,
  });
};
