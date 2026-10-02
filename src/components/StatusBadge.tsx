import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, FileSearch, ShieldAlert } from 'lucide-react';
import { RegistrationStatus, VerificationState } from '@/lib/types';

interface StatusBadgeProps {
  status: RegistrationStatus | VerificationState | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  switch (status) {
    case 'SEBI Registered':
    case 'RBI Authorized':
    case 'Official Record Verified':
    case 'Verified Regulatory Record':
      return (
        <span
          className={`inline-flex items-center font-medium rounded border bg-emerald-50 text-emerald-800 border-emerald-200 ${sizeClasses}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{status}</span>
        </span>
      );

    case 'Caution Listed by Regulator':
    case 'Official Regulatory Caution':
    case 'Regulatory Action Active':
    case 'Revoked / Barred':
      return (
        <span
          className={`inline-flex items-center font-medium rounded border bg-red-50 text-red-800 border-red-200 ${sizeClasses}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>{status}</span>
        </span>
      );

    case 'Unregistered':
    case 'Under Active Investigation':
    case 'Community Watchlist':
      return (
        <span
          className={`inline-flex items-center font-medium rounded border bg-amber-50 text-amber-800 border-amber-200 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{status}</span>
        </span>
      );

    case 'Community Corroborated':
      return (
        <span
          className={`inline-flex items-center font-medium rounded border bg-blue-50 text-blue-800 border-blue-200 ${sizeClasses}`}
        >
          <FileSearch className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>{status}</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded border bg-slate-50 text-slate-700 border-slate-200 ${sizeClasses}`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{status}</span>
        </span>
      );
  }
};
