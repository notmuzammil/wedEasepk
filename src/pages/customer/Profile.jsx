import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, Phone, Save, Lock, Eye, EyeOff,
  Shield, CheckCircle2, Mail, BadgeCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUpdateProfile, useChangePassword } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { getInitials } from '../../utils/formatters';

// ─── Schemas ──────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  phone: z
    .string()
    .regex(/^(\+92|0|92)[0-9]{10}$/, 'Invalid Pakistani phone number (e.g. 03001234567)'),
});

const passwordSchema = z
  .object({
    newPassword:     z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Avatar Circle ────────────────────────────────────────────────────────────
const AvatarCircle = ({ name }) => {
  const initials = getInitials(name);
  return (
    <div className="h-20 w-20 rounded-full bg-rose-600 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 flex items-center justify-center shadow-lg">
      <span className="text-2xl font-black text-white tracking-tight">{initials}</span>
    </div>
  );
};

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
      <div className="bg-rose-50 p-2 rounded-lg">
        <Icon className="h-5 w-5 text-rose-600" />
      </div>
      <div>
        <h2 className="font-serif text-lg font-bold text-stone-900">{title}</h2>
        {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── Password Input ───────────────────────────────────────────────────────────
const PasswordInput = ({ label, error, ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-stone-700">{label}</label>
      )}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
        <input
          type={show ? 'text' : 'password'}
          className={`
            w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500
            transition-colors bg-white
            ${error ? 'border-rose-400 bg-rose-50' : 'border-stone-200'}
          `}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};

// ─── Role Badge ───────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  customer: { label: 'Customer',      color: 'bg-sky-50 text-sky-700 border-sky-200' },
  vendor:   { label: 'Venue Vendor',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  admin:    { label: 'Administrator', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Profile = () => {
  const { profile, user } = useAuthStore();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const [pwSuccess, setPwSuccess] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      phone:    profile?.phone || '',
    },
  });

  // The profile arrives asynchronously, after the form has already mounted with
  // empty defaults — re-seed it (and reset the dirty flag) once it lands.
  useEffect(() => {
    if (!profile) return;
    resetProfile({
      fullName: profile.full_name || '',
      phone:    profile.phone || '',
    });
  }, [profile, resetProfile]);

  const {
    register: regPw,
    handleSubmit: handlePw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = async (data) => {
    await updateProfileMutation.mutateAsync({
      fullName: data.fullName,
      phone:    data.phone,
    });
  };

  const onPasswordSubmit = async (data) => {
    await changePasswordMutation.mutateAsync({ newPassword: data.newPassword });
    setPwSuccess(true);
    resetPw();
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const roleCfg = ROLE_CONFIG[profile?.role] || ROLE_CONFIG.customer;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

      {/* ── Page Header ── */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">Profile Settings</h1>
        <p className="text-stone-500 text-sm mt-1">
          Manage your personal information and account security.
        </p>
      </div>

      {/* ── Avatar + Account Info ── */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <AvatarCircle name={profile?.full_name || 'User'} />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <h2 className="text-xl font-bold text-stone-900">
              {profile?.full_name || 'Your Name'}
            </h2>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${roleCfg.color}`}>
                <BadgeCheck className="h-3.5 w-3.5" />
                {roleCfg.label}
              </span>
            </div>
            <div className="space-y-1 text-sm text-stone-500">
              <p className="flex items-center gap-1.5 justify-center sm:justify-start">
                <Mail className="h-4 w-4" />
                {user?.email || '—'}
              </p>
              {profile?.phone && (
                <p className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <Phone className="h-4 w-4" />
                  {profile.phone}
                </p>
              )}
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-center text-xs text-stone-500">
            <p className="font-semibold text-stone-700">User ID</p>
            <code className="font-mono text-[10px] text-stone-500">
              {profile?.id?.slice(0, 8)}…
            </code>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Form ── */}
      <SectionCard
        icon={User}
        title="Personal Information"
        subtitle="Update your display name and contact number"
      >
        <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Muhammad Ali"
            icon={<User className="h-5 w-5" />}
            error={profileErrors.fullName?.message}
            {...regProfile('fullName')}
          />

          <Input
            label="Phone Number"
            placeholder="e.g. 03001234567"
            icon={<Phone className="h-5 w-5" />}
            error={profileErrors.phone?.message}
            {...regProfile('phone')}
          />

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            {!isDirty && (
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Profile is up to date
              </span>
            )}
            <div className="ml-auto">
              <Button
                type="submit"
                variant="primary"
                loading={updateProfileMutation.isPending}
                disabled={!isDirty}
                className="px-6"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </SectionCard>

      {/* ── Change Password ── */}
      <SectionCard
        icon={Shield}
        title="Change Password"
        subtitle="Choose a strong password with at least 8 characters"
      >
        {pwSuccess ? (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-rose-700">Password changed successfully!</p>
          </div>
        ) : (
          <form onSubmit={handlePw(onPasswordSubmit)} className="space-y-4">
            <PasswordInput
              label="New Password"
              placeholder="At least 8 characters"
              error={pwErrors.newPassword?.message}
              {...regPw('newPassword')}
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Repeat your new password"
              error={pwErrors.confirmPassword?.message}
              {...regPw('confirmPassword')}
            />

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={changePasswordMutation.isPending}
                className="px-6"
              >
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </div>
          </form>
        )}
      </SectionCard>

    </div>
  );
};

export default Profile;
