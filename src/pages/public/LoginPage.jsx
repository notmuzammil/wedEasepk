import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { loginSchema } from '../../utils/validators';
import { useLogin } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Input, Button } from '../../components/ui';
import { AuthShell } from '../../components/layout/AuthShell';

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
    } catch {
      // Ignored here because useLogin's onError handles the error toast
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your bookings, venues and more."
      quote="Find and book your perfect wedding venue. Your dream celebration — simple, transparent and beautiful."
      footer={
        <>
          New to WedEase?{' '}
          <Link to="/register" className="font-semibold text-rose-700 hover:text-rose-800 hover:underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={loginMutation.isPending}
          className="group"
        >
          Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </form>
    </AuthShell>
  );
}
