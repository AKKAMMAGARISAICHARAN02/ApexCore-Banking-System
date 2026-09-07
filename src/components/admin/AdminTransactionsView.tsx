import React, { useState } from 'react';
import { Transaction } from '../../types';
import { FileText, Search, ArrowDownLeft, ArrowUpRight, Download, Filter } from 'lucide-react';

interface AdminTransactionsViewProps {
  transactions: Transaction[];
}

export const AdminTransactionsView: React.FC<AdminTransactionsViewProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dcFilter, setDcFilter] = useState<string>('ALL');

  const filtered = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      t.transactionId.toLowerCase().includes(term) ||
      t.accountNumber.includes(term) ||
      (t.customerId && t.customerId.toLowerCase().includes(term)) ||
      t.description.toLowerCase().includes(term);

    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesDc = dcFilter === 'ALL' || t.debitOrCredit === dcFilter;

    return matchesSearch && matchesType && matchesDc;
  });

  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Transaction ID', 'Account Number', 'Date', 'Type', 'Debit/Credit', 'Amount', 'Balance After', 'Description'];
    const rows = filtered.map((t) => [
      t.transactionId,
      t.accountNumber,
      new Date(t.timestamp).toISOString(),
      t.type,
      t.debitOrCredit,
      t.amount,
      t.balanceAfter,
      `"${t.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apexcore_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Central Bank Ledger & Transactions
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Immutable, audit-proof transaction records across all branches, transfers, and doorstep trips.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-200 text-xs font-semibold rounded-lg cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Ledger (CSV)
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-gray-400 uppercase font-medium">Total Entries</div>
          <div className="text-xl font-bold text-white font-mono mt-1">{transactions.length}</div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-emerald-400 uppercase font-medium">Credits Logged</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            {transactions.filter((t) => t.debitOrCredit === 'CREDIT').length}
          </div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-red-400 uppercase font-medium">Debits Logged</div>
          <div className="text-xl font-bold text-red-400 font-mono mt-1">
            {transactions.filter((t) => t.debitOrCredit === 'DEBIT').length}
          </div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-cyan-400 uppercase font-medium">Total Volume Flow</div>
          <div className="text-xl font-bold text-white font-mono mt-1">₹{totalVolume.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Tx ID, account number, customer ID, or description..."
            className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0F1115] border border-[#1F2937] px-2.5 py-1 rounded-lg text-xs">
            <span className="text-gray-400 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-[#111827]">All Types</option>
              <option value="TRANSFER" className="bg-[#111827]">Domestic Transfer</option>
              <option value="DOORSTEP_WITHDRAWAL" className="bg-[#111827]">Doorstep Withdrawal</option>
              <option value="DOORSTEP_DEPOSIT" className="bg-[#111827]">Doorstep Deposit</option>
              <option value="INITIAL_DEPOSIT" className="bg-[#111827]">Initial Account Deposit</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0F1115] border border-[#1F2937] px-2.5 py-1 rounded-lg text-xs">
            <span className="text-gray-400 font-medium">Flow:</span>
            <select
              value={dcFilter}
              onChange={(e) => setDcFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-[#111827]">Debit & Credit</option>
              <option value="CREDIT" className="bg-[#111827]">Credit (+)</option>
              <option value="DEBIT" className="bg-[#111827]">Debit (-)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#151C2C] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Transaction ID & Timestamp</th>
                <th className="py-3 px-4">Account Number</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 text-xs">
                    No transactions recorded.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isCredit = tx.debitOrCredit === 'CREDIT';

                  return (
                    <tr key={tx.id || tx.transactionId} className="hover:bg-[#151C2C]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white text-xs">{tx.transactionId}</div>
                        <div className="text-[10px] text-gray-400">{new Date(tx.timestamp).toLocaleString()}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-300 font-medium">
                        {tx.accountNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1F2937] text-gray-300 border border-[#374151]">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-300 max-w-[240px] truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                        <span className={isCredit ? 'text-emerald-400' : 'text-red-400'}>
                          {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-gray-300">
                        ₹{tx.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
