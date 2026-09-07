export type UserRole = 'guest' | 'admin' | 'employee_head' | 'employee' | 'customer';

export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'DEACTIVATED' | 'BLOCKED' | 'DELETED';
export type KYCStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

export interface Customer {
  id: string;
  uid: string;
  customerId: string;
  accountNumber: string;
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  branch: string;
  ifsc: string;
  accountType: 'Savings' | 'Current' | 'Salary';
  status: AccountStatus;
  balance: number;
  availableBalance: number;
  kycStatus: KYCStatus;
  kycDocType?: string;
  kycDocNumber?: string;
  nominee?: {
    name: string;
    relation: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type EmployeeAvailability = 
  | 'AVAILABLE' 
  | 'BUSY' 
  | 'OFFLINE' 
  | 'INACTIVE'
  | 'Available' 
  | 'Busy' 
  | 'Offline' 
  | 'Inactive';

export interface EmployeeHead {
  id: string;
  headId: string;
  fullName: string;
  email: string;
  phone: string;
  branch: string;
  designation: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt?: string;
}

export interface Employee {
  id: string;
  uid: string;
  employeeId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  branch: string;
  designation: string;
  role?: string;
  employeeHead?: string; // Employee Head supervisor name
  employeeHeadId?: string; // Employee Head ID
  employeeHeadName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';
  availability: EmployeeAvailability;
  assignedCount: number;
  completedCount: number;
  createdAt: string;
  updatedAt?: string;
}

export type DoorstepStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'REACHED_LOCATION'
  | 'CASH_DELIVERED'
  | 'CASH_COLLECTED'
  | 'COMPLETED'
  | 'REJECTED';

export interface DoorstepRequest {
  id: string;
  requestId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  accountNumber: string;
  requestType: 'WITHDRAWAL' | 'DEPOSIT';
  amount: number;
  address: string;
  branch?: string;
  preferredTime?: string;
  notes?: string;
  denominations?: string;
  status: DoorstepStatus;
  employeeHeadId?: string | null;
  employeeHeadName?: string | null;
  assignedEmployeeId: string | null;
  assignedEmployeeName: string | null;
  assignedEmployeePhone?: string;
  assignedAt?: string;
  assignedBy?: string;
  startedAt?: string; // Started Time (ON_THE_WAY)
  arrivedAt?: string; // Arrived Time (REACHED_LOCATION)
  otpVerifiedAt?: string; // OTP verified time
  transactionId?: string; // Linked ledger transaction ID
  reassignedBy?: string;
  reassignmentReason?: string;
  verificationOtp: string;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type TransactionType = 'TRANSFER' | 'DOORSTEP_WITHDRAWAL' | 'DOORSTEP_DEPOSIT' | 'INITIAL_DEPOSIT';

export interface Transaction {
  id: string;
  transactionId: string;
  customerId: string;
  accountNumber: string;
  type: TransactionType;
  amount: number;
  debitOrCredit: 'DEBIT' | 'CREDIT';
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  description: string;
  sender: string;
  receiver: string;
  requestId?: string;
  timestamp: string;
  balanceAfter: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  actorUid?: string;
  actorRole?: 'admin' | 'employee_head' | 'employee' | 'customer' | 'system';
  action: string;
  targetId: string;
  targetType: 'CUSTOMER' | 'EMPLOYEE' | 'DOORSTEP_REQUEST' | 'SYSTEM' | 'SECURITY' | 'TRANSACTION';
  description?: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface SystemSettings {
  bankName: string;
  branch: string;
  ifscPrefix: string;
  dailyWithdrawalLimit: number;
  dailyTransferLimit: number;
  maxDoorstepWithdrawal: number;
  maxDoorstepDeposit: number;
  largeTransactionThreshold: number;
}
