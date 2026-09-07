import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { ShieldAlert, Search, Filter, Eye, Clock, X } from 'lucide-react';

interface AdminAuditTrailProps {
  auditLogs: AuditLog[];
}

export const AdminAuditTrail: React.FC<AdminAuditTrailProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('ALL');
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);

  const filtered = auditLogs.filter((l) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      l.action.toLowerCase().includes(term) ||
      l.targetId.toLowerCase().includes(term) ||
      (l.adminId && l.adminId.toLowerCase().includes(term));
    const matchesType = targetTypeFilter === 'ALL' || l.targetType === targetTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            Security Audit Trail & Compliance Log
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Immutable, cryptographically verifiable log of all administrative actions, dispatches, and policy modifications.
          </p>
        </div>
        <div className="text-xs text-gray-400 font-mono bg-[#111827] border border-[#1F2937] px-3 py-1.5 rounded-lg">
          Total Audit Records: <strong className="text-white">{auditLogs.length}</strong>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action name, target ID, or officer..."
            className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#0F1115] border border-[#1F2937] px-2.5 py-1 rounded-lg text-xs">
          <span className="text-gray-400 font-medium">Target:</span>
          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
          >
            <option value="ALL" className="bg-[#111827]">All Categories</option>
            <option value="CUSTOMER" className="bg-[#111827]">Customer Records</option>
            <option value="EMPLOYEE" className="bg-[#111827]">Employee Staff</option>
            <option value="DOORSTEP_REQUEST" className="bg-[#111827]">Doorstep Trips</option>
            <option value="SYSTEM" className="bg-[#111827]">System Config</option>
            <option value="SECURITY" className="bg-[#111827]">Security Events</option>
          </select>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#151C2C] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Target Ref</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 text-xs">
                    No audit records logged matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-[#151C2C]/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-gray-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-white text-xs">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1F2937] text-gray-300 border border-[#374151]">
                        {log.targetType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-amber-300">
                      {log.targetId}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400 font-mono">
                      {log.adminId || 'admin-root-001'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="px-2.5 py-1 rounded bg-[#0F1115] hover:bg-[#1F2937] text-gray-300 hover:text-white border border-[#1F2937] text-xs font-mono cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {inspectLog && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400" />
                Audit Event Payload
              </h3>
              <button onClick={() => setInspectLog(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] space-y-1">
                <div>Action: <strong className="text-white font-mono">{inspectLog.action}</strong></div>
                <div>Target ID: <span className="text-amber-300 font-mono">{inspectLog.targetId}</span></div>
                <div>Target Type: <span className="text-gray-300">{inspectLog.targetType}</span></div>
                <div>Timestamp: <span className="text-gray-400 font-mono">{new Date(inspectLog.timestamp).toISOString()}</span></div>
              </div>

              <div>
                <span className="block text-gray-400 mb-1 font-semibold uppercase text-[10px]">Metadata & Payload</span>
                <pre className="bg-[#0F1115] border border-[#1F2937] p-3 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56">
                  {JSON.stringify(inspectLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
