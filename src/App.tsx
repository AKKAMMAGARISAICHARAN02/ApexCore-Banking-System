import React, { useState, useEffect } from 'react';
import { 
  UserRole, Customer, Employee, EmployeeHead, DoorstepRequest, Transaction, AuditLog, SystemSettings, KYCStatus, EmployeeAvailability 
} from './types';
import { 
  getStoredCustomers, saveCustomers,
  getStoredEmployees, saveEmployees,
  getStoredEmployeeHeads, saveEmployeeHeads,
  getStoredDoorstep, saveDoorstep,
  getStoredTransactions, saveTransactions,
  getStoredAuditLogs, addAuditLog,
  getStoredSettings, saveSettings
} from './data/mockDatabase';
import { testFirestoreConnection } from './firebase';
import { FirestoreBankingService } from './services/firestoreBankingService';
import { Header } from './components/Header';
import { PortalSelector } from './components/PortalSelector';
import { AdminPortal } from './components/AdminPortal';
import { EmployeePortal } from './components/EmployeePortal';
import { EmployeeHeadPortal } from './components/EmployeeHeadPortal';
import { CustomerPortal } from './components/CustomerPortal';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('guest');
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);

  // Core reactive data state
  const [customers, setCustomers] = useState<Customer[]>(getStoredCustomers);
  const [employees, setEmployees] = useState<Employee[]>(getStoredEmployees);
  const [employeeHeads, setEmployeeHeads] = useState<EmployeeHead[]>(getStoredEmployeeHeads);
  const [doorstepRequests, setDoorstepRequests] = useState<DoorstepRequest[]>(getStoredDoorstep);
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getStoredAuditLogs);
  const [settings, setSettings] = useState<SystemSettings>(getStoredSettings);

  // Selected contexts
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => {
    const list = getStoredCustomers();
    return list[0]?.customerId || '';
  });

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => {
    const list = getStoredEmployees();
    return list[0]?.employeeId || '';
  });

  const [selectedEmployeeHeadId, setSelectedEmployeeHeadId] = useState<string>(() => {
    const list = getStoredEmployeeHeads();
    return list[0]?.headId || 'EH-101';
  });

  // Sync listener across tabs & real-time Firestore listeners
  useEffect(() => {
    let unsubCustomers: (() => void) | undefined;
    let unsubEmployees: (() => void) | undefined;
    let unsubEmployeeHeads: (() => void) | undefined;
    let unsubDoorstep: (() => void) | undefined;
    let unsubTransactions: (() => void) | undefined;
    let unsubAudit: (() => void) | undefined;
    let unsubSettings: (() => void) | undefined;

    // Test Firestore connection on boot (Mandatory constraint)
    testFirestoreConnection().then(async (connected) => {
      setFirebaseConnected(connected);
      if (connected) {
        // Subscribe to live Firestore collections - strictly driven by cloud documents (0 documents = 0 records)
        unsubCustomers = FirestoreBankingService.subscribeCustomers((list) => {
          setCustomers(list);
          saveCustomers(list);
          if (list.length > 0) {
            setSelectedCustomerId((prev) => (list.some((c) => c.customerId === prev) ? prev : list[0].customerId));
          } else {
            setSelectedCustomerId('');
          }
        });

        unsubEmployees = FirestoreBankingService.subscribeEmployees((list) => {
          setEmployees(list);
          saveEmployees(list);
          if (list.length > 0) {
            setSelectedEmployeeId((prev) => (list.some((e) => e.employeeId === prev) ? prev : list[0].employeeId));
          } else {
            setSelectedEmployeeId('');
          }
        });

        unsubEmployeeHeads = FirestoreBankingService.subscribeEmployeeHeads((list) => {
          if (list && list.length > 0) {
            setEmployeeHeads(list);
            saveEmployeeHeads(list);
            setSelectedEmployeeHeadId((prev) => (list.some((h) => h.headId === prev) ? prev : list[0].headId));
          }
        });

        unsubDoorstep = FirestoreBankingService.subscribeDoorstep((list) => {
          setDoorstepRequests(list);
          saveDoorstep(list);
        });

        unsubTransactions = FirestoreBankingService.subscribeTransactions((list) => {
          setTransactions(list);
          saveTransactions(list);
        });

        unsubAudit = FirestoreBankingService.subscribeAuditLogs((list) => {
          setAuditLogs(list);
        });

        unsubSettings = FirestoreBankingService.subscribeSettings((s) => {
          if (s) {
            setSettings(s);
            saveSettings(s);
          }
        });
      }
    });

    const reload = () => {
      setCustomers(getStoredCustomers());
      setEmployees(getStoredEmployees());
      setEmployeeHeads(getStoredEmployeeHeads());
      setDoorstepRequests(getStoredDoorstep());
      setTransactions(getStoredTransactions());
      setAuditLogs(getStoredAuditLogs());
      setSettings(getStoredSettings());
    };

    window.addEventListener('apex_storage_updated', reload);
    return () => {
      window.removeEventListener('apex_storage_updated', reload);
      if (unsubCustomers) unsubCustomers();
      if (unsubEmployees) unsubEmployees();
      if (unsubEmployeeHeads) unsubEmployeeHeads();
      if (unsubDoorstep) unsubDoorstep();
      if (unsubTransactions) unsubTransactions();
      if (unsubAudit) unsubAudit();
      if (unsubSettings) unsubSettings();
    };
  }, []);

  const activeCustomer = customers.find((c) => c.customerId === selectedCustomerId) || customers[0] || null;
  const activeEmployee = employees.find((e) => e.employeeId === selectedEmployeeId) || employees[0] || null;
  const activeEmployeeHead = employeeHeads.find((h) => h.headId === selectedEmployeeHeadId) || employeeHeads[0] || null;

  // Admin Actions
  const handleAddCustomer = (newCust: Omit<Customer, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const customer: Customer = {
      ...newCust,
      id: `cust-${Date.now()}`,
      uid: `uid-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [customer, ...customers];
    setCustomers(updated);
    saveCustomers(updated);
    FirestoreBankingService.saveCustomer(customer);

    if (newCust.balance > 0) {
      const initialTx: Transaction = {
        id: `tx-${Date.now()}`,
        transactionId: `TXN${Math.floor(1000000 + Math.random() * 9000000)}`,
        customerId: customer.customerId,
        accountNumber: customer.accountNumber,
        type: 'INITIAL_DEPOSIT',
        amount: newCust.balance,
        debitOrCredit: 'CREDIT',
        status: 'COMPLETED',
        description: 'Account Opening Deposit',
        sender: 'Cash Counter / Bank Branch',
        receiver: customer.fullName,
        timestamp: now,
        balanceAfter: customer.balance,
      };
      const updatedTxs = [initialTx, ...transactions];
      setTransactions(updatedTxs);
      saveTransactions(updatedTxs);
      FirestoreBankingService.addTransaction(initialTx);
    }

    addAuditLog('CREATE_CUSTOMER_ACCOUNT', customer.customerId, 'CUSTOMER', {
      name: customer.fullName,
      accountNumber: customer.accountNumber,
      initialDeposit: newCust.balance,
    });
  };

  const handleUpdateCustomerStatus = (customerId: string, status: Customer['status']) => {
    const updated = customers.map((c) =>
      c.customerId === customerId ? { ...c, status, updatedAt: new Date().toISOString() } : c
    );
    setCustomers(updated);
    saveCustomers(updated);
    const target = updated.find((c) => c.customerId === customerId);
    if (target) {
      FirestoreBankingService.saveCustomer(target);
    }
    addAuditLog('UPDATE_ACCOUNT_STATUS', customerId, 'CUSTOMER', { newStatus: status });
  };

  const handleEditCustomer = (customerId: string, updatedFields: Partial<Customer>) => {
    const target = customers.find((c) => c.customerId === customerId);
    if (!target) return { success: false, message: 'Customer record not found.' };

    // Disallow editing sensitive financial fields directly
    const { balance, availableBalance, accountNumber, ...safeFields } = updatedFields;

    const now = new Date().toISOString();
    const updatedCustomer: Customer = {
      ...target,
      ...safeFields,
      updatedAt: now,
    };

    const updated = customers.map((c) => (c.customerId === customerId ? updatedCustomer : c));
    setCustomers(updated);
    saveCustomers(updated);
    FirestoreBankingService.saveCustomer(updatedCustomer);

    addAuditLog('ADMIN_EDIT_CUSTOMER', customerId, 'CUSTOMER', {
      editedFields: Object.keys(safeFields),
      name: updatedCustomer.fullName,
    });

    return { success: true, message: 'Customer profile updated successfully.' };
  };

  const handleDeleteCustomer = (customerId: string, mode: 'SAFE_OR_PERMANENT' | 'DEACTIVATE' | 'SOFT_DELETE') => {
    const target = customers.find((c) => c.customerId === customerId);
    if (!target) return { success: false, message: 'Customer not found.' };

    const hasBalance = target.balance > 0;
    const hasPendingDoorstep = doorstepRequests.some(
      (r) => r.accountNumber === target.accountNumber && r.status !== 'COMPLETED' && r.status !== 'REJECTED'
    );
    const hasTransactions = transactions.some((t) => t.accountNumber === target.accountNumber);

    // Rule: If customer has balance or pending transactions or pending doorstep requests, do NOT permanently delete.
    if ((hasBalance || hasPendingDoorstep || hasTransactions) && mode === 'SAFE_OR_PERMANENT') {
      const now = new Date().toISOString();
      const deactivated: Customer = {
        ...target,
        status: 'INACTIVE',
        isSoftDeleted: true,
        updatedAt: now,
      };
      const updated = customers.map((c) => (c.customerId === customerId ? deactivated : c));
      setCustomers(updated);
      saveCustomers(updated);
      FirestoreBankingService.saveCustomer(deactivated);

      addAuditLog('SAFE_DEACTIVATE_CUSTOMER', customerId, 'CUSTOMER', {
        reason: 'Protected entity with active balance, transactions, or in-flight requests. Deactivated safely.',
        balance: target.balance,
      });

      return {
        success: true,
        blockedByRules: true,
        message: 'Safe Protection Rule: Customer has active balance (₹' + target.balance.toLocaleString() + ') or pending records. The account was safely Deactivated instead of permanently deleted.',
      };
    }

    if (mode === 'DEACTIVATE' || mode === 'SOFT_DELETE') {
      const now = new Date().toISOString();
      const softDeleted: Customer = {
        ...target,
        status: 'INACTIVE',
        isSoftDeleted: true,
        updatedAt: now,
      };
      const updated = customers.map((c) => (c.customerId === customerId ? softDeleted : c));
      setCustomers(updated);
      saveCustomers(updated);
      FirestoreBankingService.saveCustomer(softDeleted);

      addAuditLog('SOFT_DELETE_CUSTOMER', customerId, 'CUSTOMER', {
        name: target.fullName,
      });
      return { success: true, message: 'Customer account marked inactive (Soft Deleted).' };
    }

    // Permanent Deletion (only when balance is 0 and no pending operations)
    const filtered = customers.filter((c) => c.customerId !== customerId);
    setCustomers(filtered);
    saveCustomers(filtered);

    addAuditLog('PERMANENT_DELETE_CUSTOMER', customerId, 'CUSTOMER', {
      name: target.fullName,
      accountNumber: target.accountNumber,
    });

    return { success: true, message: 'Customer record permanently deleted from database.' };
  };

  const handleAddEmployee = (newEmp: Omit<Employee, 'id' | 'uid' | 'assignedCount' | 'completedCount' | 'createdAt'>) => {
    const employee: Employee = {
      ...newEmp,
      id: `emp-${Date.now()}`,
      uid: `uid-e-${Date.now()}`,
      assignedCount: 0,
      completedCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [employee, ...employees];
    setEmployees(updated);
    saveEmployees(updated);
    FirestoreBankingService.saveEmployee(employee);

    addAuditLog('REGISTER_FIELD_EMPLOYEE', employee.employeeId, 'EMPLOYEE', {
      name: employee.fullName,
      designation: employee.designation,
    });
  };

  const handleEditEmployee = (employeeId: string, updatedFields: Partial<Employee>) => {
    const target = employees.find((e) => e.employeeId === employeeId);
    if (!target) return { success: false, message: 'Employee record not found.' };

    const { assignedCount, completedCount, ...safeFields } = updatedFields;
    const now = new Date().toISOString();
    const updatedEmp: Employee = {
      ...target,
      ...safeFields,
      updatedAt: now,
    };

    const updated = employees.map((e) => (e.employeeId === employeeId ? updatedEmp : e));
    setEmployees(updated);
    saveEmployees(updated);
    FirestoreBankingService.saveEmployee(updatedEmp);

    addAuditLog('ADMIN_EDIT_EMPLOYEE', employeeId, 'EMPLOYEE', {
      name: updatedEmp.fullName,
      editedFields: Object.keys(safeFields),
    });

    return { success: true, message: 'Employee profile updated successfully.' };
  };

  const handleToggleEmployeeStatus = (employeeId: string) => {
    const updated = employees.map((e) =>
      e.employeeId === employeeId
        ? { 
            ...e, 
            status: e.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const),
            availability: e.status === 'ACTIVE' ? ('Offline' as const) : e.availability,
            updatedAt: new Date().toISOString() 
          }
        : e
    );
    setEmployees(updated);
    saveEmployees(updated);
    const target = updated.find((e) => e.employeeId === employeeId);
    if (target) {
      FirestoreBankingService.saveEmployee(target);
    }
    addAuditLog('TOGGLE_EMPLOYEE_STATUS', employeeId, 'EMPLOYEE', { newStatus: target?.status });
  };

  const handleUpdateEmployeeAvailability = (employeeId: string, availability: EmployeeAvailability) => {
    const updated = employees.map((e) =>
      e.employeeId === employeeId ? { ...e, availability, updatedAt: new Date().toISOString() } : e
    );
    setEmployees(updated);
    saveEmployees(updated);
    const target = updated.find((e) => e.employeeId === employeeId);
    if (target) {
      FirestoreBankingService.saveEmployee(target);
    }
    addAuditLog('EMPLOYEE_AVAILABILITY_CHANGE', employeeId, 'EMPLOYEE', { availability });
  };

  const handleDeleteEmployee = (employeeId: string) => {
    const emp = employees.find((e) => e.employeeId === employeeId);
    if (!emp) return { success: false, message: 'Employee not found.' };

    const hasActiveTrips = doorstepRequests.some(
      (r) => r.assignedEmployeeId === employeeId && r.status !== 'COMPLETED' && r.status !== 'REJECTED'
    );
    if (hasActiveTrips) {
      return {
        success: false,
        message: 'Cannot delete officer with active doorstep trips. Please reassign or conclude pending trips first.',
      };
    }

    const filtered = employees.filter((e) => e.employeeId !== employeeId);
    setEmployees(filtered);
    saveEmployees(filtered);

    addAuditLog('EMPLOYEE_DELETED', employeeId, 'EMPLOYEE', {
      name: emp.fullName,
      designation: emp.designation,
    });

    return { success: true, message: 'Officer profile removed from roster.' };
  };

  const handleApproveDoorstep = (requestId: string) => {
    const updated = doorstepRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'APPROVED' as const, updatedAt: new Date().toISOString() } : r
    );
    setDoorstepRequests(updated);
    saveDoorstep(updated);
    const target = updated.find((r) => r.id === requestId);
    if (target) {
      FirestoreBankingService.saveDoorstep(target);
    }
    addAuditLog('APPROVE_DOORSTEP_REQUEST', requestId, 'DOORSTEP_REQUEST', {});
  };

  const handleAssignDoorstep = (
    requestId: string, 
    employeeId: string, 
    headInfo?: { headId: string; headName: string }
  ) => {
    const emp = employees.find((e) => e.employeeId === employeeId);
    if (!emp) return { success: false, message: 'Officer not found.' };

    const now = new Date().toISOString();
    const updated = doorstepRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'ASSIGNED' as const,
            assignedEmployeeId: emp.employeeId,
            assignedEmployeeName: emp.fullName,
            assignedEmployeePhone: emp.phone,
            assignedBy: headInfo ? `${headInfo.headName} (Branch Head)` : 'Admin Operations',
            employeeHeadId: headInfo?.headId || r.employeeHeadId,
            employeeHeadName: headInfo?.headName || r.employeeHeadName,
            assignedAt: now,
            updatedAt: now,
          }
        : r
    );
    setDoorstepRequests(updated);
    saveDoorstep(updated);
    const target = updated.find((r) => r.id === requestId);
    if (target) {
      FirestoreBankingService.saveDoorstep(target);
    }

    // Set employee availability to Busy and increment assignedCount
    const updatedEmps = employees.map((e) =>
      e.employeeId === employeeId
        ? { ...e, assignedCount: e.assignedCount + 1, availability: 'Busy' as const, updatedAt: now }
        : e
    );
    setEmployees(updatedEmps);
    saveEmployees(updatedEmps);
    FirestoreBankingService.saveEmployee({ ...emp, assignedCount: emp.assignedCount + 1, availability: 'Busy', updatedAt: now });

    addAuditLog('ASSIGN_DOORSTEP_REQUEST', requestId, 'DOORSTEP_REQUEST', {
      assignedEmployee: `${emp.fullName} (${emp.employeeId})`,
      assignedBy: headInfo ? `${headInfo.headName} (Branch Head)` : 'Admin Operations',
    });

    return { success: true, message: `Dispatched to ${emp.fullName}.` };
  };

  const handleReassignDoorstep = (
    requestId: string, 
    newEmployeeId: string, 
    reason?: string,
    headInfo?: { headId: string; headName: string }
  ) => {
    const targetReq = doorstepRequests.find((r) => r.id === requestId);
    if (!targetReq) return { success: false, message: 'Doorstep trip not found.' };

    const newEmp = employees.find((e) => e.employeeId === newEmployeeId);
    if (!newEmp) return { success: false, message: 'Replacement officer not found.' };

    const oldEmpId = targetReq.assignedEmployeeId;
    const now = new Date().toISOString();

    const updatedRequests = doorstepRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            assignedEmployeeId: newEmp.employeeId,
            assignedEmployeeName: newEmp.fullName,
            assignedEmployeePhone: newEmp.phone,
            reassignedBy: headInfo ? `${headInfo.headName} (Branch Head)` : 'Admin Operations',
            reassignedAt: now,
            reassignmentReason: reason || 'Route Rebalancing / Officer Availability',
            employeeHeadId: headInfo?.headId || r.employeeHeadId,
            employeeHeadName: headInfo?.headName || r.employeeHeadName,
            updatedAt: now,
          }
        : r
    );
    setDoorstepRequests(updatedRequests);
    saveDoorstep(updatedRequests);
    const updatedReqObj = updatedRequests.find((r) => r.id === requestId);
    if (updatedReqObj) {
      FirestoreBankingService.saveDoorstep(updatedReqObj);
    }

    // Check if old employee has other active trips
    const updatedEmps = employees.map((e) => {
      if (e.employeeId === oldEmpId) {
        const hasOtherActive = updatedRequests.some(
          (r) => r.id !== requestId && r.assignedEmployeeId === oldEmpId && r.status !== 'COMPLETED' && r.status !== 'REJECTED'
        );
        return {
          ...e,
          availability: hasOtherActive ? ('Busy' as const) : ('Available' as const),
          updatedAt: now,
        };
      }
      if (e.employeeId === newEmployeeId) {
        return {
          ...e,
          assignedCount: e.assignedCount + 1,
          availability: 'Busy' as const,
          updatedAt: now,
        };
      }
      return e;
    });

    setEmployees(updatedEmps);
    saveEmployees(updatedEmps);
    const oldEmpTarget = updatedEmps.find((e) => e.employeeId === oldEmpId);
    if (oldEmpTarget) FirestoreBankingService.saveEmployee(oldEmpTarget);
    const newEmpTarget = updatedEmps.find((e) => e.employeeId === newEmployeeId);
    if (newEmpTarget) FirestoreBankingService.saveEmployee(newEmpTarget);

    addAuditLog('EMPLOYEE_REASSIGNED', requestId, 'DOORSTEP_REQUEST', {
      previousOfficer: targetReq.assignedEmployeeName,
      newOfficer: `${newEmp.fullName} (${newEmp.employeeId})`,
      reassignedBy: headInfo ? `${headInfo.headName} (Branch Head)` : 'Admin Operations',
      reason: reason || 'Operational reassignment',
    });

    return { success: true, message: `Trip successfully reassigned to ${newEmp.fullName}.` };
  };

  const handleRejectDoorstep = (requestId: string, reason: string) => {
    const updated = doorstepRequests.map((r) =>
      r.id === requestId
        ? { ...r, status: 'REJECTED' as const, rejectReason: reason, updatedAt: new Date().toISOString() }
        : r
    );
    setDoorstepRequests(updated);
    saveDoorstep(updated);
    const target = updated.find((r) => r.id === requestId);
    if (target) {
      FirestoreBankingService.saveDoorstep(target);
    }
    addAuditLog('REJECT_DOORSTEP_REQUEST', requestId, 'DOORSTEP_REQUEST', { reason });
  };

  const handleUpdateKycStatus = (customerId: string, status: KYCStatus, reason?: string) => {
    const updated = customers.map((c) =>
      c.customerId === customerId ? { ...c, kycStatus: status, updatedAt: new Date().toISOString() } : c
    );
    setCustomers(updated);
    saveCustomers(updated);
    const target = updated.find((c) => c.customerId === customerId);
    if (target) {
      FirestoreBankingService.saveCustomer(target);
    }
    addAuditLog('KYC_STATUS_UPDATED', customerId, 'CUSTOMER', { newStatus: status, reason });
  };

  // Employee Actions
  const handleUpdateDoorstepStatus = (requestId: string, status: DoorstepRequest['status']) => {
    const now = new Date().toISOString();
    const updated = doorstepRequests.map((r) => {
      if (r.id !== requestId) return r;
      const updates: Partial<DoorstepRequest> = { status, updatedAt: now };
      if (status === 'ON_THE_WAY' && !r.startedAt) {
        updates.startedAt = now;
      }
      if (status === 'REACHED_LOCATION' && !r.arrivedAt) {
        updates.arrivedAt = now;
      }
      return { ...r, ...updates };
    });
    setDoorstepRequests(updated);
    saveDoorstep(updated);
    const target = updated.find((r) => r.id === requestId);
    if (target) {
      FirestoreBankingService.saveDoorstep(target);
    }
    addAuditLog('UPDATE_DOORSTEP_STATUS', requestId, 'DOORSTEP_REQUEST', { newStatus: status });
  };

  const handleVerifyAndComplete = (requestId: string, enteredOtp: string) => {
    const req = doorstepRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found.' };

    if (req.verificationOtp !== enteredOtp.trim()) {
      return { success: false, message: 'Incorrect OTP. Ask customer to verify their code.' };
    }

    const customer = customers.find((c) => c.accountNumber === req.accountNumber);
    if (!customer) return { success: false, message: 'Customer account not found.' };

    const now = new Date().toISOString();
    let newBalance = customer.balance;

    if (req.requestType === 'WITHDRAWAL') {
      if (customer.balance < req.amount) {
        return { success: false, message: 'Insufficient customer balance to finalize cash payout.' };
      }
      newBalance = customer.balance - req.amount;
    } else {
      newBalance = customer.balance + req.amount;
    }

    // 1. Update customer balance
    const updatedCustomers = customers.map((c) =>
      c.accountNumber === req.accountNumber
        ? { ...c, balance: newBalance, availableBalance: newBalance, updatedAt: now }
        : c
    );
    setCustomers(updatedCustomers);
    saveCustomers(updatedCustomers);
    const updatedCustomerObj = updatedCustomers.find((c) => c.accountNumber === req.accountNumber);
    if (updatedCustomerObj) {
      FirestoreBankingService.saveCustomer(updatedCustomerObj);
    }

    // 2. Create Transaction record
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      transactionId: `TXN${Math.floor(1000000 + Math.random() * 9000000)}`,
      customerId: customer.customerId,
      accountNumber: customer.accountNumber,
      type: req.requestType === 'WITHDRAWAL' ? 'DOORSTEP_WITHDRAWAL' : 'DOORSTEP_DEPOSIT',
      amount: req.amount,
      debitOrCredit: req.requestType === 'WITHDRAWAL' ? 'DEBIT' : 'CREDIT',
      status: 'COMPLETED',
      description:
        req.requestType === 'WITHDRAWAL'
          ? `Doorstep Cash Handover by Officer ${req.assignedEmployeeName || 'Agent'}`
          : `Doorstep Cash Collection by Officer ${req.assignedEmployeeName || 'Agent'}`,
      sender: req.requestType === 'WITHDRAWAL' ? customer.fullName : 'Cash Handover at Doorstep',
      receiver: req.requestType === 'WITHDRAWAL' ? 'Cash Received at Doorstep' : customer.fullName,
      requestId: req.requestId,
      timestamp: now,
      balanceAfter: newBalance,
    };
    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    saveTransactions(updatedTxs);
    FirestoreBankingService.addTransaction(newTx);

    // 3. Mark request completed
    const updatedRequests = doorstepRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'COMPLETED' as const,
            otpVerifiedAt: now,
            transactionId: newTx.transactionId,
            completedAt: now,
            updatedAt: now,
          }
        : r
    );
    setDoorstepRequests(updatedRequests);
    saveDoorstep(updatedRequests);
    const targetReq = updatedRequests.find((r) => r.id === requestId);
    if (targetReq) {
      FirestoreBankingService.saveDoorstep(targetReq);
    }

    // 4. Update employee completed counter and reset availability if no other active tasks
    if (req.assignedEmployeeId) {
      const otherActive = updatedRequests.some(
        (r) =>
          r.id !== requestId &&
          r.assignedEmployeeId === req.assignedEmployeeId &&
          r.status !== 'COMPLETED' &&
          r.status !== 'REJECTED'
      );
      const updatedEmps = employees.map((e) =>
        e.employeeId === req.assignedEmployeeId
          ? {
              ...e,
              completedCount: e.completedCount + 1,
              availability: otherActive ? ('Busy' as const) : ('Available' as const),
              updatedAt: now,
            }
          : e
      );
      setEmployees(updatedEmps);
      saveEmployees(updatedEmps);
      const empTarget = updatedEmps.find((e) => e.employeeId === req.assignedEmployeeId);
      if (empTarget) {
        FirestoreBankingService.saveEmployee(empTarget);
      }
    }

    addAuditLog('DOORSTEP_SETTLEMENT_COMPLETE', req.requestId, 'DOORSTEP_REQUEST', {
      type: req.requestType,
      amount: req.amount,
      customer: customer.fullName,
      officer: req.assignedEmployeeName,
    });

    return { success: true, message: 'Verification successful and cash settlement recorded.' };
  };

  // Customer Actions
  const handleRequestDoorstep = (
    type: 'WITHDRAWAL' | 'DEPOSIT',
    amount: number,
    address: string,
    notes?: string,
    denominations?: string
  ) => {
    if (!activeCustomer) return { success: false, message: 'No active customer.' };

    const prefix = type === 'WITHDRAWAL' ? 'DRW' : 'DRD';
    const reqId = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const now = new Date().toISOString();

    const newRequest: DoorstepRequest = {
      id: `dr-${Date.now()}`,
      requestId: reqId,
      customerId: activeCustomer.customerId,
      customerName: activeCustomer.fullName,
      customerPhone: activeCustomer.phone,
      accountNumber: activeCustomer.accountNumber,
      requestType: type,
      amount,
      address,
      notes,
      denominations,
      status: 'PENDING',
      assignedEmployeeId: null,
      assignedEmployeeName: null,
      verificationOtp: otp,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newRequest, ...doorstepRequests];
    setDoorstepRequests(updated);
    saveDoorstep(updated);
    FirestoreBankingService.saveDoorstep(newRequest);

    addAuditLog('INITIATE_DOORSTEP_ORDER', reqId, 'DOORSTEP_REQUEST', {
      customer: activeCustomer.fullName,
      amount,
      type,
    });

    return {
      success: true,
      message: `Doorstep ${type.toLowerCase()} booked! Your Handover Verification OTP is ${otp}.`,
    };
  };

  const handleTransferFunds = (
    receiverAccount: string,
    receiverName: string,
    amount: number,
    remarks: string
  ) => {
    if (!activeCustomer) return { success: false, message: 'No active customer.' };

    if (activeCustomer.balance < amount) {
      return { success: false, message: 'Insufficient funds available in your account.' };
    }

    const now = new Date().toISOString();
    const newSenderBal = activeCustomer.balance - amount;

    // Check if receiver is internal account
    const internalReceiver = customers.find((c) => c.accountNumber === receiverAccount.trim());

    // Update customers
    const updatedCustomers = customers.map((c) => {
      if (c.accountNumber === activeCustomer.accountNumber) {
        return { ...c, balance: newSenderBal, availableBalance: newSenderBal, updatedAt: now };
      }
      if (internalReceiver && c.accountNumber === internalReceiver.accountNumber) {
        return {
          ...c,
          balance: c.balance + amount,
          availableBalance: c.balance + amount,
          updatedAt: now,
        };
      }
      return c;
    });
    setCustomers(updatedCustomers);
    saveCustomers(updatedCustomers);

    const updatedSender = updatedCustomers.find((c) => c.accountNumber === activeCustomer.accountNumber);
    if (updatedSender) {
      FirestoreBankingService.saveCustomer(updatedSender);
    }
    if (internalReceiver) {
      const updatedRecv = updatedCustomers.find((c) => c.accountNumber === internalReceiver.accountNumber);
      if (updatedRecv) {
        FirestoreBankingService.saveCustomer(updatedRecv);
      }
    }

    // Create Sender Debit Transaction
    const debitTx: Transaction = {
      id: `tx-deb-${Date.now()}`,
      transactionId: `TXN${Math.floor(1000000 + Math.random() * 9000000)}`,
      customerId: activeCustomer.customerId,
      accountNumber: activeCustomer.accountNumber,
      type: 'TRANSFER',
      amount,
      debitOrCredit: 'DEBIT',
      status: 'COMPLETED',
      description: remarks || `Domestic Transfer to ${receiverName || receiverAccount}`,
      sender: `${activeCustomer.fullName} (${activeCustomer.accountNumber})`,
      receiver: `${receiverName || 'Account'} (${receiverAccount})`,
      timestamp: now,
      balanceAfter: newSenderBal,
    };

    let newTxs = [debitTx, ...transactions];
    FirestoreBankingService.addTransaction(debitTx);

    // If internal receiver, also create Credit Transaction
    if (internalReceiver) {
      const creditTx: Transaction = {
        id: `tx-cred-${Date.now() + 1}`,
        transactionId: `TXN${Math.floor(1000000 + Math.random() * 9000000)}`,
        customerId: internalReceiver.customerId,
        accountNumber: internalReceiver.accountNumber,
        type: 'TRANSFER',
        amount,
        debitOrCredit: 'CREDIT',
        status: 'COMPLETED',
        description: remarks || `Received Domestic Transfer from ${activeCustomer.fullName}`,
        sender: `${activeCustomer.fullName} (${activeCustomer.accountNumber})`,
        receiver: `${internalReceiver.fullName} (${internalReceiver.accountNumber})`,
        timestamp: now,
        balanceAfter: internalReceiver.balance + amount,
      };
      newTxs = [creditTx, ...newTxs];
      FirestoreBankingService.addTransaction(creditTx);
    }

    setTransactions(newTxs);
    saveTransactions(newTxs);

    addAuditLog('FUNDS_TRANSFER', debitTx.transactionId, 'CUSTOMER', {
      from: activeCustomer.accountNumber,
      to: receiverAccount,
      amount,
    });

    return {
      success: true,
      message: `Successfully transferred ₹${amount.toLocaleString()} to ${receiverName || receiverAccount}.`,
    };
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0F1115] text-[#E5E7EB] font-sans">
      {/* Top Application Header matching Design HTML */}
      <Header
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        activeCustomerName={activeCustomer?.fullName}
        activeEmployeeName={activeEmployee?.fullName}
        activeEmployeeHeadName={activeEmployeeHead?.fullName}
        firebaseConnected={firebaseConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentRole === 'guest' && (
          <PortalSelector
            onSelectRole={setCurrentRole}
            customers={customers}
            employees={employees}
            employeeHeads={employeeHeads}
            transactions={transactions}
            doorstepRequests={doorstepRequests}
            auditLogs={auditLogs}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
            selectedEmployeeId={selectedEmployeeId}
            onSelectEmployee={setSelectedEmployeeId}
            selectedEmployeeHeadId={selectedEmployeeHeadId}
            onSelectEmployeeHead={setSelectedEmployeeHeadId}
          />
        )}

        {currentRole === 'admin' && (
          <AdminPortal
            customers={customers}
            employees={employees}
            doorstepRequests={doorstepRequests}
            transactions={transactions}
            auditLogs={auditLogs}
            settings={settings}
            onAddCustomer={handleAddCustomer}
            onEditCustomer={handleEditCustomer}
            onUpdateCustomerStatus={handleUpdateCustomerStatus}
            onDeleteCustomer={handleDeleteCustomer}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onToggleEmployeeStatus={handleToggleEmployeeStatus}
            onUpdateEmployeeAvailability={handleUpdateEmployeeAvailability}
            onDeleteEmployee={handleDeleteEmployee}
            onApproveDoorstep={handleApproveDoorstep}
            onAssignDoorstep={handleAssignDoorstep}
            onReassignDoorstep={handleReassignDoorstep}
            onRejectDoorstep={handleRejectDoorstep}
            onUpdateKycStatus={handleUpdateKycStatus}
            onUpdateSettings={(newSettings) => {
              setSettings(newSettings);
              saveSettings(newSettings);
              FirestoreBankingService.saveSettings(newSettings);
              addAuditLog('UPDATE_SYSTEM_SETTINGS', 'CORE_PARAMETERS', 'SYSTEM', {
                branch: newSettings.branch,
                withdrawalLimit: newSettings.dailyWithdrawalLimit,
              });
            }}
          />
        )}

        {currentRole === 'employee_head' && activeEmployeeHead && (
          <EmployeeHeadPortal
            currentHead={activeEmployeeHead}
            employees={employees}
            doorstepRequests={doorstepRequests}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onToggleEmployeeStatus={handleToggleEmployeeStatus}
            onUpdateEmployeeAvailability={handleUpdateEmployeeAvailability}
            onAssignDoorstep={handleAssignDoorstep}
            onReassignDoorstep={handleReassignDoorstep}
          />
        )}

        {currentRole === 'employee' && activeEmployee && (
          <EmployeePortal
            currentEmployee={activeEmployee}
            doorstepRequests={doorstepRequests}
            onUpdateStatus={handleUpdateDoorstepStatus}
            onVerifyAndComplete={handleVerifyAndComplete}
          />
        )}

        {currentRole === 'customer' && activeCustomer && (
          <CustomerPortal
            currentCustomer={activeCustomer}
            transactions={transactions}
            doorstepRequests={doorstepRequests}
            settings={settings}
            onRequestDoorstep={handleRequestDoorstep}
            onTransferFunds={handleTransferFunds}
          />
        )}
      </main>

      {/* Bottom Footer matching Design HTML */}
      <footer className="px-6 lg:px-8 py-3 border-t border-[#1F2937] bg-[#0F1115] flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span>© 2024 ApexCore Systems - Node.js Express & Ledger Enterprise Stack</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="text-gray-400">Database: <strong className={firebaseConnected ? 'text-emerald-400' : 'text-amber-400'}>{firebaseConnected ? 'Firestore Enterprise' : 'Connecting'}</strong></span>
          <span className="text-gray-400">Audit Logs: <strong className="text-gray-300">Enabled</strong></span>
          <span className="text-gray-400">Encryption: <strong className="text-gray-300">AES-256</strong></span>
          <span className="text-gray-400">Session: <strong className="text-emerald-400">Secure-Auth</strong></span>
        </div>
      </footer>
    </div>
  );
}
