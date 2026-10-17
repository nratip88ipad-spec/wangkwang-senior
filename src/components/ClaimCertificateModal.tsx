import React from 'react';
import { X, Printer, HeartHandshake, Award } from 'lucide-react';
import { DeceasedRecord } from '../types';
import { formatThaiDate, formatCurrency, thaiBahtText } from '../utils/thaiDate';

interface ClaimCertificateModalProps {
  record: DeceasedRecord | null;
  onClose: () => void;
}

export const ClaimCertificateModal: React.FC<ClaimCertificateModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl relative border border-slate-200 overflow-hidden print-receipt-container">
        {/* Toolbar */}
        <div className="no-print p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-sm">หนังสือสำคัญการจ่ายเงินสงเคราะห์ฌาปนกิจศพ</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ใบสำคัญ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Area */}
        <div className="p-8 text-slate-800 font-sans border-8 border-double border-purple-100 m-2 rounded-xl">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-200">
            <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-200 text-purple-800 mx-auto flex items-center justify-center mb-3">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              หนังสือสำคัญการจ่ายเงินสงเคราะห์ฌาปนกิจศพ
            </h1>
            <p className="text-sm font-semibold text-purple-900 mt-1">
              ชมรมฌาปนกิจสงเคราะห์ผู้สูงอายุ ตำบลวังกวาง
            </p>
            <p className="text-xs text-slate-500">
              อำเภอน้ำหนาว จังหวัดเพชรบูรณ์
            </p>
          </div>

          {/* Body Content */}
          <div className="my-6 space-y-4 text-xs md:text-sm leading-relaxed text-slate-700">
            <div className="flex justify-between text-xs text-slate-500">
              <span>เลขที่ทะเบียนคำขอ: <strong className="text-slate-800 font-mono">{record.id}</strong></span>
              <span>วันที่จ่ายเงิน: <strong className="text-slate-800">{formatThaiDate(record.payoutDate, true)}</strong></span>
            </div>

            <p className="text-justify indent-8">
              หนังสือฉบับนี้ให้ไว้เพื่อแสดงว่า ชมรมฌาปนกิจสงเคราะห์ผู้สูงอายุ ตำบลวังกวาง ได้จ่ายเงินสงเคราะห์ครอบครัวเพื่อช่วยเหลือค่าจัดการศพของสมาชิกชมรม ผู้ล่วงลับ คือ
            </p>

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-150 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">ชื่อสมาชิกผู้เสียชีวิต:</span>
                <span className="font-bold text-slate-900 text-sm">{record.memberName} (รหัส {record.memberId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ที่อยู่/หมู่บ้าน:</span>
                <span className="font-medium text-slate-800">{record.village} ต.วังกวาง</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">วันที่ถึงแก่กรรม:</span>
                <span className="font-medium text-slate-800">{formatThaiDate(record.deathDate, true)}</span>
              </div>
              {record.deathCause && (
                <div className="flex justify-between">
                  <span className="text-slate-500">สาเหตุการเสียชีวิต:</span>
                  <span className="font-medium text-slate-800">{record.deathCause}</span>
                </div>
              )}
            </div>

            <p className="text-justify indent-8">
              โดยส่งมอบเงินสงเคราะห์ให้แก่ <strong>{record.recipientName}</strong> เกี่ยวข้องเป็น <strong>{record.recipientRelation}</strong> ของผู้เสียชีวิต
              เป็นจำนวนเงินทั้งสิ้น:
            </p>

            {/* Amount Box */}
            <div className="p-4 rounded-xl bg-purple-100/70 border border-purple-300 text-center">
              <span className="block text-2xl font-black text-purple-900">
                {formatCurrency(record.payoutAmount)} บาท
              </span>
              <span className="text-xs font-semibold text-purple-800">
                ({thaiBahtText(record.payoutAmount)})
              </span>
            </div>

            <p className="text-justify indent-8 text-xs text-slate-500">
              ผู้รับเงินได้ตรวจนับจำนวนเงินดังกล่าวถูกต้องครบถ้วนแล้ว จึงลงลายมือชื่อไว้เป็นหลักฐานสำคัญต่อหน้าพยาน
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-4 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="h-10 border-b border-slate-400 mx-auto w-40"></div>
              <p className="mt-2 text-slate-800 font-semibold">( {record.recipientName} )</p>
              <p className="text-[11px] text-slate-500">ผู้รับเงินสงเคราะห์ / ทายาท</p>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 mx-auto w-40"></div>
              <p className="mt-2 text-slate-800 font-semibold">( {record.witnessName || record.collector} )</p>
              <p className="text-[11px] text-slate-500">พยาน / ผู้แทนสายจัดเก็บ</p>
            </div>
          </div>

          <div className="mt-8 pt-4 text-center text-xs border-t border-slate-100">
            <div className="h-10 border-b border-slate-400 mx-auto w-44"></div>
            <p className="mt-2 text-slate-800 font-semibold">( นายประดับ ศรีทอง )</p>
            <p className="text-[11px] text-slate-500">ประธานชมรมฌาปนกิจสงเคราะห์ผู้สูงอายุ ตำบลวังกวาง</p>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            ปิด
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-purple-900/20"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์หนังสือสำคัญ (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
