import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Customer, Employee, EmployeeHead, DoorstepRequest, Transaction, AuditLog, SystemSettings } from '../types';

export class FirestoreBankingService {
  // Real-time subscriptions - always emits exact cloud state, including empty arrays (0 records)
  static subscribeCustomers(onUpdate: (customers: Customer[]) => void) {
    const path = 'customers';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: Customer[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Customer);
        });
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }

  static subscribeEmployeeHeads(onUpdate: (heads: EmployeeHead[]) => void) {
    const path = 'employeeHeads';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: EmployeeHead[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as EmployeeHead);
        });
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }

  static subscribeEmployees(onUpdate: (employees: Employee[]) => void) {
    const path = 'employees';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: Employee[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Employee);
        });
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }

  static subscribeDoorstep(onUpdate: (requests: DoorstepRequest[]) => void) {
    const path = 'doorstepRequests';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: DoorstepRequest[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as DoorstepRequest);
        });
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }

  static subscribeTransactions(onUpdate: (txs: Transaction[]) => void) {
    const path = 'transactions';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Transaction);
        });
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }

  static subscribeAuditLogs(onUpdate: (logs: AuditLog[]) => void) {
    const path = 'auditLogs';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: AuditLog[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as AuditLog);
        });
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }

  static subscribeSettings(onUpdate: (settings: SystemSettings) => void) {
    const path = 'settings';
    return onSnapshot(
      doc(db, path, 'global_config'),
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as SystemSettings);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }

  // Mutation helpers - writes occur only on real user/admin action
  static async saveCustomer(customer: Customer) {
    const path = `customers/${customer.customerId}`;
    try {
      await setDoc(doc(db, 'customers', customer.customerId), customer, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async deleteCustomer(customerId: string) {
    const path = `customers/${customerId}`;
    try {
      await deleteDoc(doc(db, 'customers', customerId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  static async saveEmployeeHead(head: EmployeeHead) {
    const path = `employeeHeads/${head.headId}`;
    try {
      await setDoc(doc(db, 'employeeHeads', head.headId), head, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async deleteEmployeeHead(headId: string) {
    const path = `employeeHeads/${headId}`;
    try {
      await deleteDoc(doc(db, 'employeeHeads', headId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  static async saveEmployee(employee: Employee) {
    const path = `employees/${employee.employeeId}`;
    try {
      await setDoc(doc(db, 'employees', employee.employeeId), employee, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async deleteEmployee(employeeId: string) {
    const path = `employees/${employeeId}`;
    try {
      await deleteDoc(doc(db, 'employees', employeeId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  static async saveDoorstep(request: DoorstepRequest) {
    const path = `doorstepRequests/${request.requestId}`;
    try {
      await setDoc(doc(db, 'doorstepRequests', request.requestId), request, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async addTransaction(tx: Transaction) {
    const path = `transactions/${tx.transactionId}`;
    try {
      await setDoc(doc(db, 'transactions', tx.transactionId), tx);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  static async addAuditLog(log: AuditLog) {
    const path = `auditLogs/${log.id}`;
    try {
      await setDoc(doc(db, 'auditLogs', log.id), log);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  static async saveSettings(settings: SystemSettings) {
    const path = 'settings/global_config';
    try {
      await setDoc(doc(db, 'settings', 'global_config'), settings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}
