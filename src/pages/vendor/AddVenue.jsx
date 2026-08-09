import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Store, MapPin, BadgePercent, ShieldAlert, ArrowLeft, 
  Image as ImageIcon, Check, ChevronRight, UploadCloud, Trash2, Calendar
} from 'lucide-react';
import { useCreateVenue } from '../../hooks/useVenues';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { PAKISTAN_CITIES, AMENITIES, VENUE_TYPES } from '../../utils/constants';
import { uploadVenueImage } from '../../services/venueService';
import { supabase } from '../../lib/supabaseClient';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

// Validation Schema for steps
const step1Schema = z.object({
  name: z.string().min(3, 'Venue name must be at least 3 characters'),
  type: z.enum(['hall', 'marquee', 'banquet', 'lawn'], {
    errorMap: () => ({ message: 'Please choose a venue type' }),
  }),
  city: z.string().min(1, 'Please select a city'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

const step2Schema = z.object({
  capacityMin: z.coerce.number().min(20, 'Min capacity must be at least 20 guests').optional(),
  capacityMax: z.coerce.number().min(50, 'Max capacity must be at least 50 guests'),
  pricePerDay: z.coerce.number().min(1000, 'Price per day must be at least Rs. 1,000'),
  amenities: z.array(z.string()).min(1, 'Select at least one service/amenity'),
}).refine(data => {
  if (data.capacityMin && data.capacityMax) {
    return data.capacityMin <= data.capacityMax;
  }
  return true;
}, {
  message: "Min capacity must be less than or equal to max capacity",
  path: ["capacityMin"]
});

export default function AddVenue() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const showToast = useUiStore((state) => state.showToast);
  const createVenueMutation = useCreateVenue();

  // Form Steps state
  const [step, setStep] = useState(1);
  const [imageFiles, setImageFiles] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Steps React Hook Forms
  const {
    register: register1,
    handleSubmit: handleSubmit1,
    formState: { errors: errors1 },
    getValues: getValues1,
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: '', type: 'hall', city: 'Karachi', address: '', description: '' }
  });

  const {
    register: register2,
    handleSubmit: handleSubmit2,
    setValue: setValue2,
    watch: watch2,
    formState: { errors: errors2 },
    getValues: getValues2,
  } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: { capacityMin: 50, capacityMax: 500, pricePerDay: 150000, amenities: [] }
  });

  const watchAmenities = watch2('amenities', []);

  // Object URLs must be created once per file and revoked, otherwise every
  // re-render leaks another blob reference.
  const previews = useMemo(
    () => imageFiles.map((file) => URL.createObjectURL(file)),
    [imageFiles]
  );
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  // Amenity Checkbox hander
  const toggleAmenity = (id) => {
    const next = watchAmenities.includes(id)
      ? watchAmenities.filter(x => x !== id)
      : [...watchAmenities, id];
    setValue2('amenities', next, { shouldValidate: true });
  };

  // Drag & Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      setImageFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      setImageFiles(prev => [...prev, ...files]);
    }
  };

  const removeSelectedFile = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    if (coverIndex === idx) {
      setCoverIndex(0);
    } else if (coverIndex > idx) {
      setCoverIndex(prev => prev - 1);
    }
  };

  // Navigation handlers
  const handleNextStep1 = () => {
    setStep(2);
  };

  const handleNextStep2 = () => {
    setStep(3);
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Submit Final handler
  const handleFormSubmit = async () => {
    if (imageFiles.length === 0) {
      showToast('Please upload at least one photo of your space.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const values1 = getValues1();
      const values2 = getValues2();

      // 1. Upload images to Supabase storage bucket
      const uploadedUrls = [];
      for (const file of imageFiles) {
        const url = await uploadVenueImage(file, profile.id);
        uploadedUrls.push(url);
      }

      // 2. Insert Parent Venue Space
      const capacityMax = parseInt(values2.capacityMax, 10);
      const newVenue = await createVenueMutation.mutateAsync({
        vendor_id: profile.id,
        name: values1.name,
        type: values1.type,
        city: values1.city,
        address: values1.address,
        area: values1.area || values1.city,
        description: values1.description,
        capacity_min: parseInt(values2.capacityMin || 50, 10),
        capacity_max: capacityMax,
        // `capacity` mirrors capacity_max for the legacy single-capacity column.
        capacity: capacityMax,
        price_per_day: parseInt(values2.pricePerDay, 10),
        amenities: values2.amenities,
        images: uploadedUrls, // array column fallback
        status: 'pending_approval', // awaits Admin live approval
      });

      // 3. Insert Child images rows into `venue_images` child table
      if (newVenue && newVenue.id) {
        for (let i = 0; i < uploadedUrls.length; i++) {
          try {
            await supabase.from('venue_images').insert({
              venue_id: newVenue.id,
              storage_path: uploadedUrls[i],
              is_cover: i === coverIndex,
              display_order: i,
            });
          } catch (childErr) {
            console.error('Child image row insert failed:', childErr);
          }
        }
      }

      showToast('Venue submitted successfully! Awaiting Admin review.', 'success');
      navigate('/vendor/venues');
    } catch (err) {
      showToast(err.message || 'Failed to register venue space.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 select-none font-sans">
      
      {/* Top Breadcrumb header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="h-10 w-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-500 hover:text-rose-600 transition"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 leading-tight">Register New Space</h1>
          <p className="text-stone-400 text-xs mt-0.5">Let's set up your venue details in 3 quick steps.</p>
        </div>
      </div>

      {/* ── 1. STEPS PROGRESS INDICATOR TIMELINE ───────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center justify-between text-xs select-none">
        
        {/* Step 1 Node */}
        <div className="flex items-center gap-2">
          <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold transition ${
            step > 1 
              ? 'bg-emerald-500 text-white' 
              : step === 1 ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-400'
          }`}>
            {step > 1 ? <Check size={12} /> : '1'}
          </span>
          <span className={`font-semibold ${step === 1 ? 'text-stone-850 font-bold' : 'text-stone-400'}`}>Basic Info</span>
        </div>

        <ChevronRight size={14} className="text-stone-300" />

        {/* Step 2 Node */}
        <div className="flex items-center gap-2">
          <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold transition ${
            step > 2 
              ? 'bg-emerald-500 text-white' 
              : step === 2 ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-400'
          }`}>
            {step > 2 ? <Check size={12} /> : '2'}
          </span>
          <span className={`font-semibold ${step === 2 ? 'text-stone-850 font-bold' : 'text-stone-400'}`}>Details & Pricing</span>
        </div>

        <ChevronRight size={14} className="text-stone-300" />

        {/* Step 3 Node */}
        <div className="flex items-center gap-2">
          <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold transition ${
            step === 3 ? 'bg-rose-600 text-white animate-bounce-short' : 'bg-stone-100 text-stone-400'
          }`}>
            3
          </span>
          <span className={`font-semibold ${step === 3 ? 'text-stone-850 font-bold' : 'text-stone-400'}`}>Photos Upload</span>
        </div>

      </div>

      {/* ── 2. STEP 1 FORM: BASIC INFO ────────────────────────────────── */}
      {step === 1 && (
        <form onSubmit={handleSubmit1(handleNextStep1)} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-6">
          <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">Step 1: General Space Information</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Venue Name *"
              placeholder="e.g. Shalimar Banquet Lawn"
              error={errors1.name?.message}
              {...register1('name')}
              id="new-venue-name"
            />
            <Select
              label="Venue Type *"
              options={VENUE_TYPES}
              placeholder=""
              error={errors1.type?.message}
              {...register1('type')}
              id="new-venue-type"
            />
            <Select
              label="City Location *"
              options={PAKISTAN_CITIES.map(c => ({ value: c, label: c }))}
              placeholder=""
              error={errors1.city?.message}
              {...register1('city')}
              id="new-venue-city"
            />
          </div>

          <Input 
            label="Street Address *" 
            placeholder="e.g. Main Karsaz Road, near Arena, Karachi" 
            error={errors1.address?.message} 
            {...register1('address')} 
            id="new-venue-address"
          />

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-serif">Description & Introductions *</label>
            <textarea
              {...register1('description')}
              rows={5}
              placeholder="Detail your space. Discuss parking counts, caterers, lighting, and general arrangements..."
              className={`block w-full rounded-xl border p-3 text-xs md:text-sm focus:bg-white focus:outline-none transition resize-none ${
                errors1.description ? 'border-red-400 focus:border-red-500' : 'border-stone-250 focus:border-rose-500'
              }`}
              id="new-venue-desc"
            />
            {errors1.description && (
              <p className="text-[10px] text-red-500 font-semibold mt-1">{errors1.description.message}</p>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <Button type="submit" variant="primary" className="px-6 font-bold shadow-md">
              Next Step
            </Button>
          </div>
        </form>
      )}

      {/* ── 3. STEP 2 FORM: DETAILS & PRICING ──────────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleSubmit2(handleNextStep2)} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-6">
          <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">Step 2: Capacity Limits & Daily Rentals</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input 
              type="number"
              label="Min Capacity" 
              error={errors2.capacityMin?.message} 
              {...register2('capacityMin')} 
              id="new-venue-cap-min"
            />
            <Input 
              type="number"
              label="Max Capacity *" 
              error={errors2.capacityMax?.message} 
              {...register2('capacityMax')} 
              id="new-venue-cap-max"
            />
            <Input 
              type="number"
              label="Price Per Day (PKR) *" 
              error={errors2.pricePerDay?.message} 
              {...register2('pricePerDay')} 
              id="new-venue-price-day"
            />
          </div>

          {/* Amenities Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider font-serif">Included Services & Amenities *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITIES.map((a) => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => toggleAmenity(a.id)}
                  className={`flex items-center justify-between p-3.5 border rounded-xl text-xs font-semibold text-left transition ${
                    watchAmenities.includes(a.id)
                      ? 'border-rose-350 bg-rose-50/15 text-rose-700 font-bold ring-2 ring-rose-500/10'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                  id={`amenity-${a.id}`}
                >
                  <span>{a.label}</span>
                  {watchAmenities.includes(a.id) && (
                    <span className="p-0.5 bg-rose-500 text-white rounded-full shrink-0">
                      <Check size={10} />
                    </span>
                  )}
                </button>
              ))}
            </div>
            {errors2.amenities && (
              <p className="text-[10px] text-red-500 font-semibold mt-1">{errors2.amenities.message}</p>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2.5 border border-stone-250 bg-white hover:bg-stone-50 text-stone-600 text-xs font-bold rounded-xl transition"
            >
              Back
            </button>
            <Button type="submit" variant="primary" className="px-6 font-bold shadow-md">
              Next Step
            </Button>
          </div>
        </form>
      )}

      {/* ── 4. STEP 3 FORM: IMAGES UPLOAD ──────────────────────────────── */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-6">
          <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">Step 3: Upload Space Galleries</h2>

          {/* Drag and Drop Zone */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 text-center transition ${
              dragActive 
                ? 'border-rose-500 bg-rose-50/10' 
                : 'border-stone-300 bg-stone-50 hover:bg-stone-100/50'
            }`}
          >
            <UploadCloud size={36} strokeWidth={1.5} className="text-stone-400" />
            <div className="space-y-1">
              <span className="block text-xs font-bold text-stone-850">Drag and drop photos here</span>
              <span className="block text-[10px] text-stone-400">Supports PNG, JPEG, and WebP</span>
            </div>
            
            <label className="px-4 py-2 border border-stone-200 hover:border-rose-350 hover:text-rose-600 bg-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition">
              Select Files
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileSelect} 
                className="hidden" 
                id="file-upload-input"
              />
            </label>
          </div>

          {/* Image Files Preview List */}
          {imageFiles.length > 0 && (
            <div className="space-y-3 select-none">
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Photo Selection ({imageFiles.length} files) - Mark one as cover
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {imageFiles.map((file, idx) => {
                  const url = previews[idx];
                  return (
                    <div
                      key={`${file.name}-${idx}`}
                      className={`relative aspect-video rounded-xl overflow-hidden bg-stone-100 border-2 transition ${
                        coverIndex === idx ? 'border-rose-500 shadow-md ring-2 ring-rose-500/10' : 'border-stone-200'
                      }`}
                    >
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      {/* Delete index */}
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(idx)}
                        className="absolute top-1.5 right-1.5 h-6 w-6 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center transition border border-white/10"
                        title="Remove photo"
                      >
                        <Trash2 size={12} />
                      </button>

                      {/* Cover checkbox flag button */}
                      <button
                        type="button"
                        onClick={() => setCoverIndex(idx)}
                        className={`absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition ${
                          coverIndex === idx 
                            ? 'bg-rose-600 text-white shadow-md' 
                            : 'bg-black/60 text-white/90 hover:bg-black'
                        }`}
                      >
                        {coverIndex === idx ? '★ Cover' : 'Set Cover'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-4 border-t border-stone-100 flex justify-between">
            <button
              type="button"
              disabled={isUploading}
              onClick={handleBack}
              className="px-6 py-2.5 border border-stone-250 bg-white hover:bg-stone-50 text-stone-600 text-xs font-bold rounded-xl transition"
            >
              Back
            </button>
            <Button
              onClick={handleFormSubmit}
              isLoading={isUploading}
              disabled={imageFiles.length === 0}
              variant="primary"
              className="px-6 font-bold shadow-lg"
              id="submit-register-venue-btn"
            >
              Submit Venue Space
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
