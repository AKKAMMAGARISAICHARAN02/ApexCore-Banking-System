import React from 'react';
import { UserRole, Customer, Employee, EmployeeHead, Transaction, DoorstepRequest, AuditLog } from '../types';
import { Shield, Briefcase, User, UserCheck, ArrowRight, Activity, Clock, FileCheck, CheckCircle2, ChevronRight } from 'lucide-react';

interface PortalSelectorProps {
  onSelectRole: (role: UserRole) => void;
  customers: Customer[];
  employees: Employee[];
  employeeHeads: EmployeeHead[];
  transactions: Transaction[];
  doorstepRequests: DoorstepRequest[];
  auditLogs: AuditLog[];
  selectedCustomerId: string;
  onSelectCustomer: (id: string) => void;
  selectedEmployeeId: string;
  onSelectEmployee: (id: string) => void;
  selectedEmployeeHeadId: string;
  onSelectEmployeeHead: (id: string) => void;
}

export const PortalSelector: React.FC<PortalSelectorProps> = ({
  onSelectRole,
  customers,
  employees,
  employeeHeads,
  transactions,
  doorstepRequests,
  auditLogs,
  selectedCustomerId,
  onSelectCustomer,
  selectedEmployeeId,
  onSelectEmployee,
  selectedEmployeeHeadId,
  onSelectEmployeeHead,
}) => {
  const totalBalance = customers.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6 lg:p-8 space-y-6">
      {/* Title section matching Design HTML */}
      <div>
        <h2 className="text-2xl lg:text-3xl font-light text-white mb-1.5 tracking-tight">
          System Entry Points
        </h2>
        <p className="text-gray-400 text-sm">
          Select a dedicated portal to access secure enterprise banking services and role-based workflows.
        </p>
      </div>

      {/* 4 Portal Cards matching Design HTML (Admin -> Employee Head -> Employee -> Customer) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* 1. Admin Portal */}
        <div
          onClick={() => onSelectRole('admin')}
          className="flex flex-col bg-[#111827] border border-[#1F2937] rounded-xl p-6 hover:border-blue-500/50 hover:bg-[#131b2c] transition-all cursor-pointer group shadow-lg shadow-black/20"
        >
          <div className="w-12 h-12 bg-blue-900/30 text-blue-400 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-blue-800/30">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
              Admin Portal
            </h3>
            <span className="text-[10px] font-mono uppercase bg-blue-950/60 text-blue-300 border border-blue-800/40 px-2 py-0.5 rounded">
              Tier 1
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed flex-1">
            Complete executive oversight. Manage customers, branch officers, inspect full doorstep request lifecycles, and monitor immutable audit trails.
          </p>
          <div className="pt-4 border-t border-[#1F2937] flex items-center justify-between mt-auto">
            <span className="text-xs font-mono text-gray-500">/admin-console</span>
            <span className="text-blue-400 text-xs font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Access Console →
            </span>
          </div>
        </div>

        {/* 2. Employee Head Portal */}
        <div
          onClick={() => onSelectRole('employee_head')}
          className="flex flex-col bg-[#111827] border border-[#1F2937] rounded-xl p-6 hover:border-indigo-500/50 hover:bg-[#131b2c] transition-all cursor-pointer group shadow-lg shadow-black/20"
        >
          <div className="w-12 h-12 bg-indigo-900/30 text-indigo-400 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-indigo-800/30">
            <UserCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
              Employee Head
            </h3>
            <span className="text-[10px] font-mono uppercase bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 px-2 py-0.5 rounded">
              Tier 2
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed flex-1">
            Branch supervisor console. Manage branch officers, view employee workloads & availability, assign or reassign doorstep tasks, and track service history.
          </p>

          {/* Quick employee head switcher */}
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <label className="text-[11px] text-gray-400 block mb-1">Active Supervisor / Branch:</label>
            <select
              value={selectedEmployeeHeadId}
              onChange={(e) => onSelectEmployeeHead(e.target.value)}
              className="w-full bg-[#0F1115] border border-[#1F2937] text-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none"
            >
              {employeeHeads.length === 0 ? (
                <option value="EH-101">Rajesh Verma - Apex Central Flagship</option>
              ) : (
                employeeHeads.map((head) => (
                  <option key={head.headId} value={head.headId}>
                    {head.fullName} ({head.branch})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="pt-3 border-t border-[#1F2937] flex items-center justify-between mt-auto">
            <span className="text-xs font-mono text-gray-500">/branch-supervisor</span>
            <span className="text-indigo-400 text-xs font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Supervisor Desk →
            </span>
          </div>
        </div>

        {/* 3. Employee Portal */}
        <div
          onClick={() => onSelectRole('employee')}
          className="flex flex-col bg-[#111827] border border-[#1F2937] rounded-xl p-6 hover:border-amber-500/50 hover:bg-[#131b2c] transition-all cursor-pointer group shadow-lg shadow-black/20"
        >
          <div className="w-12 h-12 bg-amber-900/30 text-amber-400 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-amber-800/30">
            <Briefcase className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
              Employee Portal
            </h3>
            <span className="text-[10px] font-mono uppercase bg-amber-950/60 text-amber-300 border border-amber-800/40 px-2 py-0.5 rounded">
              Tier 3
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed flex-1">
            Field officer task view. Receive real-time assigned requests, update transit stages, authenticate customer OTP, and complete doorstep transactions.
          </p>

          {/* Quick employee switcher */}
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <label className="text-[11px] text-gray-400 block mb-1">Active Officer:</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => onSelectEmployee(e.target.value)}
              disabled={employees.length === 0}
              className="w-full bg-[#0F1115] border border-[#1F2937] text-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-amber-500 focus:outline-none disabled:opacity-60"
            >
              {employees.length === 0 ? (
                <option value="">No Field Officers Registered</option>
              ) : (
                employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.fullName} ({emp.employeeId})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="pt-3 border-t border-[#1F2937] flex items-center justify-between mt-auto">
            <span className="text-xs font-mono text-gray-500">/field-officer</span>
            <span className="text-amber-400 text-xs font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              My Tasks →
            </span>
          </div>
        </div>

        {/* 4. Customer Portal */}
        <div
          onClick={() => onSelectRole('customer')}
          className="flex flex-col bg-[#111827] border border-[#1F2937] rounded-xl p-6 hover:border-emerald-500/50 hover:bg-[#131b2c] transition-all cursor-pointer group shadow-lg shadow-black/20"
        >
          <div className="w-12 h-12 bg-emerald-900/30 text-emerald-400 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-emerald-800/30">
            <User className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
              Customer Portal
            </h3>
            <span className="text-[10px] font-mono uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded">
              Retail Banking
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed flex-1">
            Secure retail banking. Book doorstep cash deposit or cash delivery, view live 7-step order status with assigned officer details, and transfer funds.
          </p>

          {/* Quick customer switcher */}
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <label className="text-[11px] text-gray-400 block mb-1">Select Customer Account:</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => onSelectCustomer(e.target.value)}
              disabled={customers.length === 0}
              className="w-full bg-[#0F1115] border border-[#1F2937] text-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
            >
              {customers.length === 0 ? (
                <option value="">No Customer Accounts in Ledger</option>
              ) : (
                customers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.fullName} - ₹{c.balance.toLocaleString()} ({c.accountNumber})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="pt-3 border-t border-[#1F2937] flex items-center justify-between mt-auto">
            <span className="text-xs font-mono text-gray-500">/my-account</span>
            <span className="text-emerald-400 text-xs font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              My Account →
            </span>
          </div>
        </div>
      </div>

      {/* Global Activity Snapshot matching Design HTML */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-lg shadow-black/20">
        <div className="px-6 py-4 border-b border-[#1F2937] flex flex-wrap items-center justify-between gap-4 bg-[#151C2C]">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Global Activity Snapshot
            </h4>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <span className="text-gray-400">
              <strong className="text-white font-mono">{customers.length}</strong> Total Accounts
            </span>
            <span className="text-gray-400">
              <strong className="text-white font-mono">{totalBalance > 0 ? `₹${(totalBalance / 100000).toFixed(1)}L` : '₹0'}</strong> Total Deposits
            </span>
            <span className="text-gray-400">
              <strong className="text-white font-mono">{doorstepRequests.length}</strong> Doorstep Orders
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#0F1115] text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-[#1F2937]">
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Operation</th>
                <th className="px-6 py-3">Reference / Entity</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {doorstepRequests.length === 0 && transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 font-mono text-xs">
                    No transaction or doorstep activity recorded in ledger (0 records). Real-time operations will appear here.
                  </td>
                </tr>
              ) : (
                <>
                  {doorstepRequests.slice(0, 3).map((dr) => (
                    <tr key={dr.id} className="hover:bg-[#151C2C]/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-xs text-gray-400">
                        {new Date(dr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-gray-200">
                        {dr.requestType === 'WITHDRAWAL' ? 'DOORSTEP_WITHDRAWAL' : 'DOORSTEP_DEPOSIT'}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs text-gray-400">
                        {dr.requestId}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            dr.status === 'COMPLETED'
                              ? 'bg-green-900/30 text-green-400 border border-green-800/40'
                              : dr.status === 'ON_THE_WAY' || dr.status === 'REACHED_LOCATION'
                              ? 'bg-blue-900/30 text-blue-400 border border-blue-800/40'
                              : dr.status === 'PENDING'
                              ? 'bg-amber-900/30 text-amber-400 border border-amber-800/40'
                              : 'bg-gray-800 text-gray-300'
                          }`}
                        >
                          {dr.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-mono text-sm text-gray-200 font-semibold">
                        ₹{dr.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {transactions.slice(0, 2).map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#151C2C]/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-xs text-gray-400">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-gray-200">
                        {tx.type}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs text-gray-400">
                        {tx.transactionId}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-900/30 text-green-400 border border-green-800/40">
                          SETTLED
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-mono text-sm text-gray-200 font-semibold">
                        ₹{tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
