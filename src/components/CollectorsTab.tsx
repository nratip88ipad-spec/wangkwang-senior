import React, { useState } from 'react';
import {
  ShieldAlert,
  Phone,
  MapPin,
  Users,
  CheckCircle2,
  Receipt,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { Member, CollectorRoute, CollectionRecord } from '../types';
import { formatCurrency } from '../utils/thaiDate';

interface CollectorsTabProps {
  collectors: CollectorRoute[];
  members: Member[];
  collections: CollectionRecord[];
  currentPeriod: string;
  onSelectMember: (member: Member) => void;
  onOpenBatchForCollector: (collectorName: string) => void;
  onOpenAddCollector: () => void;
  onEditCollector: (collector: CollectorRoute) => void;
  onDeleteCollector: (collectorId: string) => void;
}

export const CollectorsTab: React.FC<CollectorsTabProps> = ({
  collectors,
  members,
  collections,
  currentPeriod,
  onSelectMember,
  onOpenBatchForCollector,
  onOpenAddCollector,
  onEditCollector,
  onDeleteCollector
}) => {
  const [selectedCollector, setSelectedCollector] = useState<CollectorRoute | null>(null);

  // Current period paid member IDs
  const currentPeriodPaidMemberIds = new Set(
    collections.filter((c) => c.period === currentPeriod).map((c) => c.memberId)
  );

  return (
    <div className="space-y-6">
      {/* Header and Add Route Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teal-600" />
            <span>ผู้รับผิดชอบสายการจัดเก็บเงินรายหมู่บ้าน</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            แบ่งสายการจัดเก็บเงินค่าบำรุงและประสานงานครอบคลุม ม.1 - ม.11 ตำบลวังกวาง และพื้นที่เชื่อมต่อ
          </p>
        </div>

        <button
          onClick={onOpenAddCollector}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-teal-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มสายผู้เก็บเงินใหม่</span>
        </button>
      </div>

      {/* Grid of Collector Routes */}
      {collectors.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-xs border border-dashed border-slate-300 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">ยังไม่มีข้อมูลสายผู้เก็บเงินในระบบ</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            เริ่มต้นเพิ่มสายผู้เก็บเงินเพื่อแบ่งพื้นที่รับผิดชอบและมอบหมายหัวหน้าสายจัดเก็บเงินฌาปนกิจ
          </p>
          <button
            onClick={onOpenAddCollector}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition inline-flex items-center gap-1.5 shadow-md shadow-teal-700/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มสายผู้เก็บเงินสายแรก</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collectors.map((col) => {
            const assignedMembers = members.filter((m) => m.collector === col.name);
            const activeCount = assignedMembers.filter((m) => m.status === 'ปกติ').length;
            const paidCount = assignedMembers.filter(
              (m) => m.status === 'ปกติ' && currentPeriodPaidMemberIds.has(m.id)
            ).length;
            const percent = activeCount > 0 ? Math.round((paidCount / activeCount) * 100) : 0;
            const collectedTotal = collections
              .filter((c) => c.collector === col.name)
              .reduce((sum, c) => sum + Number(c.amount), 0);

          return (
            <div
              key={col.id}
              className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 hover:border-teal-500/80 transition flex flex-col justify-between"
            >
              <div>
                {/* Top header on card with village & edit/delete buttons */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold border border-slate-200 block truncate max-w-[130px]">
                        {col.village}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEditCollector(col)}
                      className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                      title="แก้ไขข้อมูลสายนี้"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCollector(col.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="ลบสายนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{col.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 mb-3">{col.desc}</p>

                {/* Leader and Phone */}
                <div className="space-y-1 text-xs mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="flex justify-between">
                    <span className="text-slate-400">หัวหน้าสาย/ผู้ประสาน:</span>
                    <span className="font-semibold text-slate-800">{col.leaderName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">เบอร์โทรศัพท์:</span>
                    <a
                      href={`tel:${col.phone}`}
                      className="font-mono text-teal-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{col.phone}</span>
                    </a>
                  </div>
                </div>

                {/* Collection Progress in current period */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">
                      เก็บได้งวดนี้ ({currentPeriod}):
                    </span>
                    <span className="font-bold text-teal-800">
                      {paidCount} / {activeCount} คน ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Bottom stats and action buttons */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">ยอดเงินรวมที่บันทึกแล้ว:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(collectedTotal)} บาท</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setSelectedCollector(col)}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition text-center"
                  >
                    ดูสมาชิก ({assignedMembers.length})
                  </button>
                  <button
                    onClick={() => onOpenBatchForCollector(col.name)}
                    className="py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-xl transition text-center flex items-center justify-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                    <span>เก็บเงินยกสาย</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Collector Member List Drawer / Modal */}
      {selectedCollector && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedCollector.name}</h3>
                <p className="text-xs text-slate-500">
                  {selectedCollector.village} • ผู้รับผิดชอบ: {selectedCollector.leaderName} ({selectedCollector.phone})
                </p>
              </div>
              <button
                onClick={() => setSelectedCollector(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="p-3">รหัส</th>
                      <th className="p-3">ชื่อ - นามสกุล</th>
                      <th className="p-3">ที่อยู่/หมู่บ้าน</th>
                      <th className="p-3">อายุ</th>
                      <th className="p-3">งวด {currentPeriod}</th>
                      <th className="p-3 text-center">ดูประวัติ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members
                      .filter((m) => m.collector === selectedCollector.name)
                      .map((m) => {
                        const isPaid = currentPeriodPaidMemberIds.has(m.id);
                        return (
                          <tr key={m.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-mono font-bold text-teal-800">{m.id}</td>
                            <td className="p-3 font-medium text-slate-900">{m.firstName} {m.lastName}</td>
                            <td className="p-3 text-slate-600">{m.village} {m.houseNo ? `(${m.houseNo})` : ''}</td>
                            <td className="p-3 text-slate-600">{m.age} ปี</td>
                            <td className="p-3">
                              {m.status === 'เสียชีวิต' ? (
                                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded-full">
                                  เสียชีวิต
                                </span>
                              ) : isPaid ? (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full">
                                  ✓ จ่ายแล้ว
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded-full">
                                  ยังไม่ส่ง
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => {
                                  setSelectedCollector(null);
                                  onSelectMember(m);
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                              >
                                ดูโปรไฟล์
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>
                รวมสมาชิกทั้งหมดในสายนี้:{' '}
                {members.filter((m) => m.collector === selectedCollector.name).length} คน
              </span>
              <button
                onClick={() => setSelectedCollector(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
