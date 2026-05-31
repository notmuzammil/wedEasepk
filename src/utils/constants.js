// ShaadiSpaces constants

export const USER_ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const VENUE_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  LIVE: 'live',
  SUSPENDED: 'suspended'
};

export const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Gujranwala',
  'Sialkot'
];

export const KARACHI_AREAS = [
  'Clifton',
  'DHA',
  'Gulshan-e-Iqbal',
  'North Nazimabad',
  'Gulistan-e-Jauhar',
  'PECHS',
  'Federal B. Area',
  'Malir',
  'KDA Scheme 1',
  'Bahadurabad',
  'Tariq Road',
  'Saddar'
];

export const VENUE_TYPES = [
  { value: 'hall', label: 'Wedding Hall' },
  { value: 'marquee', label: 'Marquee' },
  { value: 'banquet', label: 'Banquet Space' },
  { value: 'lawn', label: 'Wedding Lawn' }
];

export const AMENITIES = [
  { id: 'catering', label: 'In-House Catering' },
  { id: 'sound_system', label: 'Professional Sound System' },
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'generator', label: 'Generator Backup' },
  { id: 'bridal_room', label: 'Complimentary Bridal Room' },
  { id: 'valet', label: 'Valet Parking' },
  { id: 'decor', label: 'Stage & Venue Decor' }
];

export const BOOKING_SLOTS = [
  { value: 'afternoon', label: 'Afternoon (12:00 PM - 04:00 PM)' },
  { value: 'evening', label: 'Evening (07:00 PM - 11:00 PM)' },
  { value: 'full_day', label: 'Full Day (12:00 PM - 11:00 PM)' }
];
