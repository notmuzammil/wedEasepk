import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-stone-50">
      <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl shadow-lg p-8 text-center space-y-6">
        
        {/* Warning Icon Container */}
        <div className="mx-auto w-16 h-16 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
            Error 403: Forbidden
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Access Restricted
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            You do not have the required permissions to view this dashboard page. If you believe this is an error, please try logging back in with a different account.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate(-1)}
            className="flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>

          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/')}
            className="flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" /> Home
          </Button>
        </div>
      </div>
    </div>
  );
}
