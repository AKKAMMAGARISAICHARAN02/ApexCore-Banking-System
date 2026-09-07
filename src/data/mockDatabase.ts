import { Customer, Employee, EmployeeHead, DoorstepRequest, Transaction, AuditLog, SystemSettings } from '../types';
import { FirestoreBankingService } from '../services/firestoreBankingService';

const STORAGE_KEYS = {
  CUSTOMERS: 'apex_customers_v1',
  EMPLOYEES: 'apex_employees_v1',
  EMPLOYEE_HEADS: 'apex_employee_heads_v1',
  DOORSTEP: 'apex_doorstep_v1',
  TRANSACTIONS: 'apex_transactions_v1',
  AUDIT: 'apex_audit_v1',
  SETTINGS: 'apex_settings_v1',
  CLEANED_SEED_FLAG: 'apex_seed_cleaned_v2',
};

const DEFAULT_SETTINGS: SystemSettings = {
  bankName: 'ApexCore Banking',
  branch: 'Central Tech City Branch',
  ifscPrefix: 'SABK0001001',
  dailyWithdrawalLimit: 50000,
  dailyTransferLimit: 100000,
  maxDoorstepWithdrawal: 25000,
  maxDoorstepDeposit: 50000,
  largeTransactionThreshold: 50000,
};

// Immediate cleanup of any legacy demo / mock / seed banking data from localStorage
(function purgeLegacySeedData() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (!localStorage.getItem(STORAGE_KEYS.CLEANED_SEED_FLAG)) {
        localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
        localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
        localStorage.removeItem(STORAGE_KEYS.DOORSTEP);
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
        localStorage.removeItem(STORAGE_KEYS.AUDIT);
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.DOORSTEP, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.CLEANED_SEED_FLAG, 'true');
      }
    }
  } catch {
    // Ignore storage restrictions
  }
})();

// Helper functions for safe local persistence - 100% zero initial records
export function getStoredCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out any lingering mock identifiers
    const cleaned = parsed.filter((c: any) => c && c.customerId && !['CUST-883101', 'CUST-662914', 'CUST-331089', 'cust-1', 'cust-2', 'cust-3'].includes(c.customerId));
    return cleaned;
  } catch {
    return [];
  }
}

export function saveCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    window.dispatchEvent(new Event('apex_storage_updated'));
  } catch {
    // Safe fallback
  }
}

export function getStoredEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed.filter((e: any) => e && e.employeeId && !['EMP-1042', 'EMP-2081', 'emp-1', 'emp-2'].includes(e.employeeId));
    return cleaned;
  } catch {
    return [];
  }
}

export function saveEmployees(employees: Employee[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    window.dispatchEvent(new Event('apex_storage_updated'));
  } catch {
    // Safe fallback
  }
}

export function getStoredEmployeeHeads(): EmployeeHead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEE_HEADS);
    if (!raw) {
      const defaultHead: EmployeeHead = {
        id: 'head-101',
        headId: 'EH-101',
        fullName: 'Rajesh Verma',
        phone: '+91 98201 55432',
        email: 'rajesh.verma@apexcore.bank',
        branch: 'Central Tech City Branch',
        designation: 'Operations & Field Head',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.EMPLOYEE_HEADS, JSON.stringify([defaultHead]));
      return [defaultHead];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const defaultHead: EmployeeHead = {
        id: 'head-101',
        headId: 'EH-101',
        fullName: 'Rajesh Verma',
        phone: '+91 98201 55432',
        email: 'rajesh.verma@apexcore.bank',
        branch: 'Central Tech City Branch',
        designation: 'Operations & Field Head',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.EMPLOYEE_HEADS, JSON.stringify([defaultHead]));
      return [defaultHead];
    }
    return parsed;
  } catch {
    return [];
  }
}

export function saveEmployeeHeads(heads: EmployeeHead[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEE_HEADS, JSON.stringify(heads));
    window.dispatchEvent(new Event('apex_storage_updated'));
  } catch {
    // Safe fallback
  }
}

export function getStoredDoorstep(): DoorstepRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOORSTEP);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed.filter((d: any) => d && d.requestId && !['DRW-442018', 'DRD-991204', 'DRW-110294', 'dr-1', 'dr-2', 'dr-3'].includes(d.requestId));
    return cleaned;
  } catch {
    return [];
  }
}

export function saveDoorstep(requests: DoorstepRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DOORSTEP, JSON.stringify(requests));
    window.dispatchEvent(new Event('apex_storage_updated'));
  } catch {
    // Safe fallback
  }
}

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed.filter((t: any) => t && t.transactionId && !['TXN8829104', 'TXN7731294', 'TXN6629102', 'TXN5519201', 'tx-1', 'tx-2', 'tx-3', 'tx-4'].includes(t.transactionId));
    return cleaned;
  } catch {
    return [];
  }
}

export function saveTransactions(txs: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    window.dispatchEvent(new Event('apex_storage_updated'));
  } catch {
    // Safe fallback
  }
}

export function getStoredAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed.filter((a: any) => a && a.id && !['aud-1', 'aud-2', 'aud-3'].includes(a.id));
    return cleaned;
  } catch {
    return [];
  }
}

export function addAuditLog(action: string, targetId: string, targetType: AuditLog['targetType'], details: Record<string, any> = {}): void {
  try {
    const logs = getStoredAuditLogs();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminId: 'admin-root-001',
      action,
      targetId,
      targetType,
      details,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs));
    window.dispatchEvent(new Event('apex_storage_updated'));
    FirestoreBankingService.addAuditLog(newLog);
  } catch {
    // Safe fallback
  }
}

export function getStoredSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SystemSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    addAuditLog('UPDATE_GLOBAL_SETTINGS', 'SYSTEM_CONFIG', 'SYSTEM', settings);
    window.dispatchEvent(new Event('apex_storage_updated'));
  } catch {
    // Safe fallback
  }
}
