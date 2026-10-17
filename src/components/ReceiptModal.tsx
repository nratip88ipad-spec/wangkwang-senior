import React from 'react';
import { X, Printer, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { CollectionRecord } from '../types';
import { formatThaiDate, formatCurrency, thaiBahtText } from '../utils/thaiDate';

interface ReceiptModalProps {
  record: CollectionRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl relative border border-slate-200 overflow-hidden print-receipt-container">
        {/* Header toolbar (Hidden in Print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Printer className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-sm">ใบเสร็จรับเงินฌาปนกิจสงเคราะห์</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ใบเสร็จ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Receipt Printable Content */}
        <div className="p-6 md:p-8 text-slate-800 font-sans" id="printableReceipt">
          {/* Header */}
          <div className="text-center pb-5 border-b-2 border-dashed border-slate-300">
            <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 text-teal-700 mx-auto flex items-center justify-center mb-2 shadow-xs">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              ใบเสร็จรับเงิน / ใบสำคัญรับเงิน
            </h2>
            <p className="text-sm font-semibold text-teal-800">
              ชมรมฌาปนกิจสงเคราะห์ผู้สูงอายุ ตำบลวังกวาง
            </p>
            <p className="text-xs text-slate-500">
              อบต.วังกวาง อำเภอน้ำหนาว จังหวัดเพชรบูรณ์ 67260
            </p>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 gap-2 my-4 py-2 border-b border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">เลขที่ใบเสร็จ:</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{record.id}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">วันที่รับเงิน:</span>
              <span className="font-medium text-slate-800">{formatThaiDate(record.date, true)}</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-xs bg-slate-50/80 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">ได้รับเงินจาก (สมาชิก):</span>
              <span className="font-bold text-slate-900 text-sm">{record.memberName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">รหัสสมาชิก:</span>
              <span className="font-mono font-semibold text-slate-700">{record.memberId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">หมู่บ้าน/พื้นที่:</span>
              <span className="font-medium text-slate-800">{record.village}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">งวดประจำ:</span>
              <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                {record.period}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">สายผู้รับผิดชอบเก็บเงิน:</span>
              <span className="font-medium text-slate-700">{record.collector}</span>
            </div>
            {record.note && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">หมายเหตุ:</span>
                <span className="text-slate-600">{record.note}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500">ช่องทางชำระ:</span>
              <span className="font-medium text-slate-700">{record.paymentMethod || 'เงินสด'}</span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="mt-4 p-4 rounded-xl bg-teal-50 border border-teal-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-[11px] text-teal-800 font-semibold block uppercase">
                จำนวนเงินที่ชำระ (บาท):
              </span>
              <span className="text-xs text-teal-700 italic">
                ({thaiBahtText(record.amount)})
              </span>
            </div>
            <div className="text-2xl font-black text-teal-900">
              {formatCurrency(record.amount)} <span className="text-sm font-semibold">บาท</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-4 grid grid-cols-2 gap-6 text-center text-xs">
            <div>
              <div className="h-10 border-b border-slate-300 mx-auto w-36"></div>
              <p className="mt-2 text-slate-700 font-medium">( {record.collector} )</p>
              <p className="text-[10px] text-slate-400">ผู้รับเงิน / ผู้แทนสายจัดเก็บ</p>
            </div>
            <div>
              <div className="h-10 border-b border-slate-300 mx-auto w-36"></div>
              <p className="mt-2 text-slate-700 font-medium">( นายประดับ ศรีทอง )</p>
              <p className="text-[10px] text-slate-400">เหรัญญิก / ประธานชมรม</p>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-6 pt-3 border-t border-dashed border-slate-200 text-center text-[10px] text-slate-400">
            <p className="flex items-center justify-center gap-1 text-emerald-600 font-medium mb-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>เอกสารฉบับนี้ออกโดยระบบบริหารจัดการชมรมฌาปนกิจผู้สูงอายุ ตำบลวังกวาง</span>
            </p>
            <p>โปรดเก็บใบเสร็จรับเงินฉบับนี้ไว้เป็นหลักฐานการมีสิทธิ์รับเงินสงเคราะห์ฌาปนกิจ</p>
          </div>
        </div>

        {/* Modal Bottom Buttons (Hidden in print) */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            ปิดหน้าต่าง
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-teal-700/20"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ใบเสร็จ (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
