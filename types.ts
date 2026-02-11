
export enum VisitorStatus {
  IN = 'In-Building',
  OUT = 'Checked-Out',
  PENDING = 'Pending'
}

export interface Visitor {
  id: string;
  name: string;
  gender: string;
  age: string;
  place: string;
  aadharNo: string;
  groupLeader: string;
  jkpId: string;
  fromDate: string;
  toDate: string;
  amPm: string;
  phone: string;
  event: string;
  noOfDays: number;
  amount: number;
  status: VisitorStatus;
  checkInTimestamp: string;
}

export interface AIInsight {
  title: string;
  description: string;
  type: 'security' | 'efficiency' | 'general';
  action?: string;
}
