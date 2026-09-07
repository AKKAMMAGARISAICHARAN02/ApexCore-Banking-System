import React, { useState } from 'react';
import { Customer, Transaction, DoorstepRequest, SystemSettings } from '../types';
import { generateTransactionReceipt, generateBankStatement } from '../utils/pdfGenerator';
import { 
  ArrowUpRight, ArrowDownLeft, Truck, Send, Download, 
  CheckCircle2, AlertCircle, Copy, Clock, ShieldCheck, 
  Search, Eye, EyeOff, MapPin, Phone, Key, X, FileText
} from 'lucide-react';

interface CustomerPortalProps {
  currentCustomer?: Customer | null;
  transactions: Transaction[];
  doorstepRequests: DoorstepRequest[];
  settings: SystemSettings;
  onRequestDoorstep: (
    type: 'WITHDRAWAL' | 'DEPOSIT',
    amount: number,
    address: string,
    notes?: string,
    denominations?: string
  ) => { success: boolean; message: string };
  onTransferFunds: (
    receiverAccount: string,
    receiverName: string,
    amount: number,
    remarks: string
  ) => { success: boolean; message: string };
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentCustomer,
  transactions,
  doorstepRequests,
  settings,
  onRequestDoorstep,
  onTransferFunds,
}) => {
  const [showMasked, setShowMasked] = useState(true);
  const [txSearch, setTxSearch] = useState('');
  const [txFilter, setTxFilter] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');

  // Modals
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Forms
  const [doorstepAmt, setDoorstepAmt] = useState('');
  const [doorstepAddress, setDoorstepAddress] = useState(currentCustomer?.address || '');
  const [doorstepNotes, setDoorstepNotes] = useState('');
  const [doorstepDenom, setDoorstepDenom] = useState('');

  const [transferTargetAcc, setTransferTargetAcc] = useState('');
  const [transferTargetName, setTransferTargetName] = useState('');
  const [transferAmt, setTransferAmt] = useState('');
  const [transferRemarks, setTransferRemarks] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  if (!currentCustomer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md bg-[#111827] border border-[#1F2937] rounded-xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-blue-900/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-800/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Customer Accounts Registered</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            The banking ledger currently contains 0 customer accounts. Please open the Admin Portal and click "Open Bank Account" to create a new customer account before accessing retail customer features.
          </p>
          <div className="bg-[#0F1115] border border-[#1F2937] p-3 rounded-lg text-xs font-mono text-emerald-400">
            Cloud State: Live Firestore Active (0 Records)
          </div>
        </div>
      </div>
    );
  }

  // Customer's transactions
  const myTransactions = transactions.filter(
    (t) => t.accountNumber === currentCustomer.accountNumber
  );

  // Customer's doorstep requests
  const myDoorstep = doorstepRequests.filter(
    (r) => r.accountNumber === currentCustomer.accountNumber
  );

  const activeDoorstep = myDoorstep.filter(
    (r) => r.status !== 'COMPLETED' && r.status !== 'REJECTED'
  );

  const filteredTransactions = myTransactions.filter((tx) => {
    const matchesSearch =
      (tx.description && tx.description.toLowerCase().includes(txSearch.toLowerCase())) ||
      (tx.transactionId && tx.transactionId.toLowerCase().includes(txSearch.toLowerCase())) ||
      (tx.sender && tx.sender.toLowerCase().includes(txSearch.toLowerCase())) ||
      (tx.receiver && tx.receiver.toLowerCase().includes(txSearch.toLowerCase()));

    const matchesFilter = txFilter === 'ALL' || tx.debitOrCredit === txFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCreateDoorstep = (type: 'WITHDRAWAL' | 'DEPOSIT') => {
    setFormError('');
    setFormSuccess('');
    const amt = parseFloat(doorstepAmt);

    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }

    if (type === 'WITHDRAWAL') {
      if (amt > currentCustomer.balance) {
        setFormError('Insufficient available funds for this withdrawal.');
        return;
      }
      if (amt > settings.maxDoorstepWithdrawal) {
        setFormError(`Maximum doorstep withdrawal is ₹${settings.maxDoorstepWithdrawal.toLocaleString()}.`);
        return;
      }
    } else {
      if (amt > settings.maxDoorstepDeposit) {
        setFormError(`Maximum doorstep deposit is ₹${settings.maxDoorstepDeposit.toLocaleString()}.`);
        return;
      }
    }

    if (!doorstepAddress.trim()) {
      setFormError('Please specify the delivery / collection address.');
      return;
    }

    const res = onRequestDoorstep(type, amt, doorstepAddress, doorstepNotes, doorstepDenom);
    if (res.success) {
      setFormSuccess(res.message);
      setTimeout(() => {
        setShowWithdrawModal(false);
        setShowDepositModal(false);
        setDoorstepAmt('');
        setDoorstepNotes('');
        setDoorstepDenom('');
        setFormSuccess('');
      }, 1200);
    } else {
      setFormError(res.message);
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    const amt = parseFloat(transferAmt);

    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid transfer amount.');
      return;
    }

    if (amt > currentCustomer.balance) {
      setFormError('Insufficient account funds for transfer.');
      return;
    }

    if (amt > settings.dailyTransferLimit) {
      setFormError(`Single transaction exceeds daily limit of ₹${settings.dailyTransferLimit.toLocaleString()}.`);
      return;
    }

    if (transferTargetAcc.trim() === currentCustomer.accountNumber) {
      setFormError('Cannot transfer funds to the same source account.');
      return;
    }

    const res = onTransferFunds(transferTargetAcc, transferTargetName, amt, transferRemarks);
    if (res.success) {
      setFormSuccess(res.message);
      setTimeout(() => {
        setShowTransferModal(false);
        setTransferTargetAcc('');
        setTransferTargetName('');
        setTransferAmt('');
        setTransferRemarks('');
        setFormSuccess('');
      }, 1200);
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6 lg:p-8 space-y-6">
      {/* Account Master Card styled in Elegant Dark theme */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 shadow-xl shadow-black/30 relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                {currentCustomer.accountType} Account
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                <CheckCircle2 className="w-3 h-3" /> KYC VERIFIED
              </span>
              {currentCustomer.status !== 'ACTIVE' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-950/70 text-red-400 border border-red-800/40">
                  {currentCustomer.status}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{currentCustomer.fullName}</h2>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 font-mono">
              <span>
                Account:{' '}
                {showMasked
                  ? `•••• •••• ${currentCustomer.accountNumber.slice(-4)}`
                  : currentCustomer.accountNumber}
              </span>
              <button
                onClick={() => setShowMasked(!showMasked)}
                className="text-gray-400 hover:text-white cursor-pointer"
                title="Toggle Account Number"
              >
                {showMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <span>•</span>
              <span>IFSC: {currentCustomer.ifsc}</span>
              <span>•</span>
              <span className="hidden sm:inline">{currentCustomer.branch}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase font-medium">Available Ledger Balance</div>
            <div className="text-3xl font-extrabold text-white font-mono mt-0.5 tracking-tight">
              ₹{currentCustomer.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
              Instant Withdrawal Ready
            </div>
          </div>
        </div>

        {/* 4 Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#1F2937]">
          <button
            onClick={() => {
              setDoorstepAmt('');
              setFormError('');
              setFormSuccess('');
              setShowWithdrawModal(true);
            }}
            className="flex items-center justify-center gap-2 p-3 bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 rounded-lg text-red-300 text-xs font-semibold transition-all cursor-pointer group shadow-sm"
          >
            <Truck className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
            <span>Doorstep Cash Delivery</span>
          </button>

          <button
            onClick={() => {
              setDoorstepAmt('');
              setFormError('');
              setFormSuccess('');
              setShowDepositModal(true);
            }}
            className="flex items-center justify-center gap-2 p-3 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 rounded-lg text-emerald-300 text-xs font-semibold transition-all cursor-pointer group shadow-sm"
          >
            <Truck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Doorstep Cash Pickup</span>
          </button>

          <button
            onClick={() => {
              setTransferAmt('');
              setFormError('');
              setFormSuccess('');
              setShowTransferModal(true);
            }}
            className="flex items-center justify-center gap-2 p-3 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/50 rounded-lg text-blue-300 text-xs font-semibold transition-all cursor-pointer group shadow-sm"
          >
            <Send className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Domestic Fund Transfer</span>
          </button>

          <button
            onClick={() => generateBankStatement(currentCustomer, myTransactions)}
            className="flex items-center justify-center gap-2 p-3 bg-[#151C2C] hover:bg-[#1E293B] border border-[#374151] rounded-lg text-gray-200 text-xs font-semibold transition-all cursor-pointer group shadow-sm"
          >
            <Download className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
            <span>Download Statement (PDF)</span>
          </button>
        </div>
      </div>

      {/* Active Doorstep Requests Tracker */}
      {activeDoorstep.length > 0 && (
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-lg shadow-black/20">
          <div className="px-6 py-3.5 bg-[#151C2C] border-b border-[#1F2937] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              Active Doorstep Banking Trips ({activeDoorstep.length})
            </h3>
            <span className="text-xs text-amber-400 font-medium">Live Status Tracking</span>
          </div>

          <div className="p-5 space-y-4">
            {activeDoorstep.map((req) => {
              const isDelivery = req.requestType === 'WITHDRAWAL';
              return (
                <div
                  key={req.id}
                  className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-4.5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold ${
                          isDelivery
                            ? 'bg-red-950/60 text-red-300 border border-red-800/40'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                        }`}
                      >
                        {isDelivery ? 'Doorstep Cash Delivery' : 'Doorstep Cash Deposit'}
                      </span>
                      <span className="font-mono text-xs text-blue-400 font-semibold">{req.requestId}</span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-400">Order Amount</div>
                      <div className="text-lg font-bold text-white font-mono">
                        ₹{req.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <div
                      className={`text-center py-1.5 px-2 rounded text-xs font-semibold border ${
                        req.status !== 'PENDING'
                          ? 'bg-blue-950 border-blue-800 text-blue-300'
                          : 'bg-amber-950/40 border-amber-800/40 text-amber-300'
                      }`}
                    >
                      1. Pending Dispatch
                    </div>
                    <div
                      className={`text-center py-1.5 px-2 rounded text-xs font-semibold border ${
                        req.status === 'ASSIGNED' ||
                        req.status === 'ON_THE_WAY' ||
                        req.status === 'REACHED_LOCATION'
                          ? 'bg-blue-950 border-blue-800 text-blue-300'
                          : 'bg-[#111827] border-[#1F2937] text-gray-500'
                      }`}
                    >
                      2. Agent Assigned
                    </div>
                    <div
                      className={`text-center py-1.5 px-2 rounded text-xs font-semibold border ${
                        req.status === 'ON_THE_WAY' || req.status === 'REACHED_LOCATION'
                          ? 'bg-blue-950 border-blue-800 text-blue-300'
                          : 'bg-[#111827] border-[#1F2937] text-gray-500'
                      }`}
                    >
                      3. On The Way
                    </div>
                    <div
                      className={`text-center py-1.5 px-2 rounded text-xs font-semibold border ${
                        req.status === 'REACHED_LOCATION'
                          ? 'bg-emerald-950 border-emerald-800 text-emerald-300 animate-pulse'
                          : 'bg-[#111827] border-[#1F2937] text-gray-500'
                      }`}
                    >
                      4. At Doorstep
                    </div>
                  </div>

                  {/* Assigned Officer and OTP Box */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-[#111827] border border-[#1F2937] rounded-lg">
                    <div>
                      {req.assignedEmployeeName ? (
                        <div className="space-y-0.5">
                          <div className="text-xs text-gray-400">Assigned Bank Field Officer:</div>
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                            {req.assignedEmployeeName}
                            <span className="text-xs text-gray-500 font-mono">({req.assignedEmployeeId})</span>
                          </div>
                          {req.assignedEmployeePhone && (
                            <div className="text-xs text-blue-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {req.assignedEmployeePhone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">
                          Awaiting Admin allocation of nearby field officer...
                        </div>
                      )}
                    </div>

                    {/* Security Verification Code */}
                    <div className="bg-[#0F1115] border border-amber-800/40 p-3 rounded-lg text-right">
                      <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 justify-end">
                        <Key className="w-3.5 h-3.5" /> Handover Security OTP:
                      </div>
                      <div className="text-2xl font-extrabold font-mono tracking-widest text-white mt-0.5">
                        {req.verificationOtp}
                      </div>
                      <div className="text-[10px] text-gray-400 max-w-[200px] text-right">
                        Share this 4-digit PIN with the officer ONLY upon actual cash handover.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transactions Passbook */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-lg shadow-black/20">
        <div className="p-4 bg-[#151C2C] border-b border-[#1F2937] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Account Passbook & Transactions
            </h3>
            <span className="text-xs text-gray-400 font-mono">({filteredTransactions.length})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-[#0F1115] p-1 rounded-lg border border-[#1F2937] text-xs">
              <button
                onClick={() => setTxFilter('ALL')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  txFilter === 'ALL' ? 'bg-[#1F2937] text-white font-semibold' : 'text-gray-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTxFilter('CREDIT')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  txFilter === 'CREDIT' ? 'bg-emerald-950 text-emerald-300 font-semibold' : 'text-gray-400'
                }`}
              >
                Credits
              </button>
              <button
                onClick={() => setTxFilter('DEBIT')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  txFilter === 'DEBIT' ? 'bg-red-950 text-red-300 font-semibold' : 'text-gray-400'
                }`}
              >
                Debits
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder="Search transactions..."
                className="bg-[#0F1115] border border-[#1F2937] rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#0F1115] text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-[#1F2937]">
                <th className="px-5 py-3">Date & Ref</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-right">Closing Balance</th>
                <th className="px-5 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-xs">
                    No transactions recorded matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isCredit = tx.debitOrCredit === 'CREDIT';
                  return (
                    <tr key={tx.id} className="hover:bg-[#151C2C]/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-xs text-white">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                        <div className="font-mono text-[10px] text-gray-500">
                          {tx.transactionId || tx.id}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-white text-xs">{tx.description}</div>
                        <div className="text-[11px] text-gray-400">
                          {isCredit ? `From: ${tx.sender}` : `To: ${tx.receiver}`}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-gray-800 text-gray-300 border border-gray-700">
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold">
                        <span className={isCredit ? 'text-emerald-400' : 'text-red-400'}>
                          {isCredit ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs text-gray-300">
                        ₹{tx.balanceAfter.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() =>
                            generateTransactionReceipt(
                              tx,
                              currentCustomer.fullName,
                              currentCustomer.accountNumber
                            )
                          }
                          className="px-2.5 py-1 text-xs rounded bg-[#1F2937] hover:bg-[#374151] text-gray-200 border border-[#374151] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          title="Download PDF Receipt"
                        >
                          <Download className="w-3 h-3 text-blue-400" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Doorstep Cash Delivery */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-red-400" />
                Request Doorstep Cash Delivery
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] text-xs text-gray-300">
              A certified bank officer will bring physical cash directly to your address. Funds are debited upon OTP verification at handover.
            </div>

            <div className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Delivery Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={doorstepAmt}
                  onChange={(e) => setDoorstepAmt(e.target.value)}
                  placeholder={`Max ₹${settings.maxDoorstepWithdrawal.toLocaleString()}`}
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Delivery Location Address</label>
                <textarea
                  rows={2}
                  required
                  value={doorstepAddress}
                  onChange={(e) => setDoorstepAddress(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Delivery Instructions / Preferred Time</label>
                <input
                  type="text"
                  value={doorstepNotes}
                  onChange={(e) => setDoorstepNotes(e.target.value)}
                  placeholder="e.g. Please arrive after 2:00 PM"
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              {formError && (
                <div className="text-xs text-red-400 flex items-center gap-1.5 p-2 bg-red-950/40 rounded border border-red-800/40">
                  <AlertCircle className="w-3.5 h-3.5" /> {formError}
                </div>
              )}

              {formSuccess && (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5 p-2 bg-emerald-950/40 rounded border border-emerald-800/40">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {formSuccess}
                </div>
              )}

              <div className="pt-3 border-t border-[#1F2937] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1F2937] text-gray-300 hover:bg-[#374151] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateDoorstep('WITHDRAWAL')}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer shadow-md shadow-red-900/30"
                >
                  Book Delivery Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Doorstep Cash Pickup */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                Request Doorstep Cash Pickup (Deposit)
              </h3>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] text-xs text-gray-300">
              A certified bank officer will collect your physical cash at your doorstep and instantly credit your ledger upon OTP authorization.
            </div>

            <div className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Deposit Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={doorstepAmt}
                  onChange={(e) => setDoorstepAmt(e.target.value)}
                  placeholder={`Max ₹${settings.maxDoorstepDeposit.toLocaleString()}`}
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Currency Notes Breakdown (Optional)</label>
                <input
                  type="text"
                  value={doorstepDenom}
                  onChange={(e) => setDoorstepDenom(e.target.value)}
                  placeholder="e.g. 500 x 20, 200 x 50"
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Pickup Location Address</label>
                <textarea
                  rows={2}
                  required
                  value={doorstepAddress}
                  onChange={(e) => setDoorstepAddress(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {formError && (
                <div className="text-xs text-red-400 flex items-center gap-1.5 p-2 bg-red-950/40 rounded border border-red-800/40">
                  <AlertCircle className="w-3.5 h-3.5" /> {formError}
                </div>
              )}

              {formSuccess && (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5 p-2 bg-emerald-950/40 rounded border border-emerald-800/40">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {formSuccess}
                </div>
              )}

              <div className="pt-3 border-t border-[#1F2937] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1F2937] text-gray-300 hover:bg-[#374151] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateDoorstep('DEPOSIT')}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-md shadow-emerald-900/30"
                >
                  Schedule Pickup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Domestic Fund Transfer */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" />
                Domestic Funds Transfer
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Beneficiary Account Number</label>
                <input
                  type="text"
                  required
                  value={transferTargetAcc}
                  onChange={(e) => setTransferTargetAcc(e.target.value)}
                  placeholder="e.g. 10014498123"
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Beneficiary Full Name</label>
                <input
                  type="text"
                  required
                  value={transferTargetName}
                  onChange={(e) => setTransferTargetName(e.target.value)}
                  placeholder="e.g. Neha Verma"
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Transfer Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={transferAmt}
                  onChange={(e) => setTransferAmt(e.target.value)}
                  placeholder={`Available: ₹${currentCustomer.balance.toLocaleString()}`}
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Remarks / Purpose</label>
                <input
                  type="text"
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  placeholder="e.g. Invoice settlement, rent, etc."
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              {formError && (
                <div className="text-xs text-red-400 flex items-center gap-1.5 p-2 bg-red-950/40 rounded border border-red-800/40">
                  <AlertCircle className="w-3.5 h-3.5" /> {formError}
                </div>
              )}

              {formSuccess && (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5 p-2 bg-emerald-950/40 rounded border border-emerald-800/40">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {formSuccess}
                </div>
              )}

              <div className="pt-3 border-t border-[#1F2937] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1F2937] text-gray-300 hover:bg-[#374151] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-md shadow-blue-900/30"
                >
                  Authorize Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
