import { Member, CollectionRecord, DeceasedRecord, CollectorRoute } from '../types';

// Clean initial state (All mock data cleared)
export const initialMembers: Member[] = [];

export const initialCollections: CollectionRecord[] = [];

export const initialDeceased: DeceasedRecord[] = [];

export const initialCollectors: CollectorRoute[] = [];

export const villageList = [
  'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5',
  'ม.6', 'ม.7', 'ม.8', 'ม.9', 'ม.10', 'ม.11', 'นอกเขต'
];

export const villageNamesMap: Record<string, string> = {
  'ม.1': 'ม.1 บ้านวังกวาง',
  'ม.2': 'ม.2 บ้านวังกวาง',
  'ม.3': 'ม.3 บ้านไร่ใต้',
  'ม.4': 'ม.4 บ้านห้วยหินลับ',
  'ม.5': 'ม.5 บ้านซำม่วง',
  'ม.6': 'ม.6 บ้านดงคล้อ',
  'ม.7': 'ม.7 บ้านฟองใต้',
  'ม.8': 'ม.8 บ้านผาลาน้อย',
  'ม.9': 'ม.9 บ้านห้วยยางทอง',
  'ม.10': 'ม.10 บ้านโป่งนกแก้ว',
  'ม.11': 'ม.11 บ้านวังกวาง',
  'นอกเขต': 'นอกเขตพื้นที่ (ระบุเองได้)'
};

export const periodList = [
  'ตุลาคม 2569',
  'มีนาคม 2569',
  'ตุลาคม 2568',
  'มีนาคม 2568',
  'ตุลาคม 2567'
];

// Sample demo data (Available on request via Reports tab if needed)
export const sampleMembers: Member[] = [
  {
    id: "M001",
    firstName: "จั๊บ",
    lastName: "คูณเหง้า",
    citizenId: "3-4001-00214-11-2",
    village: "ม.2",
    houseNo: "12",
    phone: "089-123-4567",
    collector: "สายพี่ประดับ",
    age: 78,
    regDate: "2017-05-10",
    status: "เสียชีวิต",
    beneficiaryName: "นางสมศรี คูณเหง้า",
    beneficiaryRelation: "ภรรยา",
    beneficiaryPhone: "089-123-4568"
  },
  {
    id: "M002",
    firstName: "ใส",
    lastName: "ขวัญพร้อม",
    citizenId: "3-4001-00435-82-1",
    village: "ม.2",
    houseNo: "45",
    phone: "081-987-6543",
    collector: "สายพี่สอน",
    age: 82,
    regDate: "2017-06-12",
    status: "เสียชีวิต",
    beneficiaryName: "นายวิเชียร ขวัญพร้อม",
    beneficiaryRelation: "บุตร",
    beneficiaryPhone: "081-987-6544"
  },
  {
    id: "M003",
    firstName: "ประดับ",
    lastName: "ศรีทอง",
    citizenId: "3-4001-00123-11-0",
    village: "ม.2",
    houseNo: "1",
    phone: "081-223-3445",
    collector: "สายพี่ประดับ",
    age: 68,
    regDate: "2016-09-16",
    status: "ปกติ",
    beneficiaryName: "นางจำเนียร ศรีทอง",
    beneficiaryRelation: "คู่สมรส",
    beneficiaryPhone: "081-223-3446"
  }
];

export const sampleCollectors: CollectorRoute[] = [
  {
    id: "COL-01",
    name: "สายพี่ประดับ",
    village: "ม.2 บ้านวังกวาง (สาย 1)",
    desc: "ดูแลรับผิดชอบจัดเก็บเงินสมาชิกสาย 1 โซนวัดวังกวาง และคุ้มกลาง",
    phone: "081-223-3445",
    leaderName: "นายประดับ ศรีทอง"
  },
  {
    id: "COL-02",
    name: "สายพี่สอน",
    village: "ม.2 บ้านวังกวาง (สาย 2)",
    desc: "ดูแลรับผิดชอบจัดเก็บเงินสมาชิกสาย 2 โซนคุ้มใต้และท้ายหมู่บ้าน",
    phone: "089-334-4556",
    leaderName: "นายสอน วังคีรี"
  },
  {
    id: "COL-03",
    name: "สายจิรศักดิ์",
    village: "ม.11 บ้านวังกวางใหม่ (สาย 1)",
    desc: "ดูแลรับผิดชอบจัดเก็บเงินสมาชิก ม.11 โซนถนนใหญ่และคุ้มเหนือ",
    phone: "084-556-6778",
    leaderName: "นายจิรศักดิ์ มั่นคง"
  },
  {
    id: "COL-04",
    name: "สายสร้อย",
    village: "ม.11 บ้านวังกวางใหม่ (สาย 2)",
    desc: "ดูแลรับผิดชอบจัดเก็บเงินสมาชิก ม.11 โซนฝั่งหนองน้ำและคุ้มทุ่ง",
    phone: "087-667-7889",
    leaderName: "นางสร้อย สุวรรณ"
  },
  {
    id: "COL-05",
    name: "ผู้ใหญ่บ้าน/ตัวแทนหมู่บ้าน",
    village: "ม.1 - ม.10 & เขตติดต่อ",
    desc: "ตัวแทนจัดเก็บประจำ ม.1, ม.3, ม.4, ม.5, ม.6, ม.7, ม.8, ม.9, ม.10 และพื้นที่เขตติดต่อ",
    phone: "082-111-2233",
    leaderName: "ผู้นำชุมชนประจำหมู่บ้าน"
  }
];
