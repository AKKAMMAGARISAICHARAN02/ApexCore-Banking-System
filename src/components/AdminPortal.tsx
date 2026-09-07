import React, { useState } from 'react';
import { Customer, Employee, DoorstepRequest, Transaction, AuditLog, SystemSettings, KYCStatus, EmployeeAvailability } from '../types';
import { 
  Users, Briefcase, Truck, CreditCard, FileText, 
  ShieldCheck, ShieldAlert, Sliders, Plus, X, AlertCircle
} from 'lucide-react';
import { AdminCustomerManagement } from './admin/AdminCustomerManagement';
import { AdminEmployeeManagement } from './admin/AdminEmployeeManagement';
import { AdminDoorstepDispatch } from './admin/AdminDoorstepDispatch';
import { AdminAccountsView } from './admin/AdminAccountsView';
import { AdminTransactionsView } from './admin/AdminTransactionsView';
import { AdminKycCompliance } from './admin/AdminKycCompliance';
import { AdminAuditTrail } from './admin/AdminAuditTrail';
import { AdminSettingsView } from './admin/AdminSettingsView';

export type AdminTab = 
  | 'customers' 
  | 'employees' 
  | 'accounts' 
  | 'transactions' 
  | 'doorstep' 
  | 'kyc' 
  | 'audit' 
  | 'settings';

interface AdminPortalProps {
  customers: Customer[];
  employees: Employee[];
  doorstepRequests: DoorstepRequest[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => void;
  onEditCustomer: (customerId: string, updatedFields: Partial<Customer>) => { success: boolean; message: string };
  onUpdateCustomerStatus: (customerId: string, status: Customer['status']) => void;
  onDeleteCustomer: (customerId: string, mode: 'SAFE_OR_PERMANENT' | 'DEACTIVATE' | 'SOFT_DELETE') => { success: boolean; blockedByRules?: boolean; message: string };
  onAddEmployee: (employee: Omit<Employee, 'id' | 'uid' | 'assignedCount' | 'completedCount' | 'createdAt'>) => void;
  onEditEmployee: (employeeId: string, updatedFields: Partial<Employee>) => { success: boolean; message: string };
  onToggleEmployeeStatus: (employeeId: string) => void;
  onUpdateEmployeeAvailability: (employeeId: string, availability: EmployeeAvailability) => void;
  onDeleteEmployee: (employeeId: string) => { success: boolean; message: string };
  onApproveDoorstep: (requestId: string) => void;
  onAssignDoorstep: (requestId: string, employeeId: string) => { success: boolean; message: string };
  onReassignDoorstep: (requestId: string, newEmployeeId: string, reason?: string) => { success: boolean; message: string };
  onRejectDoorstep: (requestId: string, reason: string) => void;
  onUpdateSettings: (settings: SystemSettings) => void;
  onUpdateKycStatus: (customerId: string, status: KYCStatus, reason?: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  customers,
  employees,
  doorstepRequests,
  transactions,
  auditLogs,
  settings,
  onAddCustomer,
  onEditCustomer,
  onUpdateCustomerStatus,
  onDeleteCustomer,
  onAddEmployee,
  onEditEmployee,
  onToggleEmployeeStatus,
  onUpdateEmployeeAvailability,
  onDeleteEmployee,
  onApproveDoorstep,
  onAssignDoorstep,
  onReassignDoorstep,
  onRejectDoorstep,
  onUpdateSettings,
  onUpdateKycStatus,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('customers');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustCity, setNewCustCity] = useState('');
  const [newCustState, setNewCustState] = useState('');
  const [newCustPincode, setNewCustPincode] = useState('');
  const [newCustDob, setNewCustDob] = useState('1992-06-15');
  const [newCustGender, setNewCustGender] = useState('Female');
  const [newCustType, setNewCustType] = useState<'Savings' | 'Current'>('Savings');
  const [newCustDeposit, setNewCustDeposit] = useState('0');
  const [newCustKycDoc, setNewCustKycDoc] = useState('Aadhaar / National ID');
  const [newCustKycNum, setNewCustKycNum] = useState('');
  const [createCustError, setCreateCustError] = useState('');

  const pendingDoorstepCount = doorstepRequests.filter(
    (r) => r.status === 'PENDING' || r.status === 'APPROVED'
  ).length;
  const pendingKycCount = customers.filter((c) => c.kycStatus === 'PENDING').length;

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateCustError('');

    if (!newCustName.trim() || !newCustPhone.trim() || !newCustEmail.trim()) {
      setCreateCustError('Full Legal Name, Phone Number, and Email Address are mandatory.');
      return;
    }

    const custId = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
    const accNum = `1001${Math.floor(10000000 + Math.random() * 90000000)}`;
    const depositAmt = parseFloat(newCustDeposit) || 0;

    onAddCustomer({
      customerId: custId,
      accountNumber: accNum,
      fullName: newCustName.trim(),
      dob: newCustDob,
      gender: newCustGender,
      phone: newCustPhone.trim(),
      email: newCustEmail.trim(),
      address: newCustAddress.trim() || 'Primary Residence',
      city: newCustCity.trim() || 'Mumbai',
      state: newCustState.trim() || 'MH',
      pincode: newCustPincode.trim() || '400001',
      branch: settings.branch,
      ifsc: settings.ifscPrefix,
      accountType: newCustType,
      status: 'ACTIVE',
      balance: depositAmt,
      availableBalance: depositAmt,
      kycStatus: 'VERIFIED',
      kycDocType: newCustKycDoc,
      kycDocNumber: newCustKycNum.trim() || `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustAddress('');
    setNewCustCity('');
    setNewCustState('');
    setNewCustPincode('');
    setNewCustDeposit('0');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0F1115] text-[#E5E7EB] overflow-hidden">
      {/* 8-Tab Navigation Bar */}
      <div className="border-b border-[#1F2937] bg-[#111827] px-6 lg:px-8 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto py-2.5 no-scrollbar text-xs font-semibold">
          {/* 1. Customers */}
          <button
            id="tab-admin-customers"
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'customers'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'customers' ? 'bg-blue-800 text-white' : 'bg-[#1F2937] text-gray-300'
            }`}>
              {customers.length}
            </span>
          </button>

          {/* 2. Employees */}
          <button
            id="tab-admin-employees"
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'employees'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Employees</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'employees' ? 'bg-amber-800 text-white' : 'bg-[#1F2937] text-gray-300'
            }`}>
              {employees.length}
            </span>
          </button>

          {/* 3. Accounts */}
          <button
            id="tab-admin-accounts"
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'accounts'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Accounts</span>
          </button>

          {/* 4. Transactions */}
          <button
            id="tab-admin-transactions"
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Transactions</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'transactions' ? 'bg-emerald-800 text-white' : 'bg-[#1F2937] text-gray-300'
            }`}>
              {transactions.length}
            </span>
          </button>

          {/* 5. Doorstep Dispatch */}
          <button
            id="tab-admin-doorstep"
            onClick={() => setActiveTab('doorstep')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'doorstep'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Doorstep Dispatch</span>
            {pendingDoorstepCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500 text-black font-bold">
                {pendingDoorstepCount}
              </span>
            )}
          </button>

          {/* 6. KYC Compliance */}
          <button
            id="tab-admin-kyc"
            onClick={() => setActiveTab('kyc')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'kyc'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>KYC Compliance</span>
            {pendingKycCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-red-500 text-white font-bold">
                {pendingKycCount}
              </span>
            )}
          </button>

          {/* 7. Audit Trail */}
          <button
            id="tab-admin-audit"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Audit Trail</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'audit' ? 'bg-red-800 text-white' : 'bg-[#1F2937] text-gray-300'
            }`}>
              {auditLogs.length}
            </span>
          </button>

          {/* 8. Settings */}
          <button
            id="tab-admin-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-gray-700 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'customers' && (
            <AdminCustomerManagement
              customers={customers}
              transactions={transactions}
              doorstepRequests={doorstepRequests}
              onAddCustomerClick={() => setShowAddCustomerModal(true)}
              onEditCustomer={onEditCustomer}
              onUpdateCustomerStatus={onUpdateCustomerStatus}
              onDeleteCustomer={onDeleteCustomer}
              onUpdateKycStatus={onUpdateKycStatus}
            />
          )}

          {activeTab === 'employees' && (
            <AdminEmployeeManagement
              employees={employees}
              doorstepRequests={doorstepRequests}
              onAddEmployee={onAddEmployee}
              onEditEmployee={onEditEmployee}
              onToggleEmployeeStatus={onToggleEmployeeStatus}
              onUpdateEmployeeAvailability={onUpdateEmployeeAvailability}
              onDeleteEmployee={onDeleteEmployee}
            />
          )}

          {activeTab === 'accounts' && (
            <AdminAccountsView
              customers={customers}
              onUpdateStatus={onUpdateCustomerStatus}
            />
          )}

          {activeTab === 'transactions' && (
            <AdminTransactionsView transactions={transactions} />
          )}

          {activeTab === 'doorstep' && (
            <AdminDoorstepDispatch
              doorstepRequests={doorstepRequests}
              employees={employees}
              onApproveDoorstep={onApproveDoorstep}
              onAssignDoorstep={onAssignDoorstep}
              onReassignDoorstep={onReassignDoorstep}
              onRejectDoorstep={onRejectDoorstep}
            />
          )}

          {activeTab === 'kyc' && (
            <AdminKycCompliance
              customers={customers}
              onUpdateKycStatus={onUpdateKycStatus}
            />
          )}

          {activeTab === 'audit' && (
            <AdminAuditTrail auditLogs={auditLogs} />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsView
              settings={settings}
              onUpdateSettings={onUpdateSettings}
            />
          )}
        </div>
      </div>

      {/* MODAL: OPEN BANK ACCOUNT (REGISTER CUSTOMER) */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                Open Institutional Bank Account
              </h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Vikramaditya Singhania"
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    placeholder="customer@apexbank.in"
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Permanent Residential Address</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Street, Tower, Apartment"
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">State</label>
                  <input
                    type="text"
                    value={newCustState}
                    onChange={(e) => setNewCustState(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={newCustPincode}
                    onChange={(e) => setNewCustPincode(e.target.value)}
                    placeholder="400001"
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">Account Type</label>
                  <select
                    value={newCustType}
                    onChange={(e) => setNewCustType(e.target.value as 'Savings' | 'Current')}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Savings">Savings Account</option>
                    <option value="Current">Current Account</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Initial Opening Deposit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCustDeposit}
                    onChange={(e) => setNewCustDeposit(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newCustDob}
                    onChange={(e) => setNewCustDob(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">KYC Document Type</label>
                  <select
                    value={newCustKycDoc}
                    onChange={(e) => setNewCustKycDoc(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Aadhaar / National ID">Aadhaar / National ID</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Document Number</label>
                  <input
                    type="text"
                    value={newCustKycNum}
                    onChange={(e) => setNewCustKycNum(e.target.value)}
                    placeholder="e.g. 5421 8890 1234"
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {createCustError && (
                <div className="p-2 bg-red-950/40 text-red-300 border border-red-800/40 rounded flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{createCustError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#1F2937] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md cursor-pointer"
                >
                  Issue Account & Generate Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
