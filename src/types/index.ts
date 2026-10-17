export type MemberStatus = 'ปกติ' | 'เสียชีวิต' | 'ลาออก' | 'ค้างชำระ';

export interface Member {
  id: string; // e.g., M001
  firstName: string;
  lastName: string;
  citizenId?: string;
  village: string; // ม.1 - ม.11 หรือ เขตติดต่อ
  houseNo: string;
  phone?: string;
  collector: string; // สายพี่ประดับ, etc.
  age: number;
  regDate: string; // YYYY-MM-DD
  status: MemberStatus;
  beneficiaryName?: string;
  beneficiaryRelation?: string;
  beneficiaryPhone?: string;
  notes?: string;
}

export interface CollectionRecord {
  id: string; // REC-2569-001
  memberId: string;
  memberName: string;
  village: string;
  period: string; // e.g., "ตุลาคม 2569"
  amount: number;
  collector: string;
  date: string;
  note?: string;
  paymentMethod?: 'เงินสด' | 'โอนเงิน';
}

export interface DeceasedRecord {
  id: string; // DEC-001
  memberId: string;
  memberName: string;
  village: string;
  deathDate: string;
  deathCause?: string;
  payoutAmount: number;
  recipientName: string;
  recipientRelation: string;
  recipientPhone?: string;
  payoutDate: string;
  collector: string;
  witnessName?: string;
  notes?: string;
}

export interface CollectorRoute {
  id: string;
  name: string;
  village: string;
  desc: string;
  phone: string;
  leaderName: string;
}
