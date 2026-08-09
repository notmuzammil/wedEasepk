import { supabase } from '../lib/supabaseClient';

const PAGE_LIMIT = 12;

/**
 * Fetch paginated list of LIVE/approved venues with flexible filters.
 *
 * @param {object} filters
 * @param {string}   [filters.city]
 * @param {number}   [filters.minPrice]
 * @param {number}   [filters.maxPrice]
 * @param {number}   [filters.minCapacity]
 * @param {string}   [filters.date]
 * @param {string[]} [filters.amenities]
 * @param {string}   [filters.sort]  — 'price_asc' | 'price_desc' | 'newest'
 * @param {number}   [filters.page]  — 1-based page number
 * @param {number}   [filters.limit]
 * @param {string}   [filters.status] — override status filter (default: 'approved')
 * @returns {Promise<{ data: object[], count: number }>}
 */
export const getVenues = async (filters = {}) => {
  const {
    city,
    area,
    type,
    query,
    minPrice,
    maxPrice,
    minCapacity,
    capacity,
    amenities = [],
    sort = 'newest',
    page = 1,
    limit = PAGE_LIMIT,
    status,
    priceRange,
  } = filters;

  const resolvedStatus = status || 'approved';
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let dbQuery = supabase
    .from('venues')
    .select('*, venue_images(storage_path, is_cover)', { count: 'exact' })
    .eq('status', resolvedStatus);

  // City filter — supports both 'city' and 'area' column names
  if (city) {
    dbQuery = dbQuery.or(`city.ilike.%${city}%,area.ilike.%${city}%`);
  } else if (area) {
    dbQuery = dbQuery.ilike('area', `%${area}%`);
  }

  // Type filter
  if (type) {
    dbQuery = dbQuery.eq('type', type);
  }

  // Text search on name
  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`);
  }

  // Numeric capacity filter — supports both 'capacity' and 'capacity_max'
  const capValue = minCapacity || (capacity ? parseInt(capacity, 10) : null);
  if (capValue) {
    dbQuery = dbQuery.or(`capacity.gte.${capValue},capacity_max.gte.${capValue}`);
  }

  // Price range filters — supports both price_per_plate and price_per_day
  const minP = minPrice;
  const maxP = maxPrice;
  if (minP) {
    dbQuery = dbQuery.or(`price_per_plate.gte.${minP},price_per_day.gte.${minP}`);
  }
  if (maxP) {
    dbQuery = dbQuery.or(`price_per_plate.lte.${maxP},price_per_day.lte.${maxP}`);
  }

  // Legacy priceRange string support (low/mid/high)
  if (priceRange === 'low') {
    dbQuery = dbQuery.lte('price_per_plate', 1500);
  } else if (priceRange === 'mid') {
    dbQuery = dbQuery.gt('price_per_plate', 1500).lte('price_per_plate', 3000);
  } else if (priceRange === 'high') {
    dbQuery = dbQuery.gt('price_per_plate', 3000);
  }

  // Amenities filter — array overlaps
  if (amenities && amenities.length > 0) {
    dbQuery = dbQuery.overlaps('amenities', amenities);
  }

  // Sorting
  switch (sort) {
    case 'price_asc':
      dbQuery = dbQuery.order('price_per_plate', { ascending: true, nullsFirst: false });
      break;
    case 'price_desc':
      dbQuery = dbQuery.order('price_per_plate', { ascending: false, nullsFirst: false });
      break;
    default:
      dbQuery = dbQuery.order('created_at', { ascending: false });
  }

  // Pagination range
  dbQuery = dbQuery.range(from, to);

  const { data, error, count } = await dbQuery;
  if (error) throw error;
  return { data: data || [], count: count || 0 };
};

/**
 * Fetch a single venue by ID, joining images, vendor profile, and reviews.
 */
export const getVenueById = async (id) => {
  const { data, error } = await supabase
    .from('venues')
    .select(`
      *,
      venue_images(id, storage_path, is_cover, display_order),
      vendor:profiles!venues_vendor_id_fkey(full_name, phone),
      reviews(id, rating, comment, created_at, customer:profiles!reviews_customer_id_fkey(full_name))
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Text search across name, city, description fields.
 * @param {string} query
 * @returns {Promise<object[]>}
 */
export const searchVenues = async (query) => {
  if (!query || query.trim().length < 2) return [];

  const { data, error } = await supabase
    .from('venues')
    .select('id, name, city, area, type, capacity, capacity_max, price_per_plate, price_per_day, venue_images(storage_path, is_cover)')
    .eq('status', 'approved')
    .or(`name.ilike.%${query}%,city.ilike.%${query}%,area.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(8)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getVendorVenues = async (vendorId) => {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getPendingVenues = async () => {
  const { data, error } = await supabase
    .from('venues')
    .select(`
      *,
      vendor:profiles!venues_vendor_id_fkey(full_name, phone)
    `)
    .eq('status', 'pending')  // sirf 'pending' — kyunke AddVenue.jsx mein yahi set ho rahi hai
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const createVenue = async (venueData) => {
  const { data, error } = await supabase
    .from('venues')
    .insert([venueData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateVenue = async (venueId, venueData) => {
  const { data, error } = await supabase
    .from('venues')
    .update(venueData)
    .eq('id', venueId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateVenueStatus = async (venueId, status) => {
  const { data, error } = await supabase
    .from('venues')
    .update({ status })
    .eq('id', venueId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const uploadVenueImage = async (file, vendorId) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${vendorId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `venue-photos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('venue-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('venue-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const deleteVenue = async (venueId) => {
  const { data, error } = await supabase
    .from('venues')
    .delete()
    .eq('id', venueId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllVenuesAdmin = async () => {
  const { data, error } = await supabase
    .from('venues')
    .select(`
      *,
      vendor:profiles!venues_vendor_id_fkey(full_name),
      venue_images(storage_path, is_cover)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};
