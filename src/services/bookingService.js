import { supabase } from '../lib/supabaseClient';

// ─── Create Booking ────────────────────────────────────────────────────────────
export const createBooking = async ({
  venueId,
  customerId,
  eventDate,
  eventEndDate,
  guests,
  notes,
  totalPrice,
  // legacy fields still supported
  booking_date,
  slot,
  number_of_guests,
  total_price,
  customer_id,
  venue_id,
  status,
  payment_status,
}) => {
  const payload = {
    venue_id:         venue_id    || venueId,
    customer_id:      customer_id || customerId,
    booking_date:     booking_date || eventDate,
    event_end_date:   eventEndDate   || null,
    slot:             slot           || 'evening',
    number_of_guests: number_of_guests || guests,
    total_price:      total_price      || totalPrice || 0,
    notes:            notes            || null,
    status:           status           || 'pending_approval',
    payment_status:   payment_status   || 'unpaid',
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ─── Customer: get own bookings ───────────────────────────────────────────────
export const getCustomerBookings = async (customerId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      venue:venues(id, name, address, area, city, price_per_plate, price_per_day, min_spending,
        venue_images(storage_path, is_cover))
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Alias used by hooks
export const getMyBookings = getCustomerBookings;

// ─── Vendor: get bookings for own venues ─────────────────────────────────────
export const getVendorBookings = async (vendorId) => {
  const { data: venues, error: venuesError } = await supabase
    .from('venues')
    .select('id')
    .eq('vendor_id', vendorId);

  if (venuesError) throw venuesError;
  if (!venues || venues.length === 0) return [];

  const venueIds = venues.map((v) => v.id);

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      venue:venues(id, name, address, area, city, price_per_plate, min_spending),
      customer:profiles!bookings_customer_id_fkey(id, full_name, phone)
    `)
    .in('venue_id', venueIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ─── Admin: all bookings ──────────────────────────────────────────────────────
export const getAllBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      venue:venues(id, name, address, area, city, price_per_plate, min_spending),
      customer:profiles!bookings_customer_id_fkey(id, full_name, phone)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ─── Get bookings for a venue (availability check) ───────────────────────────
export const getVenueBookings = async (venueId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, booking_date, event_end_date, slot, status')
    .eq('venue_id', venueId)
    .neq('status', 'cancelled');

  if (error) throw error;
  return data || [];
};

// ─── Update booking status (vendor / admin) ───────────────────────────────────
export const updateBookingStatus = async (bookingId, status) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ─── Cancel booking (customer) ────────────────────────────────────────────────
export const cancelBooking = async (bookingId) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// A year, in seconds — receipts stay reachable for the whole dispute window.
const RECEIPT_URL_TTL_SECONDS = 60 * 60 * 24 * 365;

// ─── Upload payment receipt ───────────────────────────────────────────────────
export const uploadReceipt = async (bookingId, file, customerId) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${customerId}/${bookingId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `receipts/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('bookings')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Receipts hold payment details, so the bucket is private — hand out a
  // signed URL rather than a public one.
  const { data, error: signError } = await supabase.storage
    .from('bookings')
    .createSignedUrl(filePath, RECEIPT_URL_TTL_SECONDS);

  if (signError) throw signError;
  const receiptUrl = data.signedUrl;

  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({ receipt_url: receiptUrl, payment_status: 'pending_verification' })
    .eq('id', bookingId)
    .select()
    .single();

  if (updateError) throw updateError;
  return updatedBooking;
};

// ─── Verify payment (admin) ───────────────────────────────────────────────────
export const verifyPayment = async (bookingId, isVerified) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      payment_status: isVerified ? 'paid' : 'unpaid',
      status:         isVerified ? 'paid' : 'pending_approval',
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
