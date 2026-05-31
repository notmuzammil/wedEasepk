import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { loginSchema } from '../../utils/validators';
import { useLogin } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Input, Button } from '../../components/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const { isAuthenticated, profile } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Handle redirect on successful authentication
  useEffect(() => {
    if (isAuthenticated && profile) {
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (profile.role === 'customer') {
          navigate('/dashboard', { replace: true });
        } else if (profile.role === 'vendor') {
          navigate('/vendor/dashboard', { replace: true });
        } else if (profile.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        }
      }
    }
  }, [isAuthenticated, profile, navigate, location]);

  const onSubmit = async (data) => {
    try {
      const result = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      const role = result?.profile?.role;
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (role === 'customer') {
          navigate('/dashboard', { replace: true });
        } else if (role === 'vendor') {
          navigate('/vendor/dashboard', { replace: true });
        } else if (role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        }
      }
    } catch (err) {
      // Ignored here because useLogin's onError handles the error toast
    }
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
        <div className="relative z-10 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-rose-200 fill-rose-100/20" />
          <span className="font-serif text-2xl font-bold tracking-wide">
            Shaadi<span className="text-rose-200">Spaces</span>
          </span>
        </div>

        {/* Taglines & Quotes */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-medium tracking-wide uppercase">
            Platform for Premium Venues
          </span>
          
          {/* Urdu Calligraphy / Tagline */}
          <h1 className="font-serif text-4xl xl:text-5xl font-bold leading-relaxed text-right pr-4 border-r-2 border-rose-300/40">
            خوابوں کی شادی کا آغاز، بہترین مقامات کے ساتھ
          </h1>

          {/* English translation sub-tagline */}
          <p className="text-lg text-rose-100 font-light leading-relaxed">
            Find and book your perfect wedding venue. Your dream celebration, made simple, transparent, and beautiful.
          </p>
        </div>

        {/* Bottom Social Proof */}
        <div className="relative z-10 flex items-center gap-4 text-rose-100 text-sm">
          <div className="flex -space-x-2">
            <span className="w-8 h-8 rounded-full border-2 border-rose-500 bg-rose-300 flex items-center justify-center text-xs font-bold text-rose-800">A</span>
            <span className="w-8 h-8 rounded-full border-2 border-rose-500 bg-pink-300 flex items-center justify-center text-xs font-bold text-pink-800">M</span>
            <span className="w-8 h-8 rounded-full border-2 border-rose-500 bg-amber-300 flex items-center justify-center text-xs font-bold text-amber-800">K</span>
          </div>
          <p>Trusted by over <strong className="text-white font-semibold">1,000+ couples</strong> in Karachi.</p>
        </div>
      </div>

      {/* Right: Clean White Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-white min-h-screen">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Branding Header */}
          <div className="lg:hidden text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-rose-600">
              <Sparkles className="h-6 w-6 fill-rose-100" />
              <span className="font-serif text-2xl font-bold tracking-wide">
                Shaadi<span className="text-stone-850">Spaces</span>
              </span>
            </div>
            <p className="text-stone-500 text-xs font-light">خوابوں کی شادی کا آغاز، بہترین مقامات کے ساتھ</p>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-serif font-bold text-stone-900">
              Welcome Back
            </h2>
            <p className="text-stone-500 text-sm">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. name@domain.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loginMutation.isPending}
            >
              Sign In <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <div className="text-center text-sm text-stone-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-rose-600 hover:text-rose-700 underline"
            >
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
