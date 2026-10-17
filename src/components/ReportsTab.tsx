import React, { useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  PiggyBank,
  Wallet,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { Member, CollectionRecord, DeceasedRecord, CollectorRoute } from '../types';
import { formatCurrency, formatThaiDate, downloadCSV } from '../utils/thaiDate';
import { periodList } from '../data/initialData';

interface ReportsTabProps {
  members: Member[];
  collections: CollectionRecord[];
  deceased: DeceasedRecord[];
  collectors: CollectorRoute[];
  onResetData: () => void;
  onLoadSampleData?: () => void;
  onRestoreData: (backupData: {
    members: Member[];
    collections: CollectionRecord[];
    deceased: DeceasedRecord[];
    collectors?: CollectorRoute[];
  }) => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  members,
  collections,
  deceased,
  collectors,
  onResetData,
  onLoadSampleData,
  onRestoreData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCollected = collections.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalPayouts = deceased.reduce((sum, d) => sum + Number(d.payoutAmount), 0);
  const netBalance = totalCollected - totalPayouts;

  // Breakdown by period
  const periodBreakdowns = periodList.map((period) => {
    const periodCollections = collections.filter((c) => c.period === period);
    const revenue = periodCollections.reduce((sum, c) => sum + Number(c.amount), 0);
    const count = periodCollections.length;
    return {
      period,
      revenue,
      count
    };
  });

  // Export JSON Backup
  const handleExportJSON = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      clubName: 'ชมรมฌาปนกิจสงเคราะห์ผู้สูงอายุ ตำบลวังกวาง อำเภอน้ำหนาว จังหวัดเพชรบูรณ์',
      members,
      collections,
      deceased,
      collectors
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_ฌาปนกิจวังกวาง_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.members) && Array.isArray(parsed.collections)) {
          onRestoreData({
            members: parsed.members,
            collections: parsed.collections,
            deceased: Array.isArray(parsed.deceased) ? parsed.deceased : [],
            collectors: Array.isArray(parsed.collectors) ? parsed.collectors : undefined
          });
          alert('กู้คืนข้อมูลจากไฟล์สำรองสำเร็จเรียบร้อยแล้ว!');
        } else {
          alert('รูปแบบไฟล์สำรองไม่ถูกต้อง กรุณาใช้ไฟล์ที่ส่งออกจากระบบนี้เท่านั้น');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาตรวจสอบไฟล์ JSON อีกครั้ง');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            <span>รายงานการเงิน & การสำรองข้อมูล</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            สรุปรายรับ-รายจ่าย รายงานสำหรับที่ประชุมกรรมการ และการจัดเก็บไฟล์สำรอง
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>พิมพ์รายงานการเงิน</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">
              รายรับสะสมทั้งหมด (ค่าบำรุง/สงเคราะห์)
            </span>
            <span className="text-2xl font-black text-teal-700 mt-1 block">
              +{formatCurrency(totalCollected)} บาท
            </span>
            <span className="text-[11px] text-teal-600 font-medium">
              จาก {collections.length} รายการรับชำระ
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">
              รายจ่ายสะสม (เงินสงเคราะห์ฌาปนกิจศพ)
            </span>
            <span className="text-2xl font-black text-purple-700 mt-1 block">
              -{formatCurrency(totalPayouts)} บาท
            </span>
            <span className="text-[11px] text-purple-600 font-medium">
              ช่วยเหลือทายาท {deceased.length} ครอบครัว
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">
              ยอดเงินคงเหลือกองทุนสุทธิ
            </span>
            <span className={`text-2xl font-black mt-1 block ${netBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {formatCurrency(netBalance)} บาท
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              สำรองหมุนเวียนชมรม
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Period Revenue Breakdown Table */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
        <h3 className="font-bold text-slate-900 text-base mb-1">
          สรุปยอดจัดเก็บเงินแยกตามงวดประจำเดือน/ปี
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          ชมรมฌาปนกิจสงเคราะห์ผู้สูงอายุ ตำบลวังกวาง
        </p>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3.5">งวดประจำ</th>
                <th className="p-3.5">จำนวนสมาชิกที่ส่งเงิน</th>
                <th className="p-3.5 text-right">ยอดเงินจัดเก็บได้ (บาท)</th>
                <th className="p-3.5 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {periodBreakdowns.map((pb) => (
                <tr key={pb.period} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-bold text-slate-800">{pb.period}</td>
                  <td className="p-3.5 text-slate-600">{pb.count} คน</td>
                  <td className="p-3.5 text-right font-black text-teal-800">
                    {formatCurrency(pb.revenue)} บ.
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      บันทึกในระบบเรียบร้อย
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Backup & Restore Center */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>ศูนย์สำรองข้อมูล & กู้คืน (Backup & Restore)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            ข้อมูลทั้งหมดถูกบันทึกไว้อย่างปลอดภัยในเบราว์เซอร์ของคุณ ท่านสามารถดาวน์โหลดไฟล์สำรองเก็บไว้ในเครื่องคอมพิวเตอร์หรือแฟลชไดรฟ์เพื่อความปลอดภัยสูงสุด
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Export */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-teal-900 text-sm mb-1">ดาวน์โหลดไฟล์สำรอง</h4>
              <p className="text-xs text-teal-700 mb-4">
                ส่งออกข้อมูลสมาชิก, ประวัติการส่งเงิน และผู้เสียชีวิต เป็นไฟล์ JSON
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-teal-700/20"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์สำรอง (.json)</span>
            </button>
          </div>

          {/* Import */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">กู้คืนข้อมูลจากไฟล์</h4>
              <p className="text-xs text-slate-500 mb-4">
                เลือกไฟล์สำรอง JSON ที่เคยดาวน์โหลดไว้เพื่อนำเข้าข้อมูลกลับสู่ระบบ
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
                id="jsonUploadInput"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>เลือกไฟล์กู้คืน</span>
              </button>
            </div>
          </div>

          {/* Reset / Clear Data */}
          <div className="p-4 bg-red-50/60 border border-red-200 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-red-900 text-sm mb-1">ล้างข้อมูลทั้งหมดให้ว่างเปล่า</h4>
              <p className="text-xs text-red-700 mb-4">
                ล้างทะเบียนสมาชิก ข้อมูลการเงิน และสายผู้เก็บเงินทั้งหมดเพื่อเริ่มต้นกรอกข้อมูลจริง
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  if (window.confirm('คุณต้องการล้างข้อมูลทั้งหมดในระบบให้ว่างเปล่าใช่หรือไม่?')) {
                    onResetData();
                  }
                }}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ล้างข้อมูลทั้งหมดให้เป็นค่าว่าง</span>
              </button>
              {onLoadSampleData && (
                <button
                  onClick={() => {
                    if (window.confirm('คุณต้องการโหลดชุดข้อมูลตัวอย่างสำหรับทดสอบระบบใช่หรือไม่?')) {
                      onLoadSampleData();
                    }
                  }}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium rounded-xl text-xs transition text-center"
                >
                  โหลดชุดข้อมูลตัวอย่าง (สำหรับทดสอบ)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
