import React, { useState } from 'react';
import { Employee, DoorstepRequest, EmployeeAvailability, EmployeeHead } from '../types';
import { 
  Briefcase, Users, Truck, CheckCircle2, AlertCircle, Clock, Search, 
  Plus, Edit3, UserCheck, UserX, RefreshCw, Shield, MapPin, Phone, 
  Calendar, Check, X, ChevronRight, Activity, ArrowRight, CornerDownRight, Filter
} from 'lucide-react';

interface EmployeeHeadPortalProps {
  currentHead: EmployeeHead;
  employees: Employee[];
  doorstepRequests: DoorstepRequest[];
  onAddEmployee: (emp: Omit<Employee, 'id' | 'uid' | 'assignedCount' | 'completedCount' | 'createdAt'>) => void;
  onEditEmployee: (employeeId: string, updatedFields: Partial<Employee>) => { success: boolean; message: string };
  onToggleEmployeeStatus: (employeeId: string) => void;
  onUpdateEmployeeAvailability: (employeeId: string, availability: EmployeeAvailability) => void;
  onAssignDoorstep: (requestId: string, employeeId: string, headInfo?: { headId: string; headName: string }) => { success: boolean; message: string };
  onReassignDoorstep: (requestId: string, newEmployeeId: string, reason?: string, headInfo?: { headId: string; headName: string }) => { success: boolean; message: string };
}

type TabType = 'requests' | 'employees' | 'workload' | 'history';

export const EmployeeHeadPortal: React.FC<EmployeeHeadPortalProps> = ({
  currentHead,
  employees,
  doorstepRequests,
  onAddEmployee,
  onEditEmployee,
  onToggleEmployeeStatus,
  onUpdateEmployeeAvailability,
  onAssignDoorstep,
  onReassignDoorstep,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('requests');
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING' | 'ASSIGNED' | 'ACTIVE_TRIP' | 'COMPLETED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [assignModalReq, setAssignModalReq] = useState<DoorstepRequest | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [assignFeedback, setAssignFeedback] = useState<{ error?: string; success?: string } | null>(null);

  const [reassignModalReq, setReassignModalReq] = useState<DoorstepRequest | null>(null);
  const [selectedReassigneeId, setSelectedReassigneeId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassignFeedback, setReassignFeedback] = useState<{ error?: string; success?: string } | null>(null);

  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addDesignation, setAddDesignation] = useState('Doorstep Banking Officer');
  const [addRole, setAddRole] = useState('Field Officer');
  const [addError, setAddError] = useState('');

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editAvailability, setEditAvailability] = useState<EmployeeAvailability>('AVAILABLE');
  const [editFeedback, setEditFeedback] = useState<string | null>(null);

  const [viewTasksEmp, setViewTasksEmp] = useState<Employee | null>(null);

  // Filter employees strictly by this Employee Head's branch
  const branchEmployees = employees.filter((e) => {
    // If branch matches, or if employee has this head assigned
    if (e.branch && currentHead.branch && e.branch.toLowerCase() === currentHead.branch.toLowerCase()) return true;
    if (e.employeeHeadId && e.employeeHeadId === currentHead.headId) return true;
    if (!e.branch && !currentHead.branch) return true;
    return false;
  });

  // Filter requests for this branch or assigned to branch officers
  const branchRequests = doorstepRequests.filter((r) => {
    const isBranchReq = !r.branch || !currentHead.branch || r.branch.toLowerCase() === currentHead.branch.toLowerCase();
    const isAssignedToBranchEmp = r.assignedEmployeeId && branchEmployees.some((e) => e.employeeId === r.assignedEmployeeId);
    return isBranchReq || isAssignedToBranchEmp;
  });

  // Calculate high-level stats
  const pendingRequests = branchRequests.filter((r) => r.status === 'PENDING' || r.status === 'APPROVED');
  const activeTrips = branchRequests.filter((r) => r.status === 'ASSIGNED' || r.status === 'ON_THE_WAY' || r.status === 'REACHED_LOCATION');
  const completedTrips = branchRequests.filter((r) => r.status === 'COMPLETED');
  
  const availableOfficers = branchEmployees.filter(
    (e) => e.status === 'ACTIVE' && (e.availability === 'AVAILABLE' || e.availability === 'Available')
  );
  const busyOfficers = branchEmployees.filter(
    (e) => e.status === 'ACTIVE' && (e.availability === 'BUSY' || e.availability === 'Busy')
  );

  // Helper for availability badge
  const getAvailabilityBadge = (avail: EmployeeAvailability) => {
    const normalized = avail.toUpperCase();
    if (normalized === 'AVAILABLE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> AVAILABLE
        </span>
      );
    }
    if (normalized === 'BUSY') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-400 border border-amber-800/40">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> BUSY
        </span>
      );
    }
    if (normalized === 'OFFLINE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-800 text-gray-400 border border-gray-700">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> OFFLINE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/70 text-red-400 border border-red-800/40">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> INACTIVE
      </span>
    );
  };

  // Helper for status badge
  const getStatusBadge = (status: DoorstepRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-950/70 text-amber-300 border border-amber-800/40">PENDING DISPATCH</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-950/70 text-blue-300 border border-blue-800/40">APPROVED</span>;
      case 'ASSIGNED':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-800/40">OFFICER ASSIGNED</span>;
      case 'ON_THE_WAY':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-900/70 text-blue-300 border border-blue-700 animate-pulse">IN TRANSIT (ON THE WAY)</span>;
      case 'REACHED_LOCATION':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-950/70 text-purple-300 border border-purple-800/40 animate-pulse">ARRIVED AT LOCATION</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/40">COMPLETED & SETTLED</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-950/70 text-red-300 border border-red-800/40">REJECTED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-800 text-gray-300">{status}</span>;
    }
  };

  // Action: Open Assign Modal
  const handleOpenAssign = (req: DoorstepRequest) => {
    setAssignModalReq(req);
    // Default to first available employee if any
    const firstAvail = branchEmployees.find((e) => e.status === 'ACTIVE' && (e.availability === 'AVAILABLE' || e.availability === 'Available'));
    setSelectedAssigneeId(firstAvail ? firstAvail.employeeId : (branchEmployees[0]?.employeeId || ''));
    setAssignFeedback(null);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalReq) return;
    if (!selectedAssigneeId) {
      setAssignFeedback({ error: 'Please select an officer to assign.' });
      return;
    }

    const res = onAssignDoorstep(assignModalReq.id, selectedAssigneeId, {
      headId: currentHead.headId,
      headName: currentHead.fullName,
    });

    if (res.success) {
      setAssignFeedback({ success: res.message });
      setTimeout(() => {
        setAssignModalReq(null);
        setAssignFeedback(null);
      }, 900);
    } else {
      setAssignFeedback({ error: res.message });
    }
  };

  // Action: Open Reassign Modal
  const handleOpenReassign = (req: DoorstepRequest) => {
    setReassignModalReq(req);
    // Find replacement other than currently assigned
    const candidate = branchEmployees.find((e) => e.employeeId !== req.assignedEmployeeId && e.status === 'ACTIVE');
    setSelectedReassigneeId(candidate ? candidate.employeeId : '');
    setReassignReason('');
    setReassignFeedback(null);
  };

  const handleConfirmReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignModalReq) return;
    if (!selectedReassigneeId) {
      setReassignFeedback({ error: 'Please select a replacement officer.' });
      return;
    }
    if (!reassignReason.trim()) {
      setReassignFeedback({ error: 'Reassignment reason is required for compliance and audit trail.' });
      return;
    }

    const res = onReassignDoorstep(reassignModalReq.id, selectedReassigneeId, reassignReason.trim(), {
      headId: currentHead.headId,
      headName: currentHead.fullName,
    });

    if (res.success) {
      setReassignFeedback({ success: res.message });
      setTimeout(() => {
        setReassignModalReq(null);
        setReassignFeedback(null);
      }, 900);
    } else {
      setReassignFeedback({ error: res.message });
    }
  };

  // Action: Add Employee under this branch
  const handleCreateEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!addName.trim() || !addPhone.trim() || !addEmail.trim()) {
      setAddError('Full Name, Phone Number, and Email Address are required.');
      return;
    }

    onAddEmployee({
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: addName.trim(),
      phone: addPhone.trim(),
      email: addEmail.trim(),
      designation: addDesignation.trim(),
      role: addRole.trim(),
      address: `${currentHead.branch} Desk`,
      branch: currentHead.branch,
      employeeHead: currentHead.fullName,
      employeeHeadId: currentHead.headId,
      employeeHeadName: currentHead.fullName,
      status: 'ACTIVE',
      availability: 'AVAILABLE',
    });

    setShowAddEmpModal(false);
    setAddName('');
    setAddPhone('');
    setAddEmail('');
  };

  // Action: Edit Employee
  const handleOpenEditEmp = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditName(emp.fullName);
    setEditPhone(emp.phone);
    setEditEmail(emp.email);
    setEditDesignation(emp.designation);
    setEditAvailability(emp.availability);
    setEditFeedback(null);
  };

  const handleSaveEditEmp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const res = onEditEmployee(editingEmployee.employeeId, {
      fullName: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      designation: editDesignation.trim(),
      availability: editAvailability,
    });

    if (res.success) {
      setEditFeedback('Officer record updated successfully.');
      setTimeout(() => {
        setEditingEmployee(null);
        setEditFeedback(null);
      }, 900);
    } else {
      setEditFeedback(res.message);
    }
  };

  // Filter requests list
  const filteredRequests = branchRequests.filter((r) => {
    if (requestFilter === 'PENDING' && r.status !== 'PENDING' && r.status !== 'APPROVED') return false;
    if (requestFilter === 'ASSIGNED' && r.status !== 'ASSIGNED') return false;
    if (requestFilter === 'ACTIVE_TRIP' && r.status !== 'ON_THE_WAY' && r.status !== 'REACHED_LOCATION') return false;
    if (requestFilter === 'COMPLETED' && r.status !== 'COMPLETED') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = r.requestId.toLowerCase().includes(q);
      const matchCust = r.customerName.toLowerCase().includes(q);
      const matchAcc = r.accountNumber.toLowerCase().includes(q);
      const matchEmp = (r.assignedEmployeeName || '').toLowerCase().includes(q);
      if (!matchId && !matchCust && !matchAcc && !matchEmp) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6 lg:p-8 space-y-6">
      {/* Top Profile Header for Employee Head */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 shadow-xl shadow-black/30 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-950/50 border border-indigo-800/40 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-2xl shadow-inner">
              <Users className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono uppercase bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded">
                  EMPLOYEE HEAD • BRANCH OPERATIONS
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{currentHead.fullName}</h2>
              <p className="text-xs text-gray-400 mt-0.5 flex flex-wrap items-center gap-3">
                <span>Supervisor ID: <strong className="font-mono text-indigo-400">{currentHead.headId}</strong></span>
                <span>•</span>
                <span>Branch: <strong className="text-gray-200">{currentHead.branch}</strong></span>
                <span>•</span>
                <span>Designation: {currentHead.designation}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-[#0F1115] border border-[#1F2937] px-4 py-2.5 rounded-lg text-center min-w-[90px]">
              <div className="text-[11px] text-gray-400 uppercase font-medium">Branch Staff</div>
              <div className="text-xl font-bold text-white font-mono">{branchEmployees.length}</div>
            </div>
            <div className="bg-[#0F1115] border border-amber-900/30 px-4 py-2.5 rounded-lg text-center min-w-[90px]">
              <div className="text-[11px] text-amber-400 uppercase font-medium">Pending</div>
              <div className="text-xl font-bold text-amber-400 font-mono">{pendingRequests.length}</div>
            </div>
            <div className="bg-[#0F1115] border border-indigo-900/30 px-4 py-2.5 rounded-lg text-center min-w-[90px]">
              <div className="text-[11px] text-indigo-400 uppercase font-medium">Active Trips</div>
              <div className="text-xl font-bold text-indigo-400 font-mono">{activeTrips.length}</div>
            </div>
            <div className="bg-[#0F1115] border border-emerald-900/30 px-4 py-2.5 rounded-lg text-center min-w-[90px]">
              <div className="text-[11px] text-emerald-400 uppercase font-medium">Completed</div>
              <div className="text-xl font-bold text-emerald-400 font-mono">{completedTrips.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F2937] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-[#151C2C] text-indigo-400 border border-indigo-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            Doorstep Requests ({branchRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'employees'
                ? 'bg-[#151C2C] text-indigo-400 border border-indigo-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Branch Field Officers ({branchEmployees.length})
          </button>

          <button
            onClick={() => setActiveTab('workload')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'workload'
                ? 'bg-[#151C2C] text-indigo-400 border border-indigo-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            Workload & Availability
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[#151C2C] text-indigo-400 border border-indigo-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Service History ({completedTrips.length})
          </button>
        </div>

        {activeTab === 'employees' && (
          <button
            onClick={() => setShowAddEmpModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-900/40"
          >
            <Plus className="w-4 h-4" /> Add Branch Officer
          </button>
        )}
      </div>

      {/* TAB 1: DOORSTEP REQUESTS & DISPATCH */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Filter:</span>
              <button
                onClick={() => setRequestFilter('ALL')}
                className={`px-3 py-1 text-xs rounded-lg font-medium cursor-pointer ${
                  requestFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-[#0F1115] text-gray-400 hover:text-white'
                }`}
              >
                All ({branchRequests.length})
              </button>
              <button
                onClick={() => setRequestFilter('PENDING')}
                className={`px-3 py-1 text-xs rounded-lg font-medium cursor-pointer ${
                  requestFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-[#0F1115] text-gray-400 hover:text-white'
                }`}
              >
                Pending Dispatch ({pendingRequests.length})
              </button>
              <button
                onClick={() => setRequestFilter('ASSIGNED')}
                className={`px-3 py-1 text-xs rounded-lg font-medium cursor-pointer ${
                  requestFilter === 'ASSIGNED' ? 'bg-indigo-600 text-white' : 'bg-[#0F1115] text-gray-400 hover:text-white'
                }`}
              >
                Assigned ({branchRequests.filter((r) => r.status === 'ASSIGNED').length})
              </button>
              <button
                onClick={() => setRequestFilter('ACTIVE_TRIP')}
                className={`px-3 py-1 text-xs rounded-lg font-medium cursor-pointer ${
                  requestFilter === 'ACTIVE_TRIP' ? 'bg-blue-600 text-white' : 'bg-[#0F1115] text-gray-400 hover:text-white'
                }`}
              >
                In Transit / At Door ({branchRequests.filter((r) => r.status === 'ON_THE_WAY' || r.status === 'REACHED_LOCATION').length})
              </button>
              <button
                onClick={() => setRequestFilter('COMPLETED')}
                className={`px-3 py-1 text-xs rounded-lg font-medium cursor-pointer ${
                  requestFilter === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-[#0F1115] text-gray-400 hover:text-white'
                }`}
              >
                Completed ({completedTrips.length})
              </button>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Request ID, Customer, Officer..."
                className="w-full bg-[#0F1115] border border-[#1F2937] text-white text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Requests Grid / Table */}
          {filteredRequests.length === 0 ? (
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-12 text-center text-gray-400">
              <Truck className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-base font-medium text-gray-300">No requests found matching your filter.</p>
              <p className="text-xs text-gray-500 mt-1">Incoming customer doorstep banking requests for {currentHead.branch} will appear here instantly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => {
                const isDelivery = req.requestType === 'WITHDRAWAL';
                const isAssigned = !!req.assignedEmployeeId;
                const canAssign = req.status === 'PENDING' || req.status === 'APPROVED';
                const canReassign = req.status === 'ASSIGNED' || req.status === 'ON_THE_WAY';

                return (
                  <div
                    key={req.id}
                    className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-indigo-500/30 transition-colors shadow-lg shadow-black/20"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Left: Request Details */}
                      <div className="space-y-2 flex-1 min-w-[280px]">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-bold ${
                              isDelivery
                                ? 'bg-red-950/70 text-red-300 border border-red-800/40'
                                : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40'
                            }`}
                          >
                            {isDelivery ? 'Doorstep Cash Delivery' : 'Doorstep Cash Deposit'}
                          </span>
                          <span className="font-mono text-xs text-blue-400 font-semibold">{req.requestId}</span>
                          {getStatusBadge(req.status)}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs">
                          <div>
                            <span className="text-gray-400 block">Customer:</span>
                            <strong className="text-white text-sm">{req.customerName}</strong>
                            <div className="text-gray-400 font-mono text-[11px] mt-0.5">Acc: {req.accountNumber}</div>
                            {req.customerPhone && (
                              <div className="text-blue-400 text-[11px] flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" /> {req.customerPhone}
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="text-gray-400 block">Location & Address:</span>
                            <div className="text-gray-300 flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{req.address}</span>
                            </div>
                            <div className="text-gray-400 text-[11px] mt-1">
                              Preferred Time: <strong className="text-indigo-300">{req.preferredTime || 'Standard Slot'}</strong>
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-400 block">Assigned Officer:</span>
                            {req.assignedEmployeeName ? (
                              <div>
                                <strong className="text-white text-sm flex items-center gap-1">
                                  {req.assignedEmployeeName}
                                  <span className="text-[11px] text-gray-400 font-mono">({req.assignedEmployeeId})</span>
                                </strong>
                                <div className="text-[11px] text-gray-400 mt-0.5">
                                  Assigned By: {req.assignedBy || 'Branch Head'}
                                </div>
                                {req.assignedAt && (
                                  <div className="text-[11px] text-gray-500 font-mono">
                                    {new Date(req.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-amber-400 text-xs font-medium">Unassigned • Needs Field Officer</span>
                            )}
                          </div>
                        </div>

                        {req.reassignmentReason && (
                          <div className="bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-lg text-xs text-amber-300">
                            <strong>Reassigned:</strong> {req.reassignmentReason} (by {req.reassignedBy})
                          </div>
                        )}
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="text-right flex flex-col justify-between space-y-3 min-w-[170px]">
                        <div>
                          <div className="text-xs text-gray-400 uppercase font-medium">Order Amount</div>
                          <div className="text-2xl font-extrabold text-white font-mono">
                            ₹{req.amount.toLocaleString()}
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            Created: {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          {canAssign && (
                            <button
                              onClick={() => handleOpenAssign(req)}
                              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-900/30"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              [Assign Employee]
                            </button>
                          )}

                          {canReassign && (
                            <button
                              onClick={() => handleOpenReassign(req)}
                              className="w-full py-2 px-3 bg-[#1E293B] hover:bg-[#334155] border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              [Reassign]
                            </button>
                          )}

                          {req.status === 'COMPLETED' && (
                            <div className="text-xs text-emerald-400 font-medium flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Trip Settled
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY BRANCH EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-lg shadow-black/20">
            <div className="p-4 bg-[#151C2C] border-b border-[#1F2937] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Field Officers under {currentHead.branch}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Supervised by Employee Head: <strong className="text-white">{currentHead.fullName}</strong> ({currentHead.headId})
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-400">Available: <strong>{availableOfficers.length}</strong></span>
                <span className="text-gray-500">•</span>
                <span className="text-amber-400">Busy: <strong>{busyOfficers.length}</strong></span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">Total Officers: <strong>{branchEmployees.length}</strong></span>
              </div>
            </div>

            {branchEmployees.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p className="text-base font-medium text-gray-300">No field officers registered under {currentHead.branch}.</p>
                <p className="text-xs text-gray-500 mt-1">Click "Add Branch Officer" above to register officers reporting to your supervision.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0F1115] text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-[#1F2937]">
                      <th className="px-5 py-3">Officer Details</th>
                      <th className="px-5 py-3">Contact</th>
                      <th className="px-5 py-3">Availability</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-center">Workload (Active / Done)</th>
                      <th className="px-5 py-3 text-right">Supervisor Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]">
                    {branchEmployees.map((emp) => {
                      const empActiveTasks = branchRequests.filter(
                        (r) => r.assignedEmployeeId === emp.employeeId && r.status !== 'COMPLETED' && r.status !== 'REJECTED'
                      );
                      const empDoneTasks = branchRequests.filter(
                        (r) => r.assignedEmployeeId === emp.employeeId && r.status === 'COMPLETED'
                      );

                      return (
                        <tr key={emp.employeeId} className="hover:bg-[#151C2C]/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-white text-sm">{emp.fullName}</div>
                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                              ID: <strong className="text-amber-400">{emp.employeeId}</strong> • {emp.designation}
                            </div>
                          </td>

                          <td className="px-5 py-3.5 space-y-0.5">
                            <div className="text-gray-300 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-blue-400" /> {emp.phone}
                            </div>
                            <div className="text-gray-400 text-[11px]">{emp.email}</div>
                          </td>

                          <td className="px-5 py-3.5">
                            {getAvailabilityBadge(emp.availability)}
                          </td>

                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                emp.status === 'ACTIVE'
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                                  : 'bg-red-950/60 text-red-300 border border-red-800/40'
                              }`}
                            >
                              {emp.status}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-center">
                            <div className="inline-flex items-center gap-2 bg-[#0F1115] border border-[#1F2937] px-3 py-1 rounded-lg">
                              <span className="text-amber-400 font-bold font-mono text-xs">{empActiveTasks.length} active</span>
                              <span className="text-gray-600">/</span>
                              <span className="text-emerald-400 font-bold font-mono text-xs">{empDoneTasks.length} done</span>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 text-right space-x-2">
                            <button
                              onClick={() => setViewTasksEmp(emp)}
                              className="px-2.5 py-1.5 bg-[#1E293B] hover:bg-[#334155] border border-gray-700 text-gray-200 rounded text-xs cursor-pointer font-medium"
                              title="View assigned tasks"
                            >
                              View Tasks
                            </button>

                            <button
                              onClick={() => handleOpenEditEmp(emp)}
                              className="px-2.5 py-1.5 bg-[#1E293B] hover:bg-blue-900/40 border border-blue-700/50 text-blue-300 rounded text-xs cursor-pointer font-medium"
                              title="Edit officer details"
                            >
                              <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                            </button>

                            <button
                              onClick={() => onToggleEmployeeStatus(emp.employeeId)}
                              className={`px-2.5 py-1.5 rounded text-xs cursor-pointer font-medium border ${
                                emp.status === 'ACTIVE'
                                  ? 'bg-red-950/40 hover:bg-red-900/50 border-red-800/50 text-red-300'
                                  : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-800/50 text-emerald-300'
                              }`}
                              title={emp.status === 'ACTIVE' ? 'Deactivate officer' : 'Activate officer'}
                            >
                              {emp.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: WORKLOAD & AVAILABILITY MONITOR */}
      {activeTab === 'workload' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
              <div className="text-xs text-gray-400 uppercase font-medium">Available Officers Ready for Trips</div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                {availableOfficers.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Standing by at {currentHead.branch} for instant dispatch.</p>
            </div>

            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
              <div className="text-xs text-gray-400 uppercase font-medium">Currently Busy on Active Tasks</div>
              <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">
                {busyOfficers.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Field officers actively en route or fulfilling customer orders.</p>
            </div>

            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
              <div className="text-xs text-gray-400 uppercase font-medium">Unassigned Pending Orders</div>
              <div className="text-3xl font-extrabold text-indigo-400 font-mono mt-1">
                {pendingRequests.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Doorstep requests awaiting allocation to available staff.</p>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Real-Time Officer Availability & Assigned Load
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branchEmployees.map((emp) => {
                const assignedTasks = branchRequests.filter((r) => r.assignedEmployeeId === emp.employeeId && r.status !== 'COMPLETED' && r.status !== 'REJECTED');
                return (
                  <div
                    key={emp.employeeId}
                    className="bg-[#0F1115] border border-[#1F2937] rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-white text-sm">{emp.fullName}</div>
                        <div className="text-xs text-gray-400 font-mono">{emp.employeeId} • {emp.designation}</div>
                      </div>
                      {getAvailabilityBadge(emp.availability)}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1F2937]">
                      <span className="text-gray-400">Current Assigned Tasks:</span>
                      <strong className={assignedTasks.length > 0 ? 'text-amber-400 font-mono' : 'text-gray-500 font-mono'}>
                        {assignedTasks.length} {assignedTasks.length === 1 ? 'task' : 'tasks'}
                      </strong>
                    </div>

                    {assignedTasks.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {assignedTasks.map((t) => (
                          <div key={t.id} className="bg-[#151C2C] p-2 rounded text-xs flex items-center justify-between">
                            <span className="font-mono text-blue-400">{t.requestId}</span>
                            <span className="text-gray-300 font-medium">₹{t.amount.toLocaleString()}</span>
                            <span className="text-[10px] text-amber-400 uppercase font-semibold">{t.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE HISTORY & COMPLETED TRIPS */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-lg shadow-black/20">
            <div className="p-4 bg-[#151C2C] border-b border-[#1F2937] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Completed Doorstep Banking Orders ({completedTrips.length})
              </h3>
              <span className="text-xs text-gray-400 font-mono">Branch: {currentHead.branch}</span>
            </div>

            {completedTrips.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <CheckCircle2 className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p className="text-base font-medium text-gray-300">No completed doorstep trips recorded yet.</p>
                <p className="text-xs text-gray-500 mt-1">Once field officers authenticate customer OTPs and deliver or collect cash, settled trips will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0F1115] text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-[#1F2937]">
                      <th className="px-5 py-3">Completed Time</th>
                      <th className="px-5 py-3">Request ID & Type</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Fulfilling Officer</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]">
                    {completedTrips.map((req) => (
                      <tr key={req.id} className="hover:bg-[#151C2C]/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-gray-400">
                          {new Date(req.completedAt || req.updatedAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-mono text-blue-400 font-semibold">{req.requestId}</div>
                          <div className="text-[11px] text-gray-400">
                            {req.requestType === 'WITHDRAWAL' ? 'Cash Delivery' : 'Cash Deposit'}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-white">{req.customerName}</div>
                          <div className="font-mono text-gray-400 text-[11px]">Acc: {req.accountNumber}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-gray-200 font-medium">{req.assignedEmployeeName || 'Agent'}</div>
                          <div className="text-gray-500 font-mono text-[11px]">{req.assignedEmployeeId}</div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-sm font-bold text-white">
                          ₹{req.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                            SETTLED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ASSIGN EMPLOYEE MODAL (Requirement 4) */}
      {assignModalReq && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div className="flex items-center gap-2.5 text-indigo-400 font-semibold text-base">
                <UserCheck className="w-5 h-5" />
                <span>Assign Field Officer</span>
              </div>
              <button
                onClick={() => setAssignModalReq(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Request Summary */}
            <div className="bg-[#0F1115] border border-[#1F2937] p-4 rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Order ID:</span>
                <strong className="text-blue-400 font-mono">{assignModalReq.requestId}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Customer:</span>
                <strong className="text-white">{assignModalReq.customerName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Request Type:</span>
                <strong className={assignModalReq.requestType === 'WITHDRAWAL' ? 'text-red-400' : 'text-emerald-400'}>
                  {assignModalReq.requestType === 'WITHDRAWAL' ? 'Cash Delivery' : 'Cash Deposit'}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Order Amount:</span>
                <strong className="text-white text-sm font-mono">₹{assignModalReq.amount.toLocaleString()}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Delivery Address:</span>
                <span className="text-gray-300 text-right max-w-[240px] truncate">{assignModalReq.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Preferred Time:</span>
                <span className="text-indigo-300 font-medium">{assignModalReq.preferredTime || 'Immediate / Regular'}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Select Active Officer (Branch: {currentHead.branch}):
                </label>
                {branchEmployees.length === 0 ? (
                  <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-lg text-xs text-red-300">
                    No field officers registered under this branch. Please add an employee first.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {branchEmployees.map((emp) => {
                      const isAvail = emp.status === 'ACTIVE' && (emp.availability === 'AVAILABLE' || emp.availability === 'Available');
                      const isSelected = selectedAssigneeId === emp.employeeId;

                      return (
                        <label
                          key={emp.employeeId}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-950/60 border-indigo-500 text-white'
                              : 'bg-[#0F1115] border-[#1F2937] text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="assignee"
                              value={emp.employeeId}
                              checked={isSelected}
                              onChange={(e) => setSelectedAssigneeId(e.target.value)}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <div className="font-semibold text-xs text-white flex items-center gap-2">
                                <span>{emp.fullName} — {isAvail ? 'Available' : 'Busy'}</span>
                              </div>
                              <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                                {emp.employeeId} • {emp.phone}
                              </div>
                            </div>
                          </div>
                          {getAvailabilityBadge(emp.availability)}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {assignFeedback?.error && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {assignFeedback.error}
                </p>
              )}
              {assignFeedback?.success && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {assignFeedback.success}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setAssignModalReq(null)}
                  className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={branchEmployees.length === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-900/40"
                >
                  <Check className="w-4 h-4" />
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REASSIGN DOORSTEP REQUEST (Requirement 7) */}
      {reassignModalReq && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-base">
                <RefreshCw className="w-5 h-5" />
                <span>Reassign Doorstep Task</span>
              </div>
              <button
                onClick={() => setReassignModalReq(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0F1115] border border-[#1F2937] p-3.5 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Request:</span>
                <strong className="text-blue-400 font-mono">{reassignModalReq.requestId} (₹{reassignModalReq.amount.toLocaleString()})</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Current Assigned Officer:</span>
                <strong className="text-amber-400">{reassignModalReq.assignedEmployeeName || 'Agent'} ({reassignModalReq.assignedEmployeeId})</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmReassign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Select Replacement Officer:
                </label>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {branchEmployees
                    .filter((e) => e.employeeId !== reassignModalReq.assignedEmployeeId)
                    .map((emp) => {
                      const isAvail = emp.status === 'ACTIVE' && (emp.availability === 'AVAILABLE' || emp.availability === 'Available');
                      const isSelected = selectedReassigneeId === emp.employeeId;

                      return (
                        <label
                          key={emp.employeeId}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-950/50 border-amber-500 text-white'
                              : 'bg-[#0F1115] border-[#1F2937] text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="reassignee"
                              value={emp.employeeId}
                              checked={isSelected}
                              onChange={(e) => setSelectedReassigneeId(e.target.value)}
                              className="text-amber-600 focus:ring-amber-500"
                            />
                            <div>
                              <div className="font-semibold text-xs text-white">
                                {emp.fullName} — {isAvail ? 'Available' : 'Busy'}
                              </div>
                              <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                                {emp.employeeId} • {emp.phone}
                              </div>
                            </div>
                          </div>
                          {getAvailabilityBadge(emp.availability)}
                        </label>
                      );
                    })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Reassignment Reason (Mandatory for Audit Trail):
                </label>
                <input
                  type="text"
                  required
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Officer vehicle breakdown / route congestion rebalancing"
                  className="w-full bg-[#0F1115] border border-[#1F2937] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              {reassignFeedback?.error && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {reassignFeedback.error}
                </p>
              )}
              {reassignFeedback?.success && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {reassignFeedback.success}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setReassignModalReq(null)}
                  className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-900/40"
                >
                  <RefreshCw className="w-4 h-4" />
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD EMPLOYEE (UNDER BRANCH) */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div className="flex items-center gap-2.5 text-indigo-400 font-semibold text-base">
                <Plus className="w-5 h-5" />
                <span>Add Branch Field Officer</span>
              </div>
              <button
                onClick={() => setShowAddEmpModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0F1115] border border-[#1F2937] p-3 rounded-lg text-xs space-y-1 text-gray-400">
              <div>Assigned Branch: <strong className="text-white">{currentHead.branch}</strong></div>
              <div>Supervising Employee Head: <strong className="text-indigo-400">{currentHead.fullName}</strong> ({currentHead.headId})</div>
            </div>

            <form onSubmit={handleCreateEmployeeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full bg-[#0F1115] border border-[#1F2937] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#0F1115] border border-[#1F2937] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="suresh@apexcore.bank"
                    className="w-full bg-[#0F1115] border border-[#1F2937] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Designation</label>
                  <input
                    type="text"
                    value={addDesignation}
                    onChange={(e) => setAddDesignation(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Role</label>
                  <input
                    type="text"
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {addError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {addError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-900/40"
                >
                  <Plus className="w-4 h-4" />
                  Create Officer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT EMPLOYEE */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div className="flex items-center gap-2.5 text-blue-400 font-semibold text-base">
                <Edit3 className="w-5 h-5" />
                <span>Edit Officer: {editingEmployee.fullName}</span>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditEmp} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#1F2937] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Designation</label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Availability Override</label>
                  <select
                    value={editAvailability}
                    onChange={(e) => setEditAvailability(e.target.value as EmployeeAvailability)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BUSY">BUSY</option>
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {editFeedback && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {editFeedback}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: VIEW ASSIGNED TASKS OF AN EMPLOYEE */}
      {viewTasksEmp && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  Task Dossier: {viewTasksEmp.fullName}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  ID: <span className="font-mono text-amber-400">{viewTasksEmp.employeeId}</span> • Branch: {viewTasksEmp.branch}
                </p>
              </div>
              <button
                onClick={() => setViewTasksEmp(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {branchRequests.filter((r) => r.assignedEmployeeId === viewTasksEmp.employeeId).length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs font-mono">
                  No doorstep tasks have been dispatched to this officer yet.
                </div>
              ) : (
                branchRequests
                  .filter((r) => r.assignedEmployeeId === viewTasksEmp.employeeId)
                  .map((task) => (
                    <div key={task.id} className="bg-[#0F1115] border border-[#1F2937] p-3.5 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-blue-400 font-semibold">{task.requestId}</span>
                          <span className="text-gray-400">({task.requestType === 'WITHDRAWAL' ? 'Cash Delivery' : 'Cash Deposit'})</span>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>
                      <div className="flex items-center justify-between text-gray-300">
                        <span>Customer: <strong className="text-white">{task.customerName}</strong></span>
                        <span className="font-mono font-bold text-white">₹{task.amount.toLocaleString()}</span>
                      </div>
                      <div className="text-gray-400 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" /> {task.address}
                      </div>
                      {task.completedAt && (
                        <div className="text-[11px] text-emerald-400 font-mono">
                          Completed At: {new Date(task.completedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>

            <div className="pt-3 border-t border-[#1F2937] text-right">
              <button
                onClick={() => setViewTasksEmp(null)}
                className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
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
