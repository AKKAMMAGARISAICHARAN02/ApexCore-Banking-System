import React, { useState } from 'react';
import { SystemSettings } from '../../types';
import { Sliders, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AdminSettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [dailyWithdrawal, setDailyWithdrawal] = useState(settings.dailyWithdrawalLimit);
  const [dailyTransfer, setDailyTransfer] = useState(settings.dailyTransferLimit);
  const [maxDoorstepW, setMaxDoorstepW] = useState(settings.maxDoorstepWithdrawal);
  const [maxDoorstepD, setMaxDoorstepD] = useState(settings.maxDoorstepDeposit);
  const [branch, setBranch] = useState(settings.branch || 'Apex Flagship Central');
  const [ifsc, setIfsc] = useState(settings.ifscPrefix || 'APEX000100');
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      dailyWithdrawalLimit: dailyWithdrawal,
      dailyTransferLimit: dailyTransfer,
      maxDoorstepWithdrawal: maxDoorstepW,
      maxDoorstepDeposit: maxDoorstepD,
      branch,
      ifscPrefix: ifsc,
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-gray-300" />
            Core Banking Parameters & Risk Limits
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure institutional transactional ceilings, branch defaults, and regulatory thresholds.
          </p>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 max-w-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Daily Withdrawal Limit (₹)
              </label>
              <input
                type="number"
                value={dailyWithdrawal}
                onChange={(e) => setDailyWithdrawal(Number(e.target.value))}
                className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Daily Transfer Limit (₹)
              </label>
              <input
                type="number"
                value={dailyTransfer}
                onChange={(e) => setDailyTransfer(Number(e.target.value))}
                className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Max Doorstep Cash Withdrawal (₹)
              </label>
              <input
                type="number"
                value={maxDoorstepW}
                onChange={(e) => setMaxDoorstepW(Number(e.target.value))}
                className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Max Doorstep Cash Deposit (₹)
              </label>
              <input
                type="number"
                value={maxDoorstepD}
                onChange={(e) => setMaxDoorstepD(Number(e.target.value))}
                className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Primary Branch Office
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">
                IFSC Routing Prefix
              </label>
              <input
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {savedMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Core banking parameters saved and logged to audit trail.</span>
            </div>
          )}

          <div className="pt-4 border-t border-[#1F2937] flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-md transition-all cursor-pointer"
            >
              Save Operational Limits
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
