import React, { useState } from 'react';
import { DoorstepRequest, Employee } from '../../types';
import { 
  Truck, Search, Filter, CheckCircle2, XCircle, Clock, 
  AlertTriangle, UserCheck, RefreshCw, MapPin, Phone, 
  UserPlus, Check, X, ShieldAlert, ArrowUpRight
} from 'lucide-react';

interface AdminDoorstepDispatchProps {
  doorstepRequests: DoorstepRequest[];
  employees: Employee[];
  onApproveDoorstep: (requestId: string) => void;
  onAssignDoorstep: (requestId: string, employeeId: string) => { success: boolean; message: string };
  onReassignDoorstep: (requestId: string, newEmployeeId: string, reason?: string) => { success: boolean; message: string };
  onRejectDoorstep: (requestId: string, reason: string) => void;
}

export const AdminDoorstepDispatch: React.FC<AdminDoorstepDispatchProps> = ({
  doorstepRequests,
  employees,
  onApproveDoorstep,
  onAssignDoorstep,
  onReassignDoorstep,
  onRejectDoorstep,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modals state
  const [assignModalReq, setAssignModalReq] = useState<DoorstepRequest | null>(null);
  const [selectedAssignEmp, setSelectedAssignEmp] = useState<string>('');
  const [assignFeedback, setAssignFeedback] = useState<string | null>(null);

  const [reassignModalReq, setReassignModalReq] = useState<DoorstepRequest | null>(null);
  const [selectedReassignEmp, setSelectedReassignEmp] = useState<string>('');
  const [reassignReason, setReassignReason] = useState<string>('');
  const [reassignFeedback, setReassignFeedback] = useState<string | null>(null);

  const [rejectModalReq, setRejectModalReq] = useState<DoorstepRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const [detailModalReq, setDetailModalReq] = useState<DoorstepRequest | null>(null);

  // Filtered requests
  const filteredRequests = doorstepRequests.filter((req) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      req.requestId.toLowerCase().includes(term) ||
      req.customerName.toLowerCase().includes(term) ||
      req.accountNumber.includes(term) ||
      (req.assignedEmployeeName && req.assignedEmployeeName.toLowerCase().includes(term)) ||
      req.address.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || req.requestType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = doorstepRequests.filter((r) => r.status === 'PENDING' || r.status === 'APPROVED').length;
  const inProgressCount = doorstepRequests.filter((r) => ['ASSIGNED', 'OUT_FOR_DELIVERY', 'REACHED_LOCATION'].includes(r.status)).length;
  const completedCount = doorstepRequests.filter((r) => r.status === 'COMPLETED').length;
  const totalVolume = doorstepRequests.reduce((acc, r) => acc + (r.status !== 'REJECTED' ? r.amount : 0), 0);

  const handleOpenAssign = (req: DoorstepRequest) => {
    setAssignModalReq(req);
    // Auto-select first available employee
    const available = employees.find((e) => e.status === 'ACTIVE' && e.availability === 'Available');
    setSelectedAssignEmp(available ? available.employeeId : (employees[0]?.employeeId || ''));
    setAssignFeedback(null);
  };

  const handleConfirmAssign = () => {
    if (!assignModalReq || !selectedAssignEmp) return;
    const res = onAssignDoorstep(assignModalReq.id, selectedAssignEmp);
    if (res.success) {
      setAssignFeedback(res.message);
      setTimeout(() => {
        setAssignModalReq(null);
        setAssignFeedback(null);
      }, 800);
    } else {
      setAssignFeedback(res.message);
    }
  };

  const handleOpenReassign = (req: DoorstepRequest) => {
    setReassignModalReq(req);
    // Find an alternative employee
    const other = employees.find((e) => e.status === 'ACTIVE' && e.employeeId !== req.assignedEmployeeId);
    setSelectedReassignEmp(other ? other.employeeId : '');
    setReassignReason('Officer schedule adjustment / Route optimization');
    setReassignFeedback(null);
  };

  const handleConfirmReassign = () => {
    if (!reassignModalReq || !selectedReassignEmp) return;
    const res = onReassignDoorstep(reassignModalReq.id, selectedReassignEmp, reassignReason);
    if (res.success) {
      setReassignFeedback(res.message);
      setTimeout(() => {
        setReassignModalReq(null);
        setReassignFeedback(null);
      }, 800);
    } else {
      setReassignFeedback(res.message);
    }
  };

  const handleConfirmReject = () => {
    if (!rejectModalReq) return;
    onRejectDoorstep(rejectModalReq.id, rejectReason || 'Declined per bank verification criteria');
    setRejectModalReq(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-400" />
            Doorstep Banking Dispatch & Route Operations
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time assignment, transit monitoring, officer reassignments, and delivery completions.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-amber-400 uppercase font-medium">Awaiting Dispatch</div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">{pendingCount}</div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-blue-400 uppercase font-medium">Officers in Transit</div>
          <div className="text-xl font-bold text-blue-400 font-mono mt-1">{inProgressCount}</div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-emerald-400 uppercase font-medium">Completed Trips</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{completedCount}</div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-purple-400 uppercase font-medium">Total Dispatch Volume</div>
          <div className="text-xl font-bold text-white font-mono mt-1">₹{totalVolume.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            id="input-search-doorstep"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Request ID, customer name, account number, or officer..."
            className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#0F1115] border border-[#1F2937] px-2.5 py-1 rounded-lg text-xs">
            <span className="text-gray-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-[#111827]">All Statuses</option>
              <option value="PENDING" className="bg-[#111827]">Pending</option>
              <option value="APPROVED" className="bg-[#111827]">Approved</option>
              <option value="ASSIGNED" className="bg-[#111827]">Assigned</option>
              <option value="OUT_FOR_DELIVERY" className="bg-[#111827]">Out for Delivery</option>
              <option value="REACHED_LOCATION" className="bg-[#111827]">Reached Location</option>
              <option value="COMPLETED" className="bg-[#111827]">Completed</option>
              <option value="REJECTED" className="bg-[#111827]">Rejected</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-[#0F1115] border border-[#1F2937] px-2.5 py-1 rounded-lg text-xs">
            <span className="text-gray-400 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-[#111827]">All Types</option>
              <option value="WITHDRAWAL" className="bg-[#111827]">Cash Delivery (Withdrawal)</option>
              <option value="DEPOSIT" className="bg-[#111827]">Cash Pickup (Deposit)</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-[#1F2937] cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Dispatch Table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#151C2C] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Request / Customer</th>
                <th className="py-3 px-4">Type & Amount</th>
                <th className="py-3 px-4">Delivery Address</th>
                <th className="py-3 px-4">Assigned Officer</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/50">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <Truck className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm">No doorstep requests match your filters.</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {doorstepRequests.length === 0
                        ? 'Requests will appear here when customers book cash delivery or pickup.'
                        : 'Adjust your search parameters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isPending = req.status === 'PENDING';
                  const isApproved = req.status === 'APPROVED';
                  const isAssigned = req.status === 'ASSIGNED';
                  const inTransit = req.status === 'OUT_FOR_DELIVERY' || req.status === 'REACHED_LOCATION';
                  const isCompleted = req.status === 'COMPLETED';
                  const isRejected = req.status === 'REJECTED';

                  return (
                    <tr key={req.id} className="hover:bg-[#151C2C]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-xs">{req.requestId}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-300 font-medium mt-0.5">
                          {req.customerName}
                        </div>
                        <div className="text-[11px] font-mono text-gray-400">
                          Acc: {req.accountNumber}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            req.requestType === 'WITHDRAWAL'
                              ? 'bg-blue-950/70 text-blue-400 border border-blue-800/40'
                              : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                          }`}
                        >
                          {req.requestType === 'WITHDRAWAL' ? 'Cash Delivery' : 'Cash Pickup'}
                        </span>
                        <div className="text-base font-bold text-white font-mono mt-1">
                          ₹{req.amount.toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-300 max-w-[220px]">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{req.address}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {req.assignedEmployeeName ? (
                          <div className="text-xs">
                            <div className="font-semibold text-amber-300 flex items-center gap-1">
                              {req.assignedEmployeeName}
                            </div>
                            <div className="text-[11px] font-mono text-gray-400">
                              {req.assignedEmployeeId} • {req.assignedEmployeePhone || 'Active'}
                            </div>
                            {req.reassignedBy && (
                              <div className="text-[10px] text-purple-400 italic mt-0.5">
                                Reassigned by Admin
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isCompleted
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40'
                              : isPending
                              ? 'bg-amber-950/70 text-amber-400 border-amber-800/40'
                              : isApproved
                              ? 'bg-cyan-950/70 text-cyan-400 border-cyan-800/40'
                              : isAssigned || inTransit
                              ? 'bg-blue-950/70 text-blue-400 border-blue-800/40'
                              : 'bg-red-950/70 text-red-400 border-red-800/40'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {isAssigned && <Truck className="w-3 h-3" />}
                          {isRejected && <XCircle className="w-3 h-3" />}
                          {req.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Pending -> Approve */}
                          {isPending && (
                            <button
                              id={`btn-approve-req-${req.requestId}`}
                              onClick={() => onApproveDoorstep(req.id)}
                              className="px-2 py-1 rounded bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/50 text-xs font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                          )}

                          {/* Approved or Pending -> Assign Officer */}
                          {(isPending || isApproved) && (
                            <button
                              id={`btn-assign-req-${req.requestId}`}
                              onClick={() => handleOpenAssign(req)}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow cursor-pointer flex items-center gap-1"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Assign Officer
                            </button>
                          )}

                          {/* Assigned or In Transit -> Reassign Officer */}
                          {(isAssigned || inTransit) && (
                            <button
                              id={`btn-reassign-req-${req.requestId}`}
                              onClick={() => handleOpenReassign(req)}
                              className="px-2.5 py-1 rounded bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 border border-purple-800/50 text-xs font-semibold cursor-pointer flex items-center gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Reassign
                            </button>
                          )}

                          {/* Reject Option for active non-completed requests */}
                          {!isCompleted && !isRejected && (
                            <button
                              onClick={() => {
                                setRejectModalReq(req);
                                setRejectReason('');
                              }}
                              className="p-1 rounded bg-[#0F1115] hover:bg-red-950/50 text-gray-400 hover:text-red-400 border border-[#1F2937] cursor-pointer"
                              title="Reject Request"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* View Full Trip Details */}
                          <button
                            onClick={() => setDetailModalReq(req)}
                            className="p-1 rounded bg-[#0F1115] hover:bg-[#1F2937] text-gray-400 hover:text-white border border-[#1F2937] cursor-pointer text-xs font-mono"
                            title="Inspect Trip Details"
                          >
                            Details
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

      {/* MODAL 1: ASSIGN EMPLOYEE (with Availability Indicators) */}
      {assignModalReq && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                Assign Banking Officer
              </h3>
              <button
                onClick={() => setAssignModalReq(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] text-xs space-y-1">
              <div className="font-semibold text-white">Trip: {assignModalReq.requestId}</div>
              <div className="text-gray-300">Customer: {assignModalReq.customerName}</div>
              <div className="text-gray-400 flex items-center justify-between">
                <span>Type: <strong>{assignModalReq.requestType}</strong></span>
                <span className="font-mono text-emerald-400 font-bold">₹{assignModalReq.amount.toLocaleString()}</span>
              </div>
              <div className="text-gray-400 truncate">Address: {assignModalReq.address}</div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-gray-300 font-medium">
                Select Available Banking Officer:
              </label>

              {employees.length === 0 ? (
                <div className="p-3 bg-red-950/40 text-red-300 border border-red-800/40 rounded text-xs">
                  No registered employees found. Please register banking officers first in the Employee Management tab.
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1.5 border border-[#1F2937] rounded-lg p-2">
                  {employees.map((emp) => {
                    const isSelected = selectedAssignEmp === emp.employeeId;
                    const isAvailable = emp.availability === 'Available';
                    const isBusy = emp.availability === 'Busy';

                    return (
                      <div
                        key={emp.employeeId}
                        onClick={() => setSelectedAssignEmp(emp.employeeId)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-950/50 border-blue-600 text-white'
                            : 'bg-[#0F1115] border-[#1F2937] text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            {emp.fullName}
                            <span className="text-[10px] font-mono text-gray-400 font-normal">
                              ({emp.employeeId})
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400">{emp.designation} • {emp.phone}</div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isAvailable
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40'
                              : isBusy
                              ? 'bg-amber-950/80 text-amber-400 border-amber-800/40'
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}
                        >
                          {emp.availability || 'Available'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {assignFeedback && (
              <div className="p-2 bg-[#0F1115] border border-blue-800/40 text-blue-300 text-xs rounded">
                {assignFeedback}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1F2937]">
              <button
                onClick={() => setAssignModalReq(null)}
                className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!selectedAssignEmp}
                onClick={handleConfirmAssign}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md cursor-pointer"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REASSIGN EMPLOYEE */}
      {reassignModalReq && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-400" />
                Reassign Banking Officer
              </h3>
              <button
                onClick={() => setReassignModalReq(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] text-xs space-y-1">
              <div className="font-semibold text-white">Trip: {reassignModalReq.requestId}</div>
              <div className="text-gray-300">
                Currently Assigned Officer:{' '}
                <strong className="text-amber-400">
                  {reassignModalReq.assignedEmployeeName || 'N/A'} ({reassignModalReq.assignedEmployeeId})
                </strong>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">
                  Select Replacement Officer:
                </label>
                <select
                  value={selectedReassignEmp}
                  onChange={(e) => setSelectedReassignEmp(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer text-xs"
                >
                  <option value="">-- Choose Officer --</option>
                  {employees
                    .filter((e) => e.employeeId !== reassignModalReq.assignedEmployeeId)
                    .map((emp) => (
                      <option key={emp.employeeId} value={emp.employeeId} className="bg-[#111827]">
                        {emp.fullName} ({emp.employeeId}) - Status: {emp.availability || 'Available'}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Reassignment Reason / Operational Notes</label>
                <input
                  type="text"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Traffic delay, territory handover, emergency coverage..."
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>
            </div>

            {reassignFeedback && (
              <div className="p-2 bg-[#0F1115] border border-purple-800/40 text-purple-300 text-xs rounded">
                {reassignFeedback}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1F2937]">
              <button
                onClick={() => setReassignModalReq(null)}
                className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!selectedReassignEmp}
                onClick={handleConfirmReassign}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md cursor-pointer"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECT REQUEST */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                Decline Doorstep Request
              </h3>
              <button
                onClick={() => setRejectModalReq(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] text-xs space-y-1">
              <div className="text-white font-semibold">Request: {rejectModalReq.requestId}</div>
              <div className="text-gray-400">Customer: {rejectModalReq.customerName}</div>
              <div className="text-gray-400">Amount: ₹{rejectModalReq.amount.toLocaleString()}</div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block text-gray-300 font-medium">Rejection Reason</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for declining request (e.g., location out of bounds, verification required)..."
                className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1F2937]">
              <button
                onClick={() => setRejectModalReq(null)}
                className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow-md cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: TRIP DETAILS INSPECTOR */}
      {detailModalReq && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                Doorstep Dispatch Dossier
              </h3>
              <button
                onClick={() => setDetailModalReq(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] space-y-1">
                <div className="text-gray-400 uppercase font-semibold text-[10px]">Trip ID</div>
                <div className="font-mono text-white font-bold">{detailModalReq.requestId}</div>
                <div className="text-gray-400 mt-2 text-[10px] uppercase font-semibold">Status</div>
                <div className="text-amber-400 font-bold">{detailModalReq.status}</div>
              </div>

              <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] space-y-1">
                <div className="text-gray-400 uppercase font-semibold text-[10px]">Amount</div>
                <div className="font-mono text-emerald-400 font-bold text-base">₹{detailModalReq.amount.toLocaleString()}</div>
                <div className="text-gray-400 mt-1 text-[10px] uppercase font-semibold">Type</div>
                <div className="text-white font-medium">{detailModalReq.requestType}</div>
              </div>

              <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] col-span-2 space-y-1">
                <div className="text-gray-400 uppercase font-semibold text-[10px]">Customer Information</div>
                <div className="text-white font-semibold">{detailModalReq.customerName} ({detailModalReq.accountNumber})</div>
                <div className="text-gray-400">Phone: {detailModalReq.customerPhone}</div>
                <div className="text-gray-400">Address: {detailModalReq.address}</div>
                {detailModalReq.notes && <div className="text-gray-400 italic">Notes: {detailModalReq.notes}</div>}
              </div>

              <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] col-span-2 space-y-1.5">
                <div className="text-gray-400 uppercase font-semibold text-[10px]">Assigned Officer Logistics & Supervision</div>
                <div className="text-amber-300 font-medium">
                  {detailModalReq.assignedEmployeeName || 'Unassigned'} ({detailModalReq.assignedEmployeeId || 'N/A'})
                </div>
                {detailModalReq.employeeHeadName && (
                  <div className="text-blue-400 text-xs">
                    Branch Supervisor / Head: <span className="font-semibold text-white">{detailModalReq.employeeHeadName}</span>
                  </div>
                )}
                {detailModalReq.assignedBy && <div className="text-gray-400 text-xs">Dispatched By: {detailModalReq.assignedBy}</div>}
                {detailModalReq.assignedAt && <div className="text-gray-400 font-mono text-[11px]">Dispatched At: {new Date(detailModalReq.assignedAt).toLocaleString()}</div>}
                {detailModalReq.startedAt && <div className="text-blue-300 font-mono text-[11px]">Trip Started (On the Way): {new Date(detailModalReq.startedAt).toLocaleString()}</div>}
                {detailModalReq.arrivedAt && <div className="text-amber-300 font-mono text-[11px]">Arrived at Location: {new Date(detailModalReq.arrivedAt).toLocaleString()}</div>}
                {detailModalReq.completedAt && <div className="text-emerald-300 font-mono text-[11px]">Completed & Settled: {new Date(detailModalReq.completedAt).toLocaleString()}</div>}
                {detailModalReq.verificationOtp && (
                  <div className="text-xs text-gray-300 mt-1">
                    Security Verification OTP: <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-gray-700">{detailModalReq.verificationOtp}</span>
                  </div>
                )}
                {detailModalReq.reassignmentReason && (
                  <div className="text-purple-300 text-[11px] bg-purple-950/30 p-2 rounded border border-purple-800/40 mt-1">
                    <span className="font-semibold">Reassignment Note ({detailModalReq.reassignedBy || 'Ops'}):</span> {detailModalReq.reassignmentReason}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailModalReq(null)}
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
