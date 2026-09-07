import React, { useState } from 'react';
import { Employee, DoorstepRequest } from '../types';
import { 
  Briefcase, Truck, Navigation, CheckCircle2, Phone, MapPin, 
  Key, Shield, AlertCircle, ArrowRight, Clock, DollarSign, Calendar
} from 'lucide-react';

interface EmployeePortalProps {
  currentEmployee?: Employee | null;
  doorstepRequests: DoorstepRequest[];
  onUpdateStatus: (requestId: string, status: DoorstepRequest['status']) => void;
  onVerifyAndComplete: (requestId: string, enteredOtp: string) => { success: boolean; message: string };
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({
  currentEmployee,
  doorstepRequests,
  onUpdateStatus,
  onVerifyAndComplete,
}) => {
  const [filterTab, setFilterTab] = useState<'active' | 'completed'>('active');
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ reqId: string; error?: string; success?: string } | null>(null);

  if (!currentEmployee) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md bg-[#111827] border border-[#1F2937] rounded-xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-amber-900/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-800/30">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Field Officers Registered</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            The banking system currently has zero field agents (0 records). Please register a field officer in the Admin Portal to assign and fulfill doorstep banking operations.
          </p>
          <div className="bg-[#0F1115] border border-[#1F2937] p-3 rounded-lg text-xs font-mono text-amber-400">
            Cloud State: Live Firestore Active (0 Records)
          </div>
        </div>
      </div>
    );
  }

  // Filter tasks assigned to this employee
  const myRequests = doorstepRequests.filter(
    (r) => r.assignedEmployeeId === currentEmployee.employeeId
  );

  const activeTasks = myRequests.filter((r) => r.status !== 'COMPLETED' && r.status !== 'REJECTED');
  const completedTasks = myRequests.filter((r) => r.status === 'COMPLETED');

  const displayedTasks = filterTab === 'active' ? activeTasks : completedTasks;

  const handleOtpChange = (reqId: string, val: string) => {
    setOtpInputs((prev) => ({ ...prev, [reqId]: val.replace(/\D/g, '').slice(0, 4) }));
  };

  const handleVerifyOtp = (req: DoorstepRequest) => {
    const code = otpInputs[req.id] || '';
    if (code.length !== 4) {
      setFeedback({ reqId: req.id, error: 'Please enter the 4-digit verification OTP provided by customer.' });
      return;
    }

    const res = onVerifyAndComplete(req.id, code);
    if (res.success) {
      setFeedback({ reqId: req.id, success: 'OTP authenticated! Doorstep transaction finalized and ledger updated.' });
      setOtpInputs((prev) => ({ ...prev, [req.id]: '' }));
    } else {
      setFeedback({ reqId: req.id, error: res.message });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6 lg:p-8 space-y-6">
      {/* Officer Profile Card in Elegant Dark style */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 shadow-lg shadow-black/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-950/40 border border-amber-800/40 text-amber-400 rounded-xl flex items-center justify-center font-bold text-2xl shadow-inner">
              <Briefcase className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{currentEmployee.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/30 text-emerald-400 border border-emerald-800/40">
                  {currentEmployee.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {currentEmployee.designation} • ID:{' '}
                <span className="font-mono text-amber-400 font-semibold">{currentEmployee.employeeId}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{currentEmployee.branch} • {currentEmployee.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#0F1115] border border-[#1F2937] px-4 py-2.5 rounded-lg text-center">
              <div className="text-xs text-gray-400 uppercase font-semibold">Active Trips</div>
              <div className="text-xl font-bold text-amber-400 font-mono">{activeTasks.length}</div>
            </div>
            <div className="bg-[#0F1115] border border-[#1F2937] px-4 py-2.5 rounded-lg text-center">
              <div className="text-xs text-gray-400 uppercase font-semibold">Completed</div>
              <div className="text-xl font-bold text-emerald-400 font-mono">{completedTasks.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterTab('active')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              filterTab === 'active'
                ? 'bg-[#151C2C] text-amber-400 border border-amber-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Assigned Active Tasks ({activeTasks.length})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              filterTab === 'completed'
                ? 'bg-[#151C2C] text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Service History ({completedTasks.length})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {displayedTasks.length === 0 ? (
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-12 text-center text-gray-400">
            <Truck className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-base font-medium text-gray-300">
              {filterTab === 'active' ? 'No active doorstep trips currently pending.' : 'No completed trips logged yet.'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              New customer requests assigned by Admin Dispatch will appear here in real-time.
            </p>
          </div>
        ) : (
          displayedTasks.map((task) => {
            const isDelivery = task.requestType === 'WITHDRAWAL';
            const reqFeedback = feedback?.reqId === task.id ? feedback : null;

            return (
              <div
                key={task.id}
                className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-lg shadow-black/20 hover:border-blue-500/40 transition-colors"
              >
                {/* Header of Task */}
                <div className="p-4 bg-[#151C2C] border-b border-[#1F2937] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        isDelivery
                          ? 'bg-red-950/80 text-red-300 border border-red-800/50'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                      }`}
                    >
                      {isDelivery ? 'Doorstep Cash Delivery' : 'Doorstep Cash Pickup'}
                    </span>
                    <span className="font-mono text-xs text-blue-400 font-semibold">{task.requestId}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                    <span>Account: {task.accountNumber}</span>
                    <span className="text-lg font-bold text-white font-mono">
                      ₹{task.amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Customer & Location */}
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-400 font-medium">Customer Name</div>
                      <div className="text-base font-semibold text-white">{task.customerName}</div>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-gray-300">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-400 block font-medium">Delivery Address:</span>
                        {task.address}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{task.customerPhone}</span>
                    </div>

                    {task.notes && (
                      <div className="bg-[#0F1115] border border-[#1F2937] p-2.5 rounded-lg text-xs text-gray-300">
                        <span className="text-gray-400 font-semibold block mb-0.5">Customer Instructions:</span>
                        {task.notes}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Workflow Step & OTP input */}
                  <div className="flex flex-col justify-between space-y-4">
                    {/* Visual Progress Steps */}
                    <div>
                      <div className="text-xs text-gray-400 font-semibold uppercase mb-2">
                        Workflow Status Stage:
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center">
                        <div
                          className={`py-1 text-[10px] font-bold rounded ${
                            task.status !== 'PENDING'
                              ? 'bg-blue-600 text-white'
                              : 'bg-[#1F2937] text-gray-500'
                          }`}
                        >
                          Assigned
                        </div>
                        <div
                          className={`py-1 text-[10px] font-bold rounded ${
                            task.status === 'ON_THE_WAY' ||
                            task.status === 'REACHED_LOCATION' ||
                            task.status === 'COMPLETED'
                              ? 'bg-blue-600 text-white'
                              : 'bg-[#1F2937] text-gray-500'
                          }`}
                        >
                          En Route
                        </div>
                        <div
                          className={`py-1 text-[10px] font-bold rounded ${
                            task.status === 'REACHED_LOCATION' || task.status === 'COMPLETED'
                              ? 'bg-blue-600 text-white'
                              : 'bg-[#1F2937] text-gray-500'
                          }`}
                        >
                          At Door
                        </div>
                        <div
                          className={`py-1 text-[10px] font-bold rounded ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#1F2937] text-gray-500'
                          }`}
                        >
                          Settled
                        </div>
                      </div>
                    </div>

                    {/* Stage Actions */}
                    {task.status !== 'COMPLETED' && (
                      <div className="bg-[#0F1115] border border-[#1F2937] p-4 rounded-xl space-y-3">
                        {task.status === 'ASSIGNED' && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Order waiting for officer dispatch:</span>
                            <button
                              onClick={() => onUpdateStatus(task.id, 'ON_THE_WAY')}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-900/30"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              Start Trip (On The Way)
                            </button>
                          </div>
                        )}

                        {task.status === 'ON_THE_WAY' && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-amber-400 font-medium">Currently en route...</span>
                            <button
                              onClick={() => onUpdateStatus(task.id, 'REACHED_LOCATION')}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-900/30"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              Mark Arrived at Doorstep
                            </button>
                          </div>
                        )}

                        {(task.status === 'REACHED_LOCATION' || task.status === 'ON_THE_WAY') && (
                          <div className="pt-2 border-t border-[#1F2937] space-y-2">
                            <label className="block text-xs font-semibold text-gray-300">
                              Enter Customer 4-Digit Security OTP:
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="password"
                                maxLength={4}
                                value={otpInputs[task.id] || ''}
                                onChange={(e) => handleOtpChange(task.id, e.target.value)}
                                placeholder="••••"
                                className="w-28 bg-[#111827] border border-[#1F2937] rounded-lg px-3 py-2 text-center font-mono text-lg tracking-widest text-white focus:outline-none focus:border-emerald-500"
                              />
                              <button
                                onClick={() => handleVerifyOtp(task)}
                                className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-900/30"
                              >
                                <Shield className="w-4 h-4" />
                                Authenticate & Handover Cash
                              </button>
                            </div>

                            {reqFeedback?.error && (
                              <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3.5 h-3.5" /> {reqFeedback.error}
                              </p>
                            )}
                            {reqFeedback?.success && (
                              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {reqFeedback.success}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {task.status === 'COMPLETED' && (
                      <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Completed on {new Date(task.completedAt || task.updatedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
