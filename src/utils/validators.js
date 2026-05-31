import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(\+92|0|92)[0-9]{10}$/, 'Invalid Pakistani phone number (e.g. 03001234567)'),
  role: z.enum(['customer', 'vendor']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const venueSchema = z.object({
  name: z.string().min(3, 'Venue name must be at least 3 characters'),
  type: z.enum(['hall', 'marquee', 'banquet', 'lawn']),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  area: z.string().min(1, 'Area is required'),
  capacity: z.coerce.number().min(50, 'Capacity must be at least 50 guests'),
  pricePerPlate: z.coerce.number().min(500, 'Price per plate must be at least Rs. 500'),
  minSpending: z.coerce.number().min(50000, 'Minimum spending must be at least Rs. 50,000'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  amenities: z.array(z.string()).min(1, 'Select at least one amenity'),
});

export const bookingSchema = z.object({
  bookingDate: z.string().min(1, 'Booking date is required'),
  slot: z.enum(['afternoon', 'evening', 'full_day']),
  numberOfGuests: z.coerce.number().min(50, 'Minimum 50 guests required'),
});
