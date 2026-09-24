import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Heart, Building, AlertTriangle, Check } from 'lucide-react';
import { registerSchema } from '../../utils/validators';
import { useRegister } from '../../hooks/useAuth';
import { Input, Button } from '../../components/ui';
import { AuthShell } from '../../components/layout/AuthShell';

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

  const roles = [
    { value: 'customer', label: 'Planning a wedding', hint: 'Couple / family', icon: Heart },
    { value: 'vendor', label: 'I own a venue', hint: 'Hall / lawn owner', icon: Building },
  ];

  return (
    <AuthShell
      title="Create your account"
      subtitle="Discover dream venues — or list your own — in minutes."
      quote="Join WedEase to plan your celebration with confidence, or bring your venue to thousands of couples."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-rose-700 hover:text-rose-800 hover:underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Role selector */}
        <fieldset className="space-y-2">
          <legend className="mb-2 text-[13px] font-semibold text-stone-700">I&apos;m joining as</legend>
          <div className="grid grid-cols-2 gap-3" role="radiogroup">
            {roles.map(({ value, label, hint, icon: Icon }) => {
              const active = activeRole === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setValue('role', value, { shouldValidate: true })}
                  className={`relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98] ${
                    active
                      ? 'border-rose-400 bg-rose-50/60 ring-4 ring-rose-100'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <span className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${active ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className={`block text-sm font-semibold ${active ? 'text-rose-900' : 'text-stone-800'}`}>{label}</span>
                    <span className="block text-xs text-stone-500">{hint}</span>
                  </span>
                  <span className={`absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border transition-all ${active ? 'border-rose-600 bg-rose-600 text-white' : 'border-stone-300 bg-white text-transparent'}`}>
                    <Check className="h-3 w-3" />
                  </span>
                </button>
              );
            })}
          </div>
          {errors.role && (
            <p className="text-xs font-medium text-red-600" role="alert">{errors.role.message}</p>
          )}
        </fieldset>

        {activeRole === 'vendor' && (
          <div className="flex gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-900 animate-in fade-in-0 slide-in-from-top-1 duration-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              <strong>Vendor accounts are verified</strong> before activation. You can publish venue listings once approved.
            </span>
          </div>
        )}

        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Ayesha Khan"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="03001234567"
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 6 characters"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={registerMutation.isPending}
          >
            Create account
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
