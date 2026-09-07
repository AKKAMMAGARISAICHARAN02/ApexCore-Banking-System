import React, { useState } from 'react';
import { Customer, KYCStatus } from '../../types';
import { ShieldCheck, Search, CheckCircle2, XCircle, Clock, AlertTriangle, X } from 'lucide-react';

interface AdminKycComplianceProps {
  customers: Customer[];
  onUpdateKycStatus: (customerId: string, status: KYCStatus, reason?: string) => void;
}

export const AdminKycCompliance: React.FC<AdminKycComplianceProps> = ({
  customers,
  onUpdateKycStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState<string>('ALL');
  const [rejectModalCust, setRejectModalCust] = useState<Customer | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.fullName.toLowerCase().includes(term) ||
      c.customerId.toLowerCase().includes(term) ||
      c.accountNumber.includes(term) ||
      (c.kycDocNumber && c.kycDocNumber.toLowerCase().includes(term));
    const matchesKyc = kycFilter === 'ALL' || c.kycStatus === kycFilter;
    return matchesSearch && matchesKyc;
  });

  const pendingCount = customers.filter((c) => c.kycStatus === 'PENDING').length;
  const verifiedCount = customers.filter((c) => c.kycStatus === 'VERIFIED').length;
  const rejectedCount = customers.filter((c) => c.kycStatus === 'REJECTED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            KYC Compliance & Identity Verification Desk
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Evaluate government identity proofs, verify document validity, and approve customer accounts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-amber-400 uppercase font-medium">Pending Verification</div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">{pendingCount}</div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-emerald-400 uppercase font-medium">Verified Accounts</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{verifiedCount}</div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-red-400 uppercase font-medium">Rejected Documents</div>
          <div className="text-xl font-bold text-red-400 font-mono mt-1">{rejectedCount}</div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, ID, or document reference..."
            className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#0F1115] border border-[#1F2937] px-2.5 py-1 rounded-lg text-xs">
          <span className="text-gray-400 font-medium">Filter:</span>
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
          >
            <option value="ALL" className="bg-[#111827]">All KYC Statuses</option>
            <option value="PENDING" className="bg-[#111827]">Pending Review</option>
            <option value="VERIFIED" className="bg-[#111827]">Verified</option>
            <option value="REJECTED" className="bg-[#111827]">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#151C2C] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Account Number</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Document Identifier</th>
                <th className="py-3 px-4 text-center">KYC Status</th>
                <th className="py-3 px-4 text-right">Compliance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 text-xs">
                    No customers found matching this verification query.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.customerId} className="hover:bg-[#151C2C]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white text-xs">{c.fullName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{c.customerId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-300">
                      {c.accountNumber}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-200">
                      {c.kycDocType || 'Aadhaar / National ID'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-amber-300">
                      {c.kycDocNumber || 'DOC-VERIFIED'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          c.kycStatus === 'VERIFIED'
                            ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40'
                            : c.kycStatus === 'PENDING'
                            ? 'bg-amber-950/70 text-amber-400 border-amber-800/40'
                            : 'bg-red-950/70 text-red-400 border-red-800/40'
                        }`}
                      >
                        {c.kycStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.kycStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => onUpdateKycStatus(c.customerId, 'VERIFIED')}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve KYC
                          </button>
                        )}
                        {c.kycStatus !== 'REJECTED' && (
                          <button
                            onClick={() => {
                              setRejectModalCust(c);
                              setRejectReason('');
                            }}
                            className="px-2.5 py-1 rounded bg-red-950/70 hover:bg-red-900/80 text-red-300 border border-red-800/40 text-xs font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rejectModalCust && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Reject KYC Verification
              </h3>
              <button onClick={() => setRejectModalCust(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-300 space-y-2">
              <p>
                Rejecting KYC for <strong>{rejectModalCust.fullName}</strong> ({rejectModalCust.customerId}).
              </p>
              <div>
                <label className="block text-gray-400 mb-1">Compliance Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Unclear document photo, signature mismatch, address proof expired..."
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1F2937]">
              <button
                onClick={() => setRejectModalCust(null)}
                className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateKycStatus(rejectModalCust.customerId, 'REJECTED', rejectReason || 'Document verification failed.');
                  setRejectModalCust(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow-md cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
