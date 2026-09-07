import React, { useState } from 'react';
import { Customer } from '../../types';
import { CreditCard, Search, Snowflake, CheckCircle2, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface AdminAccountsViewProps {
  customers: Customer[];
  onUpdateStatus: (customerId: string, status: Customer['status']) => void;
  onSelectCustomerForDetails?: (customer: Customer) => void;
}

export const AdminAccountsView: React.FC<AdminAccountsViewProps> = ({
  customers,
  onUpdateStatus,
  onSelectCustomerForDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filtered = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.accountNumber.includes(term) ||
      c.fullName.toLowerCase().includes(term) ||
      c.customerId.toLowerCase().includes(term) ||
      c.branch.toLowerCase().includes(term);
    const matchesType = typeFilter === 'ALL' || c.accountType === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalBalance = customers.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-cyan-400" />
            Bank Accounts Ledger
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Central repository of all institutional customer savings, current, and depository accounts.
          </p>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] px-4 py-2 rounded-xl text-right">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Bank Deposit Balance</div>
          <div className="text-xl font-bold text-emerald-400 font-mono">₹{totalBalance.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by account number, holder name, customer ID, or branch..."
            className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#0F1115] border border-[#1F2937] px-2.5 py-1 rounded-lg text-xs">
          <span className="text-gray-400 font-medium">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
          >
            <option value="ALL" className="bg-[#111827]">All Account Types</option>
            <option value="Savings" className="bg-[#111827]">Savings Account</option>
            <option value="Current" className="bg-[#111827]">Current Account</option>
          </select>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#151C2C] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Account Number</th>
                <th className="py-3 px-4">Account Holder</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Branch & IFSC</th>
                <th className="py-3 px-4 text-right">Available Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 text-xs">
                    No accounts match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const isFrozen = c.status === 'FROZEN';
                  const isActive = c.status === 'ACTIVE';

                  return (
                    <tr key={c.accountNumber} className="hover:bg-[#151C2C]/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white text-xs">
                        {c.accountNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-200 text-xs">{c.fullName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{c.customerId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#1F2937] text-gray-300 border border-[#374151]">
                          {c.accountType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400">
                        <div>{c.branch}</div>
                        <div className="font-mono text-[10px] text-gray-500">{c.ifsc}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                        ₹{c.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isActive
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40'
                              : isFrozen
                              ? 'bg-cyan-950/70 text-cyan-400 border-cyan-800/40'
                              : 'bg-red-950/70 text-red-400 border-red-800/40'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isFrozen ? (
                            <button
                              onClick={() => onUpdateStatus(c.customerId, 'ACTIVE')}
                              className="px-2.5 py-1 rounded bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/40 text-xs font-semibold cursor-pointer"
                              title="Unfreeze Account"
                            >
                              Unfreeze
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateStatus(c.customerId, 'FROZEN')}
                              className="px-2.5 py-1 rounded bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/40 text-xs font-semibold cursor-pointer"
                              title="Freeze Account"
                            >
                              Freeze
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
