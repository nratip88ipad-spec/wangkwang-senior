import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  FileSpreadsheet,
  Printer,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Member, MemberStatus } from '../types';
import { villageList, villageNamesMap } from '../data/initialData';
import { formatThaiDate, downloadCSV } from '../utils/thaiDate';

interface MembersTabProps {
  members: Member[];
  collectors: string[];
  onOpenAddMember: () => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onViewMemberDetail: (member: Member) => void;
  onRecordPaymentForMember: (member: Member) => void;
  onImportMembers?: (newMembers: Member[]) => void;
}

export const MembersTab: React.FC<MembersTabProps> = ({
  members,
  collectors,
  onOpenAddMember,
  onEditMember,
  onDeleteMember,
  onViewMemberDetail,
  onRecordPaymentForMember,
  onImportMembers
}) => {
  const [search, setSearch] = useState('');
  const [villageFilter, setVillageFilter] = useState('');
  const [collectorFilter, setCollectorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'age' | 'date'>('id');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        const query = search.toLowerCase().trim();
        const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
        const matchesQuery =
          !query ||
          fullName.includes(query) ||
          m.id.toLowerCase().includes(query) ||
          (m.phone && m.phone.includes(query)) ||
          (m.citizenId && m.citizenId.includes(query));

        const matchesVillage = !villageFilter || m.village === villageFilter;
        const matchesCollector = !collectorFilter || m.collector === collectorFilter;
        const matchesStatus = !statusFilter || m.status === statusFilter;

        return matchesQuery && matchesVillage && matchesCollector && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.firstName.localeCompare(b.firstName, 'th');
        }
        if (sortBy === 'age') {
          return b.age - a.age;
        }
        if (sortBy === 'date') {
          return new Date(b.regDate).getTime() - new Date(a.regDate).getTime();
        }
        return a.id.localeCompare(b.id);
      });
  }, [members, search, villageFilter, collectorFilter, statusFilter, sortBy]);

  const handleExportCSV = () => {
    const headers = [
      'รหัสสมาชิก',
      'ชื่อ',
      'นามสกุล',
      'เลขบัตรประชาชน',
      'หมู่บ้าน',
      'บ้านเลขที่',
      'เบอร์โทรศัพท์',
      'สายผู้เก็บเงิน',
      'อายุ',
      'วันที่สมัคร',
      'สถานะ',
      'ผู้รับประโยชน์',
      'ความสัมพันธ์',
      'เบอร์โทรผู้รับประโยชน์'
    ];
    const rows = filteredMembers.map((m) => [
      m.id,
      m.firstName,
      m.lastName,
      m.citizenId || '',
      m.village,
      m.houseNo,
      m.phone || '',
      m.collector,
      m.age,
      m.regDate,
      m.status,
      m.beneficiaryName || '',
      m.beneficiaryRelation || '',
      m.beneficiaryPhone || ''
    ]);
    downloadCSV('ทะเบียนสมาชิก_ฌาปนกิจวังกวาง.csv', headers, rows);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'รหัสสมาชิก',
      'ชื่อ',
      'นามสกุล',
      'เลขบัตรประชาชน',
      'หมู่บ้าน',
      'บ้านเลขที่',
      'เบอร์โทรศัพท์',
      'สายผู้เก็บเงิน',
      'อายุ',
      'วันที่สมัคร',
      'สถานะ',
      'ผู้รับประโยชน์',
      'ความสัมพันธ์',
      'เบอร์โทรผู้รับประโยชน์'
    ];
    const sampleRow = [
      'M101',
      'สมชาย',
      'ใจดี',
      '3-4001-00000-00-1',
      'ม.1',
      '45/2',
      '081-111-2233',
      collectors[0] || 'สายตัวแทนหมู่บ้าน',
      68,
      '2024-01-15',
      'ปกติ',
      'นางสมศรี ใจดี',
      'ภรรยา',
      '081-111-2234'
    ];
    downloadCSV('แม่แบบนำเข้าข้อมูลสมาชิก_ฌาปนกิจวังกวาง.csv', headers, [sampleRow]);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

        const parsedMembers: Member[] = [];
        let maxNum = members.reduce((max, m) => {
          const match = m.id.match(/\d+/);
          return match ? Math.max(max, parseInt(match[0], 10)) : max;
        }, 0);

        let startIdx = 0;
        if (jsonRows.length > 0) {
          const row0 = jsonRows[0] as any[];
          if (row0 && row0.some(cell => String(cell).includes('รหัส') || String(cell).includes('ชื่อ') || String(cell).includes('First') || String(cell).includes('Name'))) {
            startIdx = 1;
          }
        }

        for (let i = startIdx; i < jsonRows.length; i++) {
          const r = jsonRows[i] as any[];
          if (!r || r.length === 0 || !r.some(cell => cell !== undefined && cell !== '')) continue;

          maxNum++;
          const generatedId = `M${String(maxNum).padStart(3, '0')}`;

          const val0 = r[0] !== undefined ? String(r[0]).trim() : '';
          const isIdCol = val0.startsWith('M') || (val0.length > 3 && !isNaN(Number(val0)));

          const id = (val0.startsWith('M') ? val0 : '') || generatedId;
          const firstName = val0.startsWith('M') ? (r[1] ? String(r[1]).trim() : 'ไม่ระบุ') : (val0 || 'ไม่ระบุ');
          const lastName = val0.startsWith('M') ? (r[2] ? String(r[2]).trim() : '') : (r[1] ? String(r[1]).trim() : '');
          const citizenId = val0.startsWith('M') ? (r[3] ? String(r[3]).trim() : '') : (r[2] ? String(r[2]).trim() : '');
          const village = val0.startsWith('M') ? (r[4] ? String(r[4]).trim() : 'ม.1') : (r[3] ? String(r[3]).trim() : 'ม.1');
          const houseNo = val0.startsWith('M') ? (r[5] ? String(r[5]).trim() : '') : (r[4] ? String(r[4]).trim() : '');
          const phone = val0.startsWith('M') ? (r[6] ? String(r[6]).trim() : '') : (r[5] ? String(r[5]).trim() : '');
          const collector = val0.startsWith('M')
            ? (r[7] ? String(r[7]).trim() : (collectors[0] || 'สายตัวแทนหมู่บ้าน'))
            : (r[6] ? String(r[6]).trim() : (collectors[0] || 'สายตัวแทนหมู่บ้าน'));
          const age = Number(val0.startsWith('M') ? r[8] : r[7]) || 65;
          const regDate = val0.startsWith('M')
            ? (r[9] ? String(r[9]).trim() : new Date().toISOString().split('T')[0])
            : (r[8] ? String(r[8]).trim() : new Date().toISOString().split('T')[0]);
          const statusRaw = val0.startsWith('M') ? String(r[10] || 'ปกติ') : String(r[9] || 'ปกติ');
          
          let status: MemberStatus = 'ปกติ';
          if (statusRaw.includes('เสียชีวิต')) status = 'เสียชีวิต';
          else if (statusRaw.includes('ลาออก')) status = 'ลาออก';
          else if (statusRaw.includes('ค้าง')) status = 'ค้างชำระ';

          const beneficiaryName = val0.startsWith('M') ? (r[11] ? String(r[11]).trim() : '') : (r[10] ? String(r[10]).trim() : '');
          const beneficiaryRelation = val0.startsWith('M') ? (r[12] ? String(r[12]).trim() : '') : (r[11] ? String(r[11]).trim() : '');
          const beneficiaryPhone = val0.startsWith('M') ? (r[13] ? String(r[13]).trim() : '') : (r[12] ? String(r[12]).trim() : '');

          parsedMembers.push({
            id,
            firstName,
            lastName,
            citizenId: citizenId || undefined,
            village: villageList.includes(village) ? village : 'ม.1',
            houseNo: houseNo || '',
            phone: phone || undefined,
            collector: collector || collectors[0] || 'สายตัวแทนหมู่บ้าน',
            age: age || 65,
            regDate: regDate || new Date().toISOString().split('T')[0],
            status,
            beneficiaryName: beneficiaryName || undefined,
            beneficiaryRelation: beneficiaryRelation || undefined,
            beneficiaryPhone: beneficiaryPhone || undefined
          });
        }

        if (parsedMembers.length > 0 && onImportMembers) {
          onImportMembers(parsedMembers);
          alert(`นำเข้าข้อมูลสมาชิกสำเร็จทั้งหมด ${parsedMembers.length} รายการ!`);
        } else {
          alert('ไม่พบข้อมูลสมาชิกในไฟล์ หรือรูปแบบไฟล์ไม่ถูกต้อง');
        }
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel/CSV กรุณาตรวจสอบรูปแบบไฟล์');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>ทะเบียนสมาชิกชมรม</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ข้อมูลสมาชิกฌาปนกิจผู้สูงอายุ ตำบลวังกวาง อำเภอน้ำหนาว จังหวัดเพชรบูรณ์
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,.txt"
            onChange={handleFileImport}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            title="นำเข้าข้อมูลสมาชิกจากไฟล์ Excel/CSV"
          >
            <Upload className="w-4 h-4 text-teal-600" />
            <span>นำเข้า Excel/CSV</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            title="ดาวน์โหลดแม่แบบสำหรับนำเข้า"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>แม่แบบ CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            title="ดาวน์โหลดเป็นไฟล์ CSV สำหรับ Excel"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>ส่งออก</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            title="พิมพ์หน้ารายการสมาชิก"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>พิมพ์</span>
          </button>

          <button
            onClick={onOpenAddMember}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-teal-700/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ สมาชิกใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นชื่อ, นามสกุล, รหัส, เบอร์..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
          />
        </div>

        {/* Village Filter */}
        <div>
          <select
            value={villageFilter}
            onChange={(e) => setVillageFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
          >
            <option value="">-- ทุกหมู่บ้าน / พื้นที่ --</option>
            {villageList.map((v) => (
              <option key={v} value={v}>
                {villageNamesMap[v] || v}
              </option>
            ))}
            {/* Show any outside areas present in members */}
            {Array.from(
              new Set(
                members
                  .map((m) => m.village)
                  .filter((v) => v && !villageList.includes(v))
              )
            ).map((outsideV) => (
              <option key={outsideV} value={outsideV}>
                {outsideV}
              </option>
            ))}
          </select>
        </div>

        {/* Collector Filter */}
        <div>
          <select
            value={collectorFilter}
            onChange={(e) => setCollectorFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
          >
            <option value="">-- ทุกสายผู้เก็บเงิน --</option>
            {collectors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs font-medium"
          >
            <option value="">-- ทุกสถานะ --</option>
            <option value="ปกติ">ปกติ (Active)</option>
            <option value="ค้างชำระ">ค้างชำระ (Pending)</option>
            <option value="เสียชีวิต">เสียชีวิต (Deceased)</option>
            <option value="ลาออก">ลาออก (Resigned)</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
          >
            <option value="id">เรียงตาม: รหัสสมาชิก (M001..)</option>
            <option value="name">เรียงตาม: ชื่อ ก-ฮ</option>
            <option value="age">เรียงตาม: อายุ (มากไปน้อย)</option>
            <option value="date">เรียงตาม: วันที่สมัคร (ล่าสุด)</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3.5">รหัส</th>
                <th className="p-3.5">ชื่อ - นามสกุล</th>
                <th className="p-3.5">หมู่บ้าน / พื้นที่</th>
                <th className="p-3.5">สายผู้รับผิดชอบ</th>
                <th className="p-3.5">อายุ</th>
                <th className="p-3.5">เบอร์ติดต่อ</th>
                <th className="p-3.5">วันที่สมัคร</th>
                <th className="p-3.5">สถานะ</th>
                <th className="p-3.5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">ไม่พบข้อมูลสมาชิกตรงตามเงื่อนไขที่ค้นหา</p>
                    <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองหมู่บ้าน/สายผู้เก็บ</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (m.status === 'เสียชีวิต') statusBadge = 'bg-purple-50 text-purple-700 border-purple-200';
                  if (m.status === 'ลาออก') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                  if (m.status === 'ค้างชำระ') statusBadge = 'bg-red-50 text-red-700 border-red-200';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-mono font-bold text-teal-800">{m.id}</td>
                      <td className="p-3.5 font-medium text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{m.firstName} {m.lastName}</span>
                        </div>
                        {m.beneficiaryName && (
                          <span className="block text-[11px] text-slate-400 font-normal">
                            ทายาท: {m.beneficiaryName} ({m.beneficiaryRelation || 'ผู้รับประโยชน์'})
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-700">
                        <span className="font-medium">{m.village}</span>
                        {m.houseNo && <span className="text-slate-400 text-[11px] ml-1">(เลขที่ {m.houseNo})</span>}
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium">{m.collector}</td>
                      <td className="p-3.5 text-slate-600">{m.age} ปี</td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {m.phone || '-'}
                      </td>
                      <td className="p-3.5 text-slate-400">{formatThaiDate(m.regDate)}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusBadge}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onViewMemberDetail(m)}
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                            title="ดูข้อมูลละเอียด & ประวัติส่งเงิน"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {m.status === 'ปกติ' && (
                            <button
                              onClick={() => onRecordPaymentForMember(m)}
                              className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition"
                              title="บันทึกรับเงินสำหรับสมาชิกนี้"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onEditMember(m)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteMember(m.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="ลบสมาชิก"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <span>
            แสดง <strong className="text-slate-800">{filteredMembers.length}</strong> จากทั้งหมด {members.length} สมาชิก
          </span>
          <span className="text-[11px] text-slate-400">
            ระบบอัปเดตและบันทึกข้อมูลเรียลไทม์
          </span>
        </div>
      </div>
    </div>
  );
};
