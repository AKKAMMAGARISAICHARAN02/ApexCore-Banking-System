import React, { useState } from 'react';
import { Employee, DoorstepRequest, EmployeeAvailability } from '../../types';
import { 
  Briefcase, Search, Plus, Edit3, Trash2, CheckCircle2, 
  XCircle, Clock, Truck, ShieldAlert, UserCheck, UserX, X,
  MapPin, Phone, Mail, AlertCircle, AlertTriangle, Check
} from 'lucide-react';

interface AdminEmployeeManagementProps {
  employees: Employee[];
  doorstepRequests: DoorstepRequest[];
  onAddEmployee: (employee: Omit<Employee, 'id' | 'uid' | 'assignedCount' | 'completedCount' | 'createdAt'>) => void;
  onEditEmployee: (employeeId: string, updatedFields: Partial<Employee>) => { success: boolean; message: string };
  onToggleEmployeeStatus: (employeeId: string) => void;
  onUpdateEmployeeAvailability: (employeeId: string, availability: EmployeeAvailability) => void;
  onDeleteEmployee: (employeeId: string) => { success: boolean; message: string };
}

export const AdminEmployeeManagement: React.FC<AdminEmployeeManagementProps> = ({
  employees,
  doorstepRequests,
  onAddEmployee,
  onEditEmployee,
  onToggleEmployeeStatus,
  onUpdateEmployeeAvailability,
  onDeleteEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [availFilter, setAvailFilter] = useState<string>('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewTasksEmployee, setViewTasksEmployee] = useState<Employee | null>(null);
  const [viewHistoryEmployee, setViewHistoryEmployee] = useState<Employee | null>(null);
  const [deleteModalEmployee, setDeleteModalEmployee] = useState<Employee | null>(null);

  // Add Employee Form
  const [addName, setAddName] = useState('');
  const [addId, setAddId] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addDesignation, setAddDesignation] = useState('Doorstep Banking Officer');
  const [addRole, setAddRole] = useState('Field Agent');
  const [addAddress, setAddAddress] = useState('');
  const [addCity, setAddCity] = useState('');
  const [addState, setAddState] = useState('');
  const [addPincode, setAddPincode] = useState('');
  const [addStatus, setAddStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [addAvailability, setAddAvailability] = useState<EmployeeAvailability>('Available');
  const [addError, setAddError] = useState('');

  // Edit Employee Form
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE' | 'DEACTIVATED'>('ACTIVE');
  const [editAvailability, setEditAvailability] = useState<EmployeeAvailability>('Available');
  const [editFeedback, setEditFeedback] = useState<string | null>(null);

  // Delete feedback
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setAddName('');
    setAddId(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
    setAddPhone('');
    setAddEmail('');
    setAddDesignation('Doorstep Banking Officer');
    setAddRole('Field Agent');
    setAddAddress('');
    setAddCity('');
    setAddState('');
    setAddPincode('');
    setAddStatus('ACTIVE');
    setAddAvailability('Available');
    setAddError('');
    setShowAddModal(true);
  };

  const handleCreateEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!addName.trim() || !addPhone.trim() || !addEmail.trim()) {
      setAddError('Full Name, Phone Number, and Email Address are required.');
      return;
    }

    onAddEmployee({
      employeeId: addId.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: addName.trim(),
      phone: addPhone.trim(),
      email: addEmail.trim(),
      designation: addDesignation.trim(),
      role: addRole.trim(),
      address: addAddress.trim() || 'Central Branch Logistics Desk',
      city: addCity.trim(),
      state: addState.trim(),
      pincode: addPincode.trim(),
      branch: 'Apex Central Flagship',
      status: addStatus,
      availability: addAvailability,
    });

    setShowAddModal(false);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditName(emp.fullName || '');
    setEditPhone(emp.phone || '');
    setEditEmail(emp.email || '');
    setEditDesignation(emp.designation || 'Doorstep Banking Officer');
    setEditRole(emp.role || 'Field Agent');
    setEditAddress(emp.address || '');
    setEditCity(emp.city || '');
    setEditState(emp.state || '');
    setEditPincode(emp.pincode || '');
    setEditStatus(emp.status || 'ACTIVE');
    setEditAvailability(emp.availability || 'Available');
    setEditFeedback(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    if (!editName.trim() || !editPhone.trim() || !editEmail.trim()) {
      setEditFeedback('Full Name, Phone, and Email are required.');
      return;
    }

    const res = onEditEmployee(editingEmployee.employeeId, {
      fullName: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      designation: editDesignation.trim(),
      role: editRole.trim(),
      address: editAddress.trim(),
      city: editCity.trim(),
      state: editState.trim(),
      pincode: editPincode.trim(),
      status: editStatus,
      availability: editAvailability,
    });

    if (res.success) {
      setEditFeedback('Employee updated successfully.');
      setTimeout(() => {
        setEditingEmployee(null);
        setEditFeedback(null);
      }, 900);
    } else {
      setEditFeedback(res.message);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      emp.fullName.toLowerCase().includes(term) ||
      emp.employeeId.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.phone.includes(term) ||
      emp.designation.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
    const matchesAvail = availFilter === 'ALL' || emp.availability === availFilter;

    return matchesSearch && matchesStatus && matchesAvail;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-400" />
            Employee & Officer Management
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Administer banking officers, field agents, service desks, assignments, and availability statuses.
          </p>
        </div>

        <button
          id="btn-admin-add-employee"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-amber-900/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Banking Officer
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-gray-400 uppercase font-medium">Total Staff</div>
          <div className="text-xl font-bold text-white font-mono mt-1">{employees.length}</div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-emerald-400 uppercase font-medium">Available for Trips</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            {employees.filter((e) => e.status === 'ACTIVE' && e.availability === 'Available').length}
          </div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-amber-400 uppercase font-medium">On Active Trips (Busy)</div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">
            {employees.filter((e) => e.availability === 'Busy').length}
          </div>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-xl">
          <div className="text-[11px] text-gray-400 uppercase font-medium">Completed Deliveries</div>
          <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
            {employees.reduce((acc, e) => acc + (e.completedCount || 0), 0)}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            id="input-search-employees"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by officer name, employee ID, phone, email, designation..."
            className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
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
              <option value="ACTIVE" className="bg-[#111827]">Active</option>
              <option value="INACTIVE" className="bg-[#111827]">Inactive</option>
              <option value="DEACTIVATED" className="bg-[#111827]">Deactivated</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div className="flex items-center gap-1.5 bg-[#0F1115] border border-[#1F2937] px-2.5 py-1 rounded-lg text-xs">
            <span className="text-gray-400 font-medium">Availability:</span>
            <select
              value={availFilter}
              onChange={(e) => setAvailFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-[#111827]">All</option>
              <option value="Available" className="bg-[#111827]">Available</option>
              <option value="Busy" className="bg-[#111827]">Busy</option>
              <option value="Offline" className="bg-[#111827]">Offline</option>
              <option value="Inactive" className="bg-[#111827]">Inactive</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'ALL' || availFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setAvailFilter('ALL');
              }}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-[#1F2937] cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Employees Table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#151C2C] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Officer Information</th>
                <th className="py-3 px-4">Designation & Role</th>
                <th className="py-3 px-4 text-center">Availability Status</th>
                <th className="py-3 px-4 text-center">Assigned / Done</th>
                <th className="py-3 px-4 text-center">Account</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/50">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <Briefcase className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm">No employee records found.</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {employees.length === 0
                        ? 'Click "Add Banking Officer" to register your first bank employee.'
                        : 'Adjust your search query or status filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isActive = emp.status === 'ACTIVE';
                  const activeTasks = doorstepRequests.filter(
                    (r) => r.assignedEmployeeId === emp.employeeId && r.status !== 'COMPLETED' && r.status !== 'REJECTED'
                  );
                  const completedTasks = doorstepRequests.filter(
                    (r) => r.assignedEmployeeId === emp.employeeId && r.status === 'COMPLETED'
                  );

                  return (
                    <tr key={emp.employeeId} className="hover:bg-[#151C2C]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center gap-2">
                          {emp.fullName}
                          <span className="text-[10px] font-mono text-amber-400 font-normal">
                            ({emp.employeeId})
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{emp.phone}</span>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{emp.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-200 font-medium">{emp.designation}</div>
                        <div className="text-[11px] text-gray-400">{emp.role || 'Field Banking Agent'}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {/* Interactive Availability Indicator */}
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            value={emp.availability || 'Available'}
                            onChange={(e) =>
                              onUpdateEmployeeAvailability(emp.employeeId, e.target.value as EmployeeAvailability)
                            }
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                              emp.availability === 'Available'
                                ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40'
                                : emp.availability === 'Busy'
                                ? 'bg-amber-950/70 text-amber-400 border-amber-800/40'
                                : emp.availability === 'Offline'
                                ? 'bg-gray-800/70 text-gray-400 border-gray-700/40'
                                : 'bg-red-950/70 text-red-400 border-red-800/40'
                            }`}
                          >
                            <option value="Available" className="bg-[#111827] text-emerald-400">Available</option>
                            <option value="Busy" className="bg-[#111827] text-amber-400">Busy (On Trip)</option>
                            <option value="Offline" className="bg-[#111827] text-gray-400">Offline</option>
                            <option value="Inactive" className="bg-[#111827] text-red-400">Inactive</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs">
                        <span className="text-amber-400 font-bold">{activeTasks.length}</span>
                        <span className="text-gray-500"> / </span>
                        <span className="text-emerald-400 font-bold">{completedTasks.length}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isActive
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40'
                              : 'bg-red-950/70 text-red-400 border-red-800/40'
                          }`}
                        >
                          {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Tasks */}
                          <button
                            onClick={() => setViewTasksEmployee(emp)}
                            title="View Assigned Tasks"
                            className="p-1.5 rounded-lg bg-[#0F1115] hover:bg-[#1F2937] text-blue-400 hover:text-blue-300 border border-[#1F2937] cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>

                          {/* View Service History */}
                          <button
                            onClick={() => setViewHistoryEmployee(emp)}
                            title="View Service History"
                            className="p-1.5 rounded-lg bg-[#0F1115] hover:bg-[#1F2937] text-emerald-400 hover:text-emerald-300 border border-[#1F2937] cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            title="Edit Officer Details"
                            className="p-1.5 rounded-lg bg-[#0F1115] hover:bg-[#1F2937] text-amber-400 hover:text-amber-300 border border-[#1F2937] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active / Inactive */}
                          <button
                            onClick={() => onToggleEmployeeStatus(emp.employeeId)}
                            title={isActive ? 'Deactivate Employee' : 'Activate Employee'}
                            className="p-1.5 rounded-lg bg-[#0F1115] hover:bg-[#1F2937] text-gray-400 hover:text-white border border-[#1F2937] cursor-pointer"
                          >
                            {isActive ? <UserX className="w-3.5 h-3.5 text-red-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              setDeleteFeedback(null);
                              setDeleteModalEmployee(emp);
                            }}
                            title="Delete Employee"
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

      {/* MODAL 1: ADD EMPLOYEE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Register New Banking Officer
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployeeSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={addId}
                    onChange={(e) => setAddId(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Status</label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="officer@apexbank.in"
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Designation</label>
                  <input
                    type="text"
                    value={addDesignation}
                    onChange={(e) => setAddDesignation(e.target.value)}
                    placeholder="Doorstep Banking Officer"
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Assigned Role</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Field Agent">Field Agent</option>
                    <option value="Service Desk Employee">Service Desk Employee</option>
                    <option value="Cash Operations Specialist">Cash Operations Specialist</option>
                    <option value="Branch Relationship Manager">Branch Relationship Manager</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Initial Availability</label>
                <select
                  value={addAvailability}
                  onChange={(e) => setAddAvailability(e.target.value as EmployeeAvailability)}
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Available">Available (Ready for Trips)</option>
                  <option value="Busy">Busy</option>
                  <option value="Offline">Offline</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Branch / Assigned Station</label>
                <input
                  type="text"
                  value={addAddress}
                  onChange={(e) => setAddAddress(e.target.value)}
                  placeholder="e.g. Apex Flagship Branch, Nariman Point"
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {addError && (
                <div className="p-2 bg-red-950/40 text-red-300 border border-red-800/40 rounded flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#1F2937] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-md cursor-pointer"
                >
                  Register Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT EMPLOYEE */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  Edit Officer Information
                </h3>
                <span className="text-xs text-gray-400 font-mono">ID: {editingEmployee.employeeId}</span>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Field Agent">Field Agent</option>
                    <option value="Service Desk Employee">Service Desk Employee</option>
                    <option value="Cash Operations Specialist">Cash Operations Specialist</option>
                    <option value="Branch Relationship Manager">Branch Relationship Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED')}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="DEACTIVATED">DEACTIVATED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Availability</label>
                  <select
                    value={editAvailability}
                    onChange={(e) => setEditAvailability(e.target.value as EmployeeAvailability)}
                    className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Offline">Offline</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Assigned Address / Station</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {editFeedback && (
                <div className="p-2 bg-[#0F1115] border border-blue-800/40 text-blue-300 rounded">
                  {editFeedback}
                </div>
              )}

              <div className="pt-3 border-t border-[#1F2937] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-md cursor-pointer"
                >
                  Update Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW EMPLOYEE ASSIGNED TASKS */}
      {viewTasksEmployee && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  Assigned Active Trips: {viewTasksEmployee.fullName}
                </h3>
                <span className="text-xs text-gray-400 font-mono">ID: {viewTasksEmployee.employeeId}</span>
              </div>
              <button
                onClick={() => setViewTasksEmployee(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {doorstepRequests.filter(
                (r) => r.assignedEmployeeId === viewTasksEmployee.employeeId && r.status !== 'COMPLETED' && r.status !== 'REJECTED'
              ).length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No active doorstep trips currently assigned to this officer.
                </div>
              ) : (
                doorstepRequests
                  .filter(
                    (r) => r.assignedEmployeeId === viewTasksEmployee.employeeId && r.status !== 'COMPLETED' && r.status !== 'REJECTED'
                  )
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-[#0F1115] border border-[#1F2937] rounded-lg space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-400">{task.requestId}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/70 text-amber-400 border border-amber-800/40">
                          {task.status}
                        </span>
                      </div>
                      <div className="text-white font-medium">
                        Customer: {task.customerName} ({task.customerPhone})
                      </div>
                      <div className="text-gray-400 flex items-center justify-between">
                        <span>Type: <strong>{task.requestType}</strong></span>
                        <span className="font-mono text-emerald-400 font-bold">₹{task.amount.toLocaleString()}</span>
                      </div>
                      <div className="text-gray-400">Address: {task.address}</div>
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewTasksEmployee(null)}
                className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW SERVICE HISTORY */}
      {viewHistoryEmployee && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  Service History: {viewHistoryEmployee.fullName}
                </h3>
                <span className="text-xs text-gray-400 font-mono">
                  ID: {viewHistoryEmployee.employeeId} • Total Completed: {viewHistoryEmployee.completedCount || 0}
                </span>
              </div>
              <button
                onClick={() => setViewHistoryEmployee(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {doorstepRequests.filter(
                (r) => r.assignedEmployeeId === viewHistoryEmployee.employeeId && r.status === 'COMPLETED'
              ).length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No completed delivery records logged for this officer yet.
                </div>
              ) : (
                doorstepRequests
                  .filter(
                    (r) => r.assignedEmployeeId === viewHistoryEmployee.employeeId && r.status === 'COMPLETED'
                  )
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-[#0F1115] border border-emerald-800/30 rounded-lg space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-emerald-400 font-bold">{task.requestId}</span>
                        <span className="text-[10px] text-gray-400">
                          {task.completedAt ? new Date(task.completedAt).toLocaleString() : 'Completed'}
                        </span>
                      </div>
                      <div className="text-white">Customer: {task.customerName}</div>
                      <div className="text-gray-400 flex items-center justify-between">
                        <span>{task.requestType}</span>
                        <span className="font-mono text-white font-semibold">₹{task.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewHistoryEmployee(null)}
                className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DELETE EMPLOYEE CONFIRMATION */}
      {deleteModalEmployee && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Discharge Employee Record
              </h3>
              <button
                onClick={() => setDeleteModalEmployee(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0F1115] p-3 rounded-lg border border-[#1F2937] space-y-1 text-xs">
              <div className="text-white font-semibold">{deleteModalEmployee.fullName}</div>
              <div className="text-gray-400 font-mono">Employee ID: {deleteModalEmployee.employeeId}</div>
              <div className="text-gray-400">Designation: {deleteModalEmployee.designation}</div>
            </div>

            {doorstepRequests.some(
              (r) => r.assignedEmployeeId === deleteModalEmployee.employeeId && r.status !== 'COMPLETED' && r.status !== 'REJECTED'
            ) ? (
              <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-lg text-xs text-red-300 space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Cannot Delete Active Field Agent
                </div>
                <p className="leading-relaxed">
                  This officer currently has active assigned doorstep banking trips. In accordance with operational procedures, you must reassign their trips or set the employee status to Deactivated.
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-300 leading-relaxed">
                Are you sure you want to delete this officer profile? This will permanently remove their records from the personnel directory.
              </p>
            )}

            {deleteFeedback && (
              <div className="p-2 bg-[#0F1115] border border-blue-800/40 text-blue-300 text-xs rounded">
                {deleteFeedback}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1F2937]">
              <button
                onClick={() => setDeleteModalEmployee(null)}
                className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>

              {!doorstepRequests.some(
                (r) => r.assignedEmployeeId === deleteModalEmployee.employeeId && r.status !== 'COMPLETED' && r.status !== 'REJECTED'
              ) && (
                <button
                  onClick={() => {
                    const res = onDeleteEmployee(deleteModalEmployee.employeeId);
                    if (res.success) {
                      setDeleteFeedback(res.message);
                      setTimeout(() => setDeleteModalEmployee(null), 900);
                    } else {
                      setDeleteFeedback(res.message);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Confirm Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
