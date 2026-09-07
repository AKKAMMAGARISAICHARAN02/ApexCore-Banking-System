import React from 'react';
import { UserRole } from '../types';
import { Shield, Briefcase, User, ArrowLeft, RefreshCw, CheckCircle2, Cloud } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeCustomerName?: string;
  activeEmployeeName?: string;
  activeEmployeeHeadName?: string;
  firebaseConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  activeCustomerName,
  activeEmployeeName,
  activeEmployeeHeadName,
  firebaseConnected = true,
}) => {
  return (
    <header className="flex items-center justify-between px-6 lg:px-8 py-3.5 border-b border-[#1F2937] bg-[#111827] sticky top-0 z-50">
      {/* Brand logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectRole('guest')}>
        <div className="w-10 h-10 bg-blue-600 hover:bg-blue-500 transition-colors rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-md shadow-blue-900/40">
          B
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            ApexCore <span className="text-blue-500 font-semibold">Banking</span>
          </h1>
          <p className="text-[11px] text-gray-400 font-mono hidden sm:block">ENTERPRISE SYSTEM</p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="hidden md:flex items-center gap-5 text-xs font-medium">
        <span className="flex items-center gap-2 text-green-400 bg-green-950/40 px-2.5 py-1 rounded-full border border-green-800/40">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          System Active
        </span>
        <span className="text-gray-300 flex items-center gap-1.5 bg-[#1F2937]/70 px-2.5 py-1 rounded-full border border-[#374151]">
          <Cloud className={`w-3.5 h-3.5 ${firebaseConnected ? 'text-emerald-400' : 'text-amber-400 animate-spin'}`} />
          <span className="text-[11px]">Firestore: <strong className={firebaseConnected ? 'text-emerald-400' : 'text-amber-300'}>{firebaseConnected ? 'Live Cloud' : 'Syncing'}</strong></span>
        </span>
        <span className="text-gray-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          Ledger: Synchronized
        </span>
        <div className="px-2.5 py-1 bg-[#1F2937] text-gray-300 rounded border border-[#374151] font-mono text-[11px]">
          v4.2.0
        </div>
      </div>

      {/* Role Navigation & Switcher */}
      <div className="flex items-center gap-3">
        {currentRole !== 'guest' && (
          <button
            onClick={() => onSelectRole('guest')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-[#1F2937] hover:bg-[#374151] border border-[#374151] rounded-lg transition-colors cursor-pointer"
            title="Return to System Entry Points"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden sm:inline">Portals</span>
          </button>
        )}

        {/* Current Active Context Badge */}
        {currentRole === 'admin' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs font-medium">
            <Shield className="w-3.5 h-3.5 text-red-400" />
            <span>Admin Console</span>
          </div>
        )}

        {currentRole === 'employee_head' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 text-xs font-medium">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span>{activeEmployeeHeadName ? `${activeEmployeeHeadName} (Head)` : 'Employee Head Console'}</span>
          </div>
        )}

        {currentRole === 'employee' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs font-medium">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeEmployeeName || 'Field Officer'}</span>
          </div>
        )}

        {currentRole === 'customer' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-800/50 text-blue-300 text-xs font-medium">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>{activeCustomerName || 'Customer Portal'}</span>
          </div>
        )}
      </div>
    </header>
  );
};
