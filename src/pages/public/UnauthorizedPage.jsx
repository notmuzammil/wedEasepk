import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lift ring-1 ring-stone-900/5 animate-fade-up sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="mt-6 space-y-3">
          <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
            Error 403
          </span>
          <h1 className="font-serif text-2xl font-semibold text-stone-900">Access restricted</h1>
          <p className="text-sm leading-relaxed text-stone-500">
            You don&apos;t have permission to view this page. If you think this is a mistake, try signing in with a different account.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" fullWidth onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Go back
          </Button>
          <Button variant="dark" fullWidth onClick={() => navigate('/')}>
            <Home className="h-4 w-4" /> Home
          </Button>
        </div>
      </div>
    </div>
  );
}
