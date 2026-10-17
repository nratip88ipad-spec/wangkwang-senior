import React, { useState, useMemo } from 'react';
import {
  HeartHandshake,
  UserPlus,
  Printer,
  Download,
  Search,
  Award,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { DeceasedRecord } from '../types';
import { formatThaiDate, formatCurrency, downloadCSV } from '../utils/thaiDate';
import { villageList, villageNamesMap } from '../data/initialData';

interface DeceasedTabProps {
  deceased: DeceasedRecord[];
  onOpenAddDeceased: () => void;
  onViewCertificate: (record: DeceasedRecord) => void;
}

export const DeceasedTab: React.FC<DeceasedTabProps> = ({
  deceased,
  onOpenAddDeceased,
  onViewCertificate
}) => {
  const [search, setSearch] = useState('');
  const [villageFilter, setVillageFilter] = useState('');

  const filteredDeceased = useMemo(() => {
    return deceased.filter((d) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.memberName.toLowerCase().includes(q) ||
        d.recipientName.toLowerCase().includes(q) ||
        d.memberId.toLowerCase().includes(q);
      const matchesVillage = !villageFilter || d.village === villageFilter;
      return matchesSearch && matchesVillage;
    });
  }, [deceased, search, villageFilter]);

  const totalPayouts = deceased.reduce((sum, d) => sum + Number(d.payoutAmount), 0);

  const handleExportCSV = () => {
    const headers = [
      'เลขที่คำขอ',
      'รหัสสมาชิก',
      'ชื่อสมาชิกผู้เสียชีวิต',
      'หมู่บ้าน',
      'วันที่เสียชีวิต',
      'สาเหตุการเสียชีวิต',
      'จำนวนเงินสงเคราะห์ (บาท)',
      'ชื่อผู้รับเงิน (ทายาท)',
      'ความสัมพันธ์',
      'เบอร์โทรผู้รับเงิน',
      'วันที่จ่ายเงิน',
      'สายผู้รับผิดชอบ',
      'พยานส่งมอบเงิน',
      'หมายเหตุ'
    ];
    const rows = filteredDeceased.map((d) => [
      d.id,
      d.memberId,
      d.memberName,
      d.village,
      d.deathDate,
      d.deathCause || '',
      d.payoutAmount,
      d.recipientName,
      d.recipientRelation,
      d.recipientPhone || '',
      d.payoutDate,
      d.collector,
      d.witnessName || '',
      d.notes || ''
    ]);
    downloadCSV('ทะเบียนผู้เสียชีวิต_และการจ่ายเงินสงเคราะห์.csv', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-purple-700" />
            <span>ทะเบียนผู้เสียชีวิต & การจ่ายเงินสงเคราะห์</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            บันทึกการส่งมอบเงินสงเคราะห์ฌาปนกิจศพแก่ทายาทตามระเบียบชมรม (อัตรา 10,500 บาท/ราย)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            onClick={onOpenAddDeceased}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-purple-900/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ บันทึกการเสียชีวิต / จ่ายเงิน</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 flex justify-between items-center">
          <div>
            <span className="text-xs text-purple-800 font-semibold block">ผู้เสียชีวิตสะสม</span>
            <span className="text-2xl font-black text-purple-900">{deceased.length} ราย</span>
            <span className="text-[11px] text-purple-600 block mt-0.5">ได้รับเงินสงเคราะห์ครบถ้วน</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 flex justify-between items-center">
          <div>
            <span className="text-xs text-purple-800 font-semibold block">รวมเงินสงเคราะห์ที่จ่ายแล้ว</span>
            <span className="text-2xl font-black text-purple-900">{formatCurrency(totalPayouts)} บาท</span>
            <span className="text-[11px] text-purple-600 block mt-0.5">ช่วยเหลือครอบครัวสมาชิก</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 flex justify-between items-center">
          <div>
            <span className="text-xs text-purple-800 font-semibold block">ระเบียบเงินสงเคราะห์</span>
            <span className="text-2xl font-black text-purple-900">10,500 บาท</span>
            <span className="text-[11px] text-purple-600 block mt-0.5">อัตรามาตรฐานต่อราย</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อผู้เสียชีวิต หรือชื่อผู้รับเงิน..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <select
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="">-- ทั้งหมดทุกหมู่บ้าน --</option>
              {villageList.map((v) => (
                <option key={v} value={v}>
                  {villageNamesMap[v] || v}
                </option>
              ))}
              {Array.from(
                new Set(
                  deceased
                    .map((d) => d.village)
                    .filter((v) => v && !villageList.includes(v))
                )
              ).map((ov) => (
                <option key={ov} value={ov}>
                  {ov}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3.5">ลำดับ</th>
                <th className="p-3.5">ชื่อผู้เสียชีวิต</th>
                <th className="p-3.5">พื้นที่/หมู่บ้าน</th>
                <th className="p-3.5">วันที่ถึงแก่กรรม</th>
                <th className="p-3.5 text-right">เงินสงเคราะห์</th>
                <th className="p-3.5">ผู้รับเงิน (ทายาท)</th>
                <th className="p-3.5">วันที่จ่ายเงิน</th>
                <th className="p-3.5">สายผู้ดูแล</th>
                <th className="p-3.5 text-center">พิมพ์ใบสำคัญ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeceased.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    ไม่พบข้อมูลผู้เสียชีวิต
                  </td>
                </tr>
              ) : (
                filteredDeceased.map((d, index) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-slate-400 font-mono">{index + 1}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {d.memberName}
                      <span className="block text-[11px] text-slate-400 font-normal font-mono">
                        {d.memberId} {d.deathCause ? `• ${d.deathCause}` : ''}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">{d.village}</td>
                    <td className="p-3.5 text-slate-600">{formatThaiDate(d.deathDate)}</td>
                    <td className="p-3.5 text-right font-black text-purple-800">
                      {formatCurrency(d.payoutAmount)} บ.
                    </td>
                    <td className="p-3.5 text-slate-800 font-medium">
                      {d.recipientName}
                      <span className="block text-[11px] text-purple-700">({d.recipientRelation})</span>
                    </td>
                    <td className="p-3.5 text-slate-600">{formatThaiDate(d.payoutDate)}</td>
                    <td className="p-3.5 text-slate-600">{d.collector}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => onViewCertificate(d)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold rounded-lg text-[11px] transition flex items-center gap-1 mx-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>พิมพ์ใบสำคัญ</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>แสดง {filteredDeceased.length} รายการ</span>
          <span className="font-bold text-purple-900">
            ยอดจ่ายเงินสงเคราะห์รวม: {formatCurrency(totalPayouts)} บาท
          </span>
        </div>
      </div>
    </div>
  );
};
