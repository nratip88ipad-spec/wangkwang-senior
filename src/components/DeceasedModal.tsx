import React, { useState, useEffect } from 'react';
import { X, HeartHandshake, Save, AlertCircle } from 'lucide-react';
import { Member, DeceasedRecord } from '../types';
import { getTodayThaiDate } from '../utils/thaiDate';

interface DeceasedModalProps {
  isOpen: boolean;
  members: Member[];
  onClose: () => void;
  onSave: (record: Omit<DeceasedRecord, 'id'>) => void;
}

export const DeceasedModal: React.FC<DeceasedModalProps> = ({
  isOpen,
  members,
  onClose,
  onSave
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [deathDate, setDeathDate] = useState(getTodayThaiDate());
  const [deathCause, setDeathCause] = useState('โรคชรา');
  const [payoutAmount, setPayoutAmount] = useState(10500);
  const [recipientName, setRecipientName] = useState('');
  const [recipientRelation, setRecipientRelation] = useState('ภรรยา');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [payoutDate, setPayoutDate] = useState(getTodayThaiDate());
  const [witnessName, setWitnessName] = useState('');
  const [notes, setNotes] = useState('');

  // Eligible members (primarily active or pending, though can show all)
  const availableMembers = members.filter((m) => m.status !== 'เสียชีวิต');

  // When member is selected, auto-fill beneficiary info!
  useEffect(() => {
    if (selectedMemberId) {
      const m = members.find((item) => item.id === selectedMemberId);
      if (m) {
        if (m.beneficiaryName) setRecipientName(m.beneficiaryName);
        if (m.beneficiaryRelation) setRecipientRelation(m.beneficiaryRelation);
        if (m.beneficiaryPhone) setRecipientPhone(m.beneficiaryPhone);
        if (m.collector) setWitnessName(m.collector);
      }
    }
  }, [selectedMemberId, members]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      alert('กรุณาเลือกสมาชิกที่เสียชีวิต');
      return;
    }
    const m = members.find((item) => item.id === selectedMemberId);
    if (!m) return;

    onSave({
      memberId: m.id,
      memberName: `${m.firstName} ${m.lastName}`,
      village: m.village,
      deathDate,
      deathCause: deathCause.trim() || undefined,
      payoutAmount: Number(payoutAmount) || 10500,
      recipientName: recipientName.trim(),
      recipientRelation: recipientRelation.trim(),
      recipientPhone: recipientPhone.trim() || undefined,
      payoutDate,
      collector: m.collector,
      witnessName: witnessName.trim() || undefined,
      notes: notes.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                บันทึกแจ้งเสียชีวิต & จ่ายเงินสงเคราะห์
              </h2>
              <p className="text-xs text-slate-500">
                ระบบจะปรับสถานะสมาชิกเป็น 'เสียชีวิต' และออกบันทึกการจ่ายเงิน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {/* Member Selection */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              เลือกสมาชิกผู้ล่วงลับ <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 text-xs font-semibold text-slate-800"
            >
              <option value="">-- กรุณาเลือกสมาชิก --</option>
              {availableMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} - {m.firstName} {m.lastName} ({m.village} - {m.collector})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                วันที่ถึงแก่กรรม <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={deathDate}
                onChange={(e) => setDeathDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">สาเหตุการเสียชีวิต</label>
              <input
                type="text"
                value={deathCause}
                onChange={(e) => setDeathCause(e.target.value)}
                placeholder="เช่น โรคชรา, หัวใจวาย"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 text-xs"
              />
            </div>
          </div>

          {/* Benefit payout info */}
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-purple-900 text-xs">เงินสงเคราะห์ฌาปนกิจ (บาท)</span>
              <span className="text-[11px] text-purple-700 font-medium">ระเบียบชมรม 10,500 บ.</span>
            </div>
            <input
              type="number"
              required
              min="0"
              step="100"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl focus:outline-none focus:border-purple-600 text-base font-bold text-purple-900 text-right"
            />
          </div>

          {/* Recipient info */}
          <div className="space-y-3 pt-2">
            <p className="font-bold text-slate-800 text-xs">ข้อมูลผู้รับเงินสงเคราะห์ (ทายาท)</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ชื่อ - นามสกุล ผู้รับเงิน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="เช่น นางสมศรี คูณเหง้า"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ความสัมพันธ์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientRelation}
                  onChange={(e) => setRecipientRelation(e.target.value)}
                  placeholder="เช่น ภรรยา, บุตร, สามี"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ผู้รับเงิน</label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  วันที่ส่งมอบเงิน <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={payoutDate}
                  onChange={(e) => setPayoutDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">พยาน / ผู้แทนสายจัดเก็บที่มอบเงิน</label>
              <input
                type="text"
                value={witnessName}
                onChange={(e) => setWitnessName(e.target.value)}
                placeholder="เช่น นายประดับ ศรีทอง"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น ส่งมอบเงิน ณ วัดวังกวาง เรียบร้อยแล้ว"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-[11px] text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              เมื่อบันทึกข้อมูลแล้ว สถานะของสมาชิกจะเปลี่ยนเป็น "เสียชีวิต" โดยอัตโนมัติ และระบบจะสร้างหนังสือสำคัญการจ่ายเงินให้พิมพ์ได้ทันที
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-purple-900/20"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกจ่ายเงินสงเคราะห์</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
