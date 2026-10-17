import React from 'react';
import { X, User, Phone, MapPin, Calendar, HeartHandshake, Receipt, Edit, DollarSign } from 'lucide-react';
import { Member, CollectionRecord } from '../types';
import { formatThaiDate, formatCurrency } from '../utils/thaiDate';

interface MemberDetailModalProps {
  member: Member | null;
  payments: CollectionRecord[];
  onClose: () => void;
  onEdit: (member: Member) => void;
  onRecordPayment: (member: Member) => void;
  onViewReceipt: (record: CollectionRecord) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  payments,
  onClose,
  onEdit,
  onRecordPayment,
  onViewReceipt
}) => {
  if (!member) return null;

  const memberPayments = payments.filter((p) => p.memberId === member.id);
  const totalPaid = memberPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (member.status === 'เสียชีวิต') statusBadge = 'bg-purple-50 text-purple-700 border-purple-200';
  if (member.status === 'ลาออก') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
  if (member.status === 'ค้างชำระ') statusBadge = 'bg-red-50 text-red-700 border-red-200';

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg shadow-xs">
              {member.firstName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {member.firstName} {member.lastName}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge}`}>
                  {member.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="font-mono font-semibold text-teal-700">{member.id}</span>
                <span>•</span>
                <span>อายุ {member.age} ปี</span>
                <span>•</span>
                <span>{member.village} {member.houseNo ? `(บ้านเลขที่ ${member.houseNo})` : ''}</span>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {/* Quick info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
            <div>
              <span className="text-slate-400 block text-[11px]">เลขประจำตัวประชาชน:</span>
              <span className="font-mono text-slate-700 font-medium">
                {member.citizenId || 'ไม่ได้ระบุ'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">เบอร์โทรศัพท์:</span>
              <span className="font-medium text-slate-800">
                {member.phone ? (
                  <a href={`tel:${member.phone}`} className="text-teal-700 hover:underline">
                    {member.phone}
                  </a>
                ) : (
                  'ไม่ได้ระบุ'
                )}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">สายผู้รับผิดชอบเก็บเงิน:</span>
              <span className="font-semibold text-teal-800">{member.collector}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">วันที่เข้าเป็นสมาชิก:</span>
              <span className="font-medium text-slate-800">{formatThaiDate(member.regDate, true)}</span>
            </div>
          </div>

          {/* Beneficiary Details */}
          <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-150">
            <h3 className="font-bold text-purple-900 text-xs mb-2 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-purple-700" />
              <span>ข้อมูลผู้รับผลประโยชน์ / ทายาทตามระเบียบ</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-purple-600/80 block text-[11px]">ชื่อ-นามสกุล:</span>
                <span className="font-semibold text-slate-800">{member.beneficiaryName || 'ไม่ได้ระบุ'}</span>
              </div>
              <div>
                <span className="text-purple-600/80 block text-[11px]">ความสัมพันธ์:</span>
                <span className="font-medium text-slate-800">{member.beneficiaryRelation || 'ไม่ได้ระบุ'}</span>
              </div>
              <div>
                <span className="text-purple-600/80 block text-[11px]">เบอร์โทรศัพท์:</span>
                <span className="font-medium text-slate-800">{member.beneficiaryPhone || 'ไม่ได้ระบุ'}</span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-teal-600" />
                <span>ประวัติการส่งเงินสมทบ / ค่าบำรุง ({memberPayments.length} งวด)</span>
              </h3>
              <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                ยอดรวมสะสม: {formatCurrency(totalPaid)} บาท
              </span>
            </div>

            {memberPayments.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                ยังไม่มีประวัติการส่งเงินในระบบ
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 font-semibold">เลขที่ใบเสร็จ</th>
                      <th className="p-2.5 font-semibold">งวดประจำ</th>
                      <th className="p-2.5 font-semibold">วันที่ชำระ</th>
                      <th className="p-2.5 font-semibold">จำนวนเงิน</th>
                      <th className="p-2.5 font-semibold">ผู้รับเงิน</th>
                      <th className="p-2.5 font-semibold text-center">พิมพ์</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-mono text-slate-500">{p.id}</td>
                        <td className="p-2.5 font-medium text-slate-800">{p.period}</td>
                        <td className="p-2.5 text-slate-600">{formatThaiDate(p.date)}</td>
                        <td className="p-2.5 font-bold text-teal-700">{formatCurrency(p.amount)} บ.</td>
                        <td className="p-2.5 text-slate-600">{p.collector}</td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => onViewReceipt(p)}
                            className="p-1 hover:bg-slate-200 text-teal-700 rounded transition"
                            title="ดูใบเสร็จ"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
          <button
            onClick={() => onEdit(member)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition flex items-center space-x-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>แก้ไขข้อมูล</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition"
            >
              ปิด
            </button>
            {member.status === 'ปกติ' && (
              <button
                onClick={() => onRecordPayment(member)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-teal-700/20"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>บันทึกรับเงิน</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
