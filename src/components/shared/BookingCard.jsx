import React from 'react';
import { Calendar, Users, Clock, CreditCard, Image, ExternalLink } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatDate';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const BookingCard = ({
  booking,
  role,
  onApprove,
  onCancel,
  onVerifyPayment,
  onUploadReceipt,
  isUploadingReceipt = false
}) => {
  const {
    id,
    booking_date,
    slot,
    number_of_guests,
    total_price,
    status,
    payment_status,
    receipt_url,
    venue,
    customer
  } = booking;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && onUploadReceipt) {
      onUploadReceipt(id, file);
    }
  };

  const getSlotLabel = (s) => {
    if (s === 'afternoon') return 'Afternoon (12-4 PM)';
    if (s === 'evening') return 'Evening (7-11 PM)';
    return 'Full Day';
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-stone-100 pb-3 gap-2">
        <div>
          <h4 className="font-serif text-lg font-bold text-emerald-950">
            {venue?.name || 'Wedding Venue'}
          </h4>
          <p className="text-xs text-stone-500 font-medium">
            {venue?.area ? `${venue.area}, Karachi` : 'Karachi'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge status={status} />
          <Badge status={payment_status} customLabel={payment_status === 'pending_verification' ? 'Verifying PKR' : undefined} />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 text-sm text-stone-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-700" />
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 uppercase font-semibold">Date</span>
            <span className="font-medium text-stone-900">{formatDate(booking_date)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-700" />
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 uppercase font-semibold">Slot</span>
            <span className="font-medium text-stone-900 capitalize">{getSlotLabel(slot)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-700" />
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 uppercase font-semibold">Guests</span>
            <span className="font-medium text-stone-900">{number_of_guests} guests</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-emerald-700" />
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 uppercase font-semibold">Total Price</span>
            <span className="font-bold text-emerald-950">{formatCurrency(total_price)}</span>
          </div>
        </div>
      </div>

      {/* Customer details for Vendors/Admins */}
      {customer && (role === 'vendor' || role === 'admin') && (
        <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-600 border border-stone-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <p>Customer: <strong className="text-stone-900">{customer.full_name}</strong></p>
          <p>Phone: <strong className="text-stone-900">{customer.phone_number}</strong></p>
        </div>
      )}

      {/* Conditional actions based on Roles & States */}
      <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-2 items-center justify-between">
        
        {/* Receipt display for Vendor/Admin */}
        {receipt_url && (role === 'vendor' || role === 'admin') && (
          <a
            href={receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-900 hover:underline font-semibold"
          >
            <Image className="h-4 w-4" /> View Payment Receipt <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {/* Action Panel */}
        <div className="flex gap-2 ml-auto w-full sm:w-auto justify-end">
          
          {/* Customer Upload Receipt Trigger */}
          {role === 'customer' && status === 'approved' && payment_status === 'unpaid' && (
            <label className="inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 text-emerald-950 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm">
              {isUploadingReceipt ? 'Uploading...' : 'Upload Receipt'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploadingReceipt}
                onChange={handleFileChange}
              />
            </label>
          )}

          {/* Customer Receipt Uploading Confirmation */}
          {role === 'customer' && payment_status === 'pending_verification' && (
            <span className="text-xs text-stone-500 font-medium">Receipt uploaded. Awaiting Admin verification.</span>
          )}

          {/* Vendor Booking Request Accept/Reject */}
          {role === 'vendor' && status === 'pending_approval' && (
            <>
              <Button size="sm" variant="danger" onClick={() => onCancel(id)}>
                Decline
              </Button>
              <Button size="sm" variant="primary" onClick={() => onApprove(id)}>
                Accept Request
              </Button>
            </>
          )}

          {/* Admin Payment Verification Panel */}
          {role === 'admin' && payment_status === 'pending_verification' && receipt_url && (
            <>
              <Button size="sm" variant="danger" onClick={() => onVerifyPayment(id, false)}>
                Reject Receipt
              </Button>
              <Button size="sm" variant="primary" onClick={() => onVerifyPayment(id, true)}>
                Verify Payment
              </Button>
            </>
          )}

        </div>
      </div>
      
    </div>
  );
};
