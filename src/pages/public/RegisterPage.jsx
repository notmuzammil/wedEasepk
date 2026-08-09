import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Building, AlertTriangle, Check } from 'lucide-react';
import { registerSchema } from '../../utils/validators';
import { useRegister } from '../../hooks/useAuth';
import { Input, Button, LogoMark } from '../../components/ui';

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  const activeRole = watch('role');

  // Register 'role' field on mount
  useEffect(() => {
    register('role');
  }, [register]);

  const onSubmit = (data) => {
    registerMutation.mutate(
      {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
      },
      {
        onSuccess: () => {
          navigate('/login');
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-stone-50">
      {/* Left: Decorative Editorial Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-600 via-rose-500 to-pink-500 text-white p-16 flex-col justify-between relative overflow-hidden select-none">
        {/* Abstract background decorative patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-2.5">
          <LogoMark variant="inverse" className="h-10 w-10" />
          <span className="font-serif text-2xl font-bold tracking-wide">
            Wed<span className="text-rose-200">Ease</span>
          </span>
        </div>

        {/* Taglines & Quotes */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-medium tracking-wide uppercase">
            Platform for Premium Venues
          </span>
          
          {/* Tagline */}
          <h1 className="font-serif text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
            Start planning your perfect celebration.
          </h1>

          <p className="text-lg text-rose-100/90 font-light leading-relaxed">
            Choose your role and gain access to Pakistan&apos;s most exclusive venue listings.
          </p>
        </div>

        {/* Bottom Social Proof */}
        <div className="relative z-10 flex items-center gap-4 text-rose-100 text-sm">
          <div className="flex -space-x-2">
            <span className="w-8 h-8 rounded-full border-2 border-rose-500 bg-rose-300 flex items-center justify-center text-xs font-bold text-rose-800">A</span>
            <span className="w-8 h-8 rounded-full border-2 border-rose-500 bg-pink-300 flex items-center justify-center text-xs font-bold text-pink-800">M</span>
            <span className="w-8 h-8 rounded-full border-2 border-rose-500 bg-amber-300 flex items-center justify-center text-xs font-bold text-amber-800">K</span>
          </div>
          <p>Trusted by couples planning their big day across Pakistan.</p>
        </div>
      </div>

      {/* Right: Clean White Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-white min-h-screen">
        <div className="w-full max-w-md space-y-8 py-8">
          {/* Mobile Branding Header */}
          <div className="lg:hidden text-center space-y-2">
            <div className="inline-flex items-center gap-2.5 text-rose-600">
              <LogoMark className="h-9 w-9" />
              <span className="font-serif text-2xl font-bold tracking-wide">
                Wed<span className="text-stone-850">Ease</span>
              </span>
            </div>
            <p className="text-stone-500 text-xs font-light">
              Start planning your perfect celebration.
            </p>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-serif font-bold text-stone-900">
              Create Your Account
            </h2>
            <p className="text-stone-500 text-sm">
              Sign up today to discover or list premier banquets and lawns.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Muhammad Ali"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. name@domain.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              type="text"
              placeholder="e.g. 03001234567"
              leftIcon={<Phone className="h-4 w-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            {/* Interactive Card Role Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">I am joining as a:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue('role', 'customer')}
                  className={`relative flex flex-col items-center justify-center p-4 border rounded-xl transition-all text-center focus:outline-none ${
                    activeRole === 'customer'
                      ? 'border-rose-500 bg-rose-50/20 ring-2 ring-rose-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  {activeRole === 'customer' && (
                    <span className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <User className={`h-6 w-6 mb-2 ${activeRole === 'customer' ? 'text-rose-600' : 'text-stone-400'}`} />
                  <span className={`text-xs font-semibold ${activeRole === 'customer' ? 'text-rose-700 font-bold' : 'text-stone-750'}`}>
                    Customer / Couple
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('role', 'vendor')}
                  className={`relative flex flex-col items-center justify-center p-4 border rounded-xl transition-all text-center focus:outline-none ${
                    activeRole === 'vendor'
                      ? 'border-rose-500 bg-rose-50/20 ring-2 ring-rose-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  {activeRole === 'vendor' && (
                    <span className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <Building className={`h-6 w-6 mb-2 ${activeRole === 'vendor' ? 'text-rose-600' : 'text-stone-400'}`} />
                  <span className={`text-xs font-semibold ${activeRole === 'vendor' ? 'text-rose-700 font-bold' : 'text-stone-750'}`}>
                    Hall Owner (Vendor)
                  </span>
                </button>
              </div>
              {errors.role && (
                <p className="text-xs text-red-600" role="alert">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Vendor review message notice banner */}
            {activeRole === 'vendor' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Vendor Notice:</strong> You can add venues right away, but each
                  listing is reviewed by our team before it goes live to customers.
                </span>
              </div>
            )}

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={registerMutation.isPending}
              >
                Sign Up
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-rose-600 hover:text-rose-700 underline"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
