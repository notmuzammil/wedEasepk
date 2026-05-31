import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import {
  createBooking,
  getCustomerBookings,
  getVendorBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  uploadReceipt,
  verifyPayment,
  getVenueBookings
} from '../services/bookingService';

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      showToast('Booking request submitted! Awaiting vendor approval.', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Failed to request booking', 'error');
    }
  });
};

export const useCustomerBookings = () => {
  const { profile } = useAuthStore();
  return useQuery({
    queryKey: ['customer-bookings', profile?.id],
    queryFn: () => getCustomerBookings(profile.id),
    enabled: !!profile?.id && profile.role === 'customer'
  });
};

export const useVendorBookings = () => {
  const { profile } = useAuthStore();
  return useQuery({
    queryKey: ['vendor-bookings', profile?.id],
    queryFn: () => getVendorBookings(profile.id),
    enabled: !!profile?.id && profile.role === 'vendor'
  });
};

export const useAllBookings = () => {
  const { profile } = useAuthStore();
  return useQuery({
    queryKey: ['admin-bookings'],
    queryFn: getAllBookings,
    enabled: !!profile?.id && profile.role === 'admin'
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      showToast(`Booking request ${variables.status.replace('_', ' ')}.`, 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Failed to update booking', 'error');
    }
  });
};

export const useUploadReceipt = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({ bookingId, file }) => uploadReceipt(bookingId, file, profile.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      showToast('Receipt uploaded successfully! Awaiting verification.', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Failed to upload receipt', 'error');
    }
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({ bookingId, isVerified }) => verifyPayment(bookingId, isVerified),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      showToast(variables.isVerified ? 'Payment verified successfully!' : 'Payment marked as invalid.', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Failed to verify payment', 'error');
    }
  });
};

export const useVenueAvailability = (venueId) => {
  return useQuery({
    queryKey: ['venue-availability', venueId],
    queryFn: () => getVenueBookings(venueId),
    enabled: !!venueId
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: (bookingId) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      showToast('Booking cancelled successfully.', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Failed to cancel booking', 'error');
    }
  });
};
