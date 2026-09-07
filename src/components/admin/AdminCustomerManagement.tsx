import React, { useState } from 'react';
import { Customer, Transaction, DoorstepRequest, KYCStatus, AccountStatus } from '../../types';
import { 
  Users, Search, Filter, Eye, Edit3, Trash2, ShieldCheck, ShieldAlert,
  CheckCircle2, XCircle, AlertTriangle, Snowflake, UserCheck, UserX,
  CreditCard, ArrowUpRight, Clock, Plus, X, AlertCircle, FileText
} from 'lucide-react';

interface AdminCustomerManagementProps {
  customers: Customer[];
  transactions: Transaction[];
  doorstepRequests: DoorstepRequest[];
  onAddCustomerClick: () => void;
  onEditCustomer: (customerId: string, updatedFields: Partial<Customer>) => { success: boolean; message: string };
  onUpdateCustomerStatus: (customerId: string, status: Customer['status']) => void;
  onDeleteCustomer: (customerId: string, mode: 'SAFE_OR_PERMANENT' | 'DEACTIVATE' | 'SOFT_DELETE') => { success: boolean; blockedByRules?: boolean; message: string };
  onUpdateKycStatus?: (customerId: string, status: KYCStatus) => void;
}

export const AdminCustomerManagement: React.FC<AdminCustomerManagementProps> = ({
  customers,
  transactions,
  doorstepRequests,
  onAddCustomerClick,
  onEditCustomer,
  onUpdateCustomerStatus,
  onDeleteCustomer,
  onUpdateKycStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [kycFilter, setKycFilter] = useState<string>('ALL');

  // Modals state
  const [viewProfileCustomer, setViewProfileCustomer] = useState<Customer | null>(null);
  const [viewAccountsCustomer, setViewAccountsCustomer] = useState<Customer | null>(null);
  const [viewTxCustomer, setViewTxCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteModalCustomer, setDeleteModalCustomer] = useState<Customer | null>(null);

  // Edit form state (strictly excluding balance, transaction history, auth password)
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editStatus, setEditStatus] = useState<AccountStatus>('ACTIVE');
  const [editKycStatus, setEditKycStatus] = useState<KYCStatus>('VERIFIED');
  const [editFormMsg, setEditFormMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Delete modal feedback
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);

  // Open edit modal helper
  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditFullName(customer.fullName || '');
    setEditPhone(customer.phone || '');
    setEditEmail(customer.email || '');
    setEditAddress(customer.address || '');
    setEditCity(customer.city || '');
    setEditState(customer.state || '');
    setEditPincode(customer.pincode || '');
    setEditDob(customer.dob || '');
    setEditGender(customer.gender || 'Other');
    setEditStatus(customer.status || 'ACTIVE');
    setEditKycStatus(customer.kycStatus || 'VERIFIED');
    setEditFormMsg(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    if (!editFullName.trim() || !editPhone.trim() || !editEmail.trim()) {
      setEditFormMsg({ text: 'Full Name, Phone, and Email are required fields.', isError: true });
      return;
    }

    const res = onEditCustomer(editingCustomer.customerId, {
      fullName: editFullName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      address: editAddress.trim(),
      city: editCity.trim(),
      state: editState.trim(),
      pincode: editPincode.trim(),
      dob: editDob,
      gender: editGender,
      status: editStatus,
      kycStatus: editKycStatus,
    });

    if (res.success) {
      setEditFormMsg({ text: 'Customer details updated successfully.', isError: false });
      setTimeout(() => {
        setEditingCustomer(null);
        setEditFormMsg(null);
      }, 900);
    } else {
      setEditFormMsg({ text: res.message, isError: true });
    }
  };

  // Filtered customer list
  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.fullName.toLowerCase().includes(term) ||
      c.customerId.toLowerCase().includes(term) ||
      c.accountNumber.includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.includes(term);

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesKyc = kycFilter === 'ALL' || c.kycStatus === kycFilter;

    return matchesSearch && matchesStatus && matchesKyc;
  });

  const totalCount = customers.length;
  const activeCount = customers.filter((c) => c.status === 'ACTIVE').length;
  const frozenCount = customers.filter((c) => c.status === 'FROZEN').length;
  const deactivatedCount = customers.filter((c) => c.status === 'DEACTIVATED' || c.status === 'BLOCKED' || c.status === 'DELETED').length;
  const kycVerifiedCount = customers.filter((c) => c.kycStatus === 'VERIFIED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Customer Management
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Admin oversight, KYC verification, profile administration, and lifecycle operations.
          </p>
        </div>

        <button
          id="btn-admin-add-customer"
          onClick={onAddCustomerClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-900/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Open Bank Account
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-gray-400 uppercase font-medium">Total Registered</div>
          <div className="text-xl font-bold text-white font-mono mt-1">{totalCount}</div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-emerald-400 uppercase font-medium">Active Accounts</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{activeCount}</div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-cyan-400 uppercase font-medium">Frozen</div>
          <div className="text-xl font-bold text-cyan-400 font-mono mt-1">{frozenCount}</div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-red-400 uppercase font-medium">Deactivated/Blocked</div>
          <div className="text-xl font-bold text-red-400 font-mono mt-1">{deactivatedCount}</div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-amber-400 uppercase font-medium">KYC Verified</div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">{kycVerifiedCount}</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            id="input-search-customers"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, account number, customer ID, email or phone..."
            className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#0F1115] border border-[#1F2937] px-2.5 py-1 rounded-lg text-xs">
            <span className="text-gray-400 font-medium">Status:</span>
            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-[#111827]">All Statuses</option>
              <option value="ACTIVE" className="bg-[#111827]">Active</option>
              <option value="FROZEN" className="bg-[#111827]">Frozen</option>
              <option value="DEACTIVATED" className="bg-[#111827]">Deactivated</option>
              <option value="BLOCKED" className="bg-[#111827]">Blocked</option>
              <option value="DELETED" className="bg-[#111827]">Deleted (Soft)</option>
            </select>
          </div>

          {/* KYC Filter */}
          <div className="flex items-center gap-1.5 bg-[#0F1115] border border-[#1F2937] px-2.5 py-1 rounded-lg text-xs">
            <span className="text-gray-400 font-medium">KYC:</span>
            <select
              id="select-kyc-filter"
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-[#111827]">All KYC</option>
              <option value="VERIFIED" className="bg-[#111827]">Verified</option>
              <option value="PENDING" className="bg-[#111827]">Pending</option>
              <option value="REJECTED" className="bg-[#111827]">Rejected</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'ALL' || kycFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setKycFilter('ALL');
              }}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-[#1F2937] cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#151C2C] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Account Number</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Ledger Balance</th>
                <th className="py-3 px-4 text-center">KYC</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/50">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm">No customer records matching criteria.</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {customers.length === 0
                        ? 'Click "Open Bank Account" to create your first customer.'
                        : 'Adjust filters or search query.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isBlocked = cust.status === 'BLOCKED';
                  const isFrozen = cust.status === 'FROZEN';
                  const isDeactivated = cust.status === 'DEACTIVATED' || cust.status === 'DELETED';
                  const isActive = cust.status === 'ACTIVE';

                  return (
                    <tr key={cust.customerId} className="hover:bg-[#151C2C]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center gap-2">
                          {cust.fullName}
                          <span className="text-[10px] font-mono text-gray-400 font-normal">
                            ({cust.customerId})
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{cust.phone}</span>
                          <span>•</span>
                          <span className="truncate max-w-[140px]">{cust.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-300 font-semibold">
                        {cust.accountNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#1F2937] text-gray-300 border border-[#374151]">
                          {cust.accountType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        ₹{cust.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            cust.kycStatus === 'VERIFIED'
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40'
                              : cust.kycStatus === 'PENDING'
                              ? 'bg-amber-950/70 text-amber-400 border-amber-800/40'
                              : 'bg-red-950/70 text-red-400 border-red-800/40'
                          }`}
                        >
                          {cust.kycStatus === 'VERIFIED' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : cust.kycStatus === 'PENDING' ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {cust.kycStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isActive
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40'
                              : isFrozen
                              ? 'bg-cyan-950/70 text-cyan-400 border-cyan-800/40'
                              : isBlocked
                              ? 'bg-red-950/70 text-red-400 border-red-800/40'
                              : 'bg-gray-800/70 text-gray-400 border-gray-700/40'
                          }`}
                        >
                          {isActive && <CheckCircle2 className="w-3 h-3" />}
                          {isFrozen && <Snowflake className="w-3 h-3" />}
                          {isBlocked && <ShieldAlert className="w-3 h-3" />}
                          {isDeactivated && <UserX className="w-3 h-3" />}
                          {cust.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Profile */}
                          <button
                            id={`btn-view-cust-${cust.customerId}`}
                            onClick={() => setViewProfileCustomer(cust)}
                            title="View Full Customer Profile"
                            className="p-1.5 rounded-lg bg-[#0F1115] hover:bg-[#1F2937] text-gray-300 hover:text-white border border-[#1F2937] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* View Accounts */}
                          <button
                            id={`btn-accounts-cust-${cust.customerId}`}
                            onClick={() => setViewAccountsCustomer(cust)}
                            title="View Customer Bank Accounts"
                            className="p-1.5 rounded-lg bg-[#0F1115] hover:bg-[#1F2937] text-blue-400 hover:text-blue-300 border border-[#1F2937] cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>

                          {/* View Transactions */}
                          <button
                            id={`btn-tx-cust-${cust.customerId}`}
                            onClick={() => setViewTxCustomer(cust)}
                            title="View Transaction History"
                            className="p-1.5 rounded-lg bg-[#0F1115] hover:bg-[#1F2937] text-emerald-400 hover:text-emerald-300 border border-[#1F2937] cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Customer Details */}
                          <button
                            id={`btn-edit-cust-${cust.customerId}`}
                            onClick={() => handleOpenEdit(cust)}
                            title="Edit Customer Profile"
                            className="p-1.5 rounded-lg bg-[#0F1115] hover:bg-[#1F2937] text-amber-400 hover:text-amber-300 border border-[#1F2937] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Status Switcher Quick Menu */}
                          {isActive ? (
                            <>
                              <button
                                onClick={() => onUpdateCustomerStatus(cust.customerId, 'DEACTIVATED')}
                                title="Deactivate Customer"
                                className="p-1.5 rounded-lg bg-[#0F1115] hover:bg-red-950/40 text-gray-400 hover:text-red-400 border border-[#1F2937] cursor-pointer"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onUpdateCustomerStatus(cust.customerId, 'BLOCKED')}
                                title="Block Customer Account"
                                className="p-1.5 rounded-lg bg-[#0F1115] hover:bg-red-950/40 text-gray-400 hover:text-red-400 border border-[#1F2937] cursor-pointer"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => onUpdateCustomerStatus(cust.customerId, 'ACTIVE')}
                              title="Reactivate Customer"
                              className="p-1.5 rounded-lg bg-[#0F1115] hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 border border-[#1F2937] cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Customer with Safe Delete dialog */}
                          <button
                            id={`btn-del-cust-${cust.customerId}`}
                            onClick={() => {
                              setDeleteFeedback(null);
                              setDeleteModalCustomer(cust);
                            }}
                            title="Delete Customer"
                            className="p-1.5 rounded-lg bg-[#0F1115] hover:bg-red-900/30 text-gray-400 hover:text-red-400 border border-[#1F2937] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL 1: VIEW FULL CUSTOMER PROFILE */}
      {viewProfileCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  Customer Profile Dossier
                </h3>
                <span className="text-xs text-gray-400 font-mono">
                  ID: {viewProfileCustomer.customerId} • Acc: {viewProfileCustomer.accountNumber}
                </span>
              </div>
              <button
                onClick={() => setViewProfileCustomer(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] space-y-1.5">
                <span className="text-gray-400 font-semibold uppercase">Personal Identity</span>
                <div><strong className="text-white text-sm">{viewProfileCustomer.fullName}</strong></div>
                <div className="text-gray-400">DOB: <span className="text-white">{viewProfileCustomer.dob || 'Not provided'}</span></div>
                <div className="text-gray-400">Gender: <span className="text-white">{viewProfileCustomer.gender || 'Not specified'}</span></div>
                <div className="text-gray-400">Status: <span className="text-emerald-400 font-bold">{viewProfileCustomer.status}</span></div>
              </div>

              <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] space-y-1.5">
                <span className="text-gray-400 font-semibold uppercase">Contact Points</span>
                <div className="text-gray-400">Phone: <span className="text-white font-mono">{viewProfileCustomer.phone}</span></div>
                <div className="text-gray-400">Email: <span className="text-white font-mono">{viewProfileCustomer.email}</span></div>
                <div className="text-gray-400">Address: <span className="text-white">{viewProfileCustomer.address}</span></div>
                {(viewProfileCustomer.city || viewProfileCustomer.state) && (
                  <div className="text-gray-400">
                    Location: <span className="text-white">{viewProfileCustomer.city}, {viewProfileCustomer.state} {viewProfileCustomer.pincode}</span>
                  </div>
                )}
              </div>

              <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] space-y-1.5">
                <span className="text-gray-400 font-semibold uppercase">Ledger & Branch</span>
                <div className="text-gray-400">Account Type: <span className="text-white font-medium">{viewProfileCustomer.accountType}</span></div>
                <div className="text-gray-400">Current Balance: <strong className="text-emerald-400 font-mono text-sm">₹{viewProfileCustomer.balance.toLocaleString()}</strong></div>
                <div className="text-gray-400">Branch: <span className="text-white">{viewProfileCustomer.branch}</span></div>
                <div className="text-gray-400">IFSC Code: <span className="text-white font-mono">{viewProfileCustomer.ifsc}</span></div>
              </div>

              <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] space-y-1.5">
                <span className="text-gray-400 font-semibold uppercase">KYC & Compliance</span>
                <div className="text-gray-400">KYC Status: <strong className="text-amber-400">{viewProfileCustomer.kycStatus}</strong></div>
                <div className="text-gray-400">Document Type: <span className="text-white">{viewProfileCustomer.kycDocType || 'Aadhaar / National ID'}</span></div>
                <div className="text-gray-400">Doc Number: <span className="text-white font-mono">{viewProfileCustomer.kycDocNumber || 'VERIFIED'}</span></div>
                <div className="text-gray-400">Account Opened: <span className="text-gray-400 font-mono">{new Date(viewProfileCustomer.createdAt).toLocaleDateString()}</span></div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1F2937]">
              <button
                onClick={() => setViewProfileCustomer(null)}
                className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW CUSTOMER BANK ACCOUNTS */}
      {viewAccountsCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                Customer Bank Accounts
              </h3>
              <button
                onClick={() => setViewAccountsCustomer(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-gray-400">{viewAccountsCustomer.accountType} Account</span>
                  <div className="text-sm font-bold text-white font-mono">{viewAccountsCustomer.accountNumber}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                  {viewAccountsCustomer.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1F2937] text-xs">
                <div>
                  <span className="text-gray-500">Available Balance</span>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    ₹{viewAccountsCustomer.availableBalance.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Total Balance</span>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                    ₹{viewAccountsCustomer.balance.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Branch Office</span>
                  <div className="text-white mt-0.5">{viewAccountsCustomer.branch}</div>
                </div>
                <div>
                  <span className="text-gray-500">IFSC Code</span>
                  <div className="text-white font-mono mt-0.5">{viewAccountsCustomer.ifsc}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewAccountsCustomer(null)}
                className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW CUSTOMER TRANSACTION HISTORY */}
      {viewTxCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Transaction History: {viewTxCustomer.fullName}
                </h3>
                <span className="text-xs text-gray-400 font-mono">
                  Account: {viewTxCustomer.accountNumber} • Balance: ₹{viewTxCustomer.balance.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setViewTxCustomer(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto border border-[#1F2937] rounded-lg">
              {transactions.filter((t) => t.accountNumber === viewTxCustomer.accountNumber).length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No transactions recorded for this customer account.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#151C2C] border-b border-[#1F2937] text-gray-400 uppercase">
                      <th className="p-2.5">Date / ID</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5 text-right">Amount</th>
                      <th className="p-2.5 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]">
                    {transactions
                      .filter((t) => t.accountNumber === viewTxCustomer.accountNumber)
                      .map((tx) => (
                        <tr key={tx.transactionId} className="hover:bg-[#151C2C]/50">
                          <td className="p-2.5">
                            <div className="font-mono text-gray-300">{tx.transactionId}</div>
                            <div className="text-[10px] text-gray-500">
                              {new Date(tx.timestamp).toLocaleString()}
                            </div>
                          </td>
                          <td className="p-2.5">
                            <div className="text-white font-medium">{tx.description}</div>
                            <div className="text-[10px] text-gray-400">Type: {tx.type}</div>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold">
                            <span className={tx.debitOrCredit === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}>
                              {tx.debitOrCredit === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono text-gray-300">
                            ₹{tx.balanceAfter.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewTxCustomer(null)}
                className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT CUSTOMER DETAILS (Strictly enforcing no editing balance, txs, IDs) */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  Edit Customer Profile
                </h3>
                <span className="text-xs text-gray-400 font-mono">
                  {editingCustomer.customerId} • Acc: {editingCustomer.accountNumber}
                </span>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Anti-tampering warning */}
            <div className="bg-[#0F1115] border border-amber-800/30 p-2.5 rounded-lg text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Compliance Policy: Ledger balances, transaction history, and account IDs are immutable and cannot be directly modified.
              </span>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Street Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">State</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    placeholder="e.g. MH"
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    placeholder="e.g. 400001"
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as AccountStatus)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="FROZEN">FROZEN</option>
                    <option value="DEACTIVATED">DEACTIVATED</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>
              </div>

              {editFormMsg && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
                    editFormMsg.isError
                      ? 'bg-red-950/40 text-red-300 border-red-800/40'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                  }`}
                >
                  {editFormMsg.isError ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>{editFormMsg.text}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#1F2937] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DELETE CUSTOMER SAFE CONFIRMATION DIALOG */}
      {deleteModalCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Customer Account Disposal
              </h3>
              <button
                onClick={() => setDeleteModalCustomer(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0F1115] p-3.5 rounded-lg border border-[#1F2937] space-y-1.5 text-xs">
              <div className="text-white font-semibold">{deleteModalCustomer.fullName}</div>
              <div className="text-gray-400 font-mono">Customer ID: {deleteModalCustomer.customerId}</div>
              <div className="text-gray-400 font-mono">Account No: {deleteModalCustomer.accountNumber}</div>
              <div className="text-gray-300">
                Current Ledger Balance: <strong className="text-emerald-400 font-mono">₹{deleteModalCustomer.balance.toLocaleString()}</strong>
              </div>
            </div>

            {deleteModalCustomer.balance > 0 ? (
              /* Safe Delete Warning for accounts with balance */
              <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-lg text-xs text-amber-300 space-y-2">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Banking Safe Delete Rule Enforced
                </div>
                <p className="leading-relaxed">
                  This customer possesses an active ledger balance of <strong>₹{deleteModalCustomer.balance.toLocaleString()}</strong>.
                  In compliance with core banking safeguards, customers with positive balances cannot be permanently deleted.
                </p>
                <p className="text-gray-300">
                  Please use <strong>Deactivate</strong> or <strong>Soft Delete</strong> to archive the account.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-red-950/30 border border-red-800/30 rounded-lg text-xs text-red-300">
                Are you sure you want to permanently delete this customer record? This action cannot be undone.
              </div>
            )}

            {deleteFeedback && (
              <div className="p-2 bg-[#0F1115] border border-blue-800/40 text-blue-300 text-xs rounded">
                {deleteFeedback}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#1F2937]">
              <button
                onClick={() => setDeleteModalCustomer(null)}
                className="px-3.5 py-1.5 bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>

              {deleteModalCustomer.balance > 0 ? (
                <>
                  <button
                    onClick={() => {
                      const res = onDeleteCustomer(deleteModalCustomer.customerId, 'DEACTIVATE');
                      setDeleteFeedback(res.message);
                      setTimeout(() => setDeleteModalCustomer(null), 1200);
                    }}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Deactivate Account
                  </button>
                  <button
                    onClick={() => {
                      const res = onDeleteCustomer(deleteModalCustomer.customerId, 'SOFT_DELETE');
                      setDeleteFeedback(res.message);
                      setTimeout(() => setDeleteModalCustomer(null), 1200);
                    }}
                    className="px-3.5 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Soft Delete (Archive)
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    const res = onDeleteCustomer(deleteModalCustomer.customerId, 'SAFE_OR_PERMANENT');
                    if (res.success) {
                      setDeleteFeedback(res.message);
                      setTimeout(() => setDeleteModalCustomer(null), 900);
                    } else {
                      setDeleteFeedback(res.message);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Permanently Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
