import React from 'react';
import {
  Users,
  UserCheck,
  HeartHandshake,
  Wallet,
  PiggyBank,
  TrendingUp,
  Receipt,
  UserPlus,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Member, CollectionRecord, DeceasedRecord, CollectorRoute } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/thaiDate';
import { villageList, villageNamesMap } from '../data/initialData';

interface DashboardTabProps {
  members: Member[];
  collections: CollectionRecord[];
  deceased: DeceasedRecord[];
  collectors: CollectorRoute[];
  onOpenAddMember: () => void;
  onOpenAddPayment: () => void;
  onOpenAddDeceased: () => void;
  onSwitchTab: (tabId: string) => void;
  onViewReceipt: (record: CollectionRecord) => void;
  onViewCertificate: (record: DeceasedRecord) => void;
  currentPeriod: string;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  members,
  collections,
  deceased,
  collectors,
  onOpenAddMember,
  onOpenAddPayment,
  onOpenAddDeceased,
  onSwitchTab,
  onViewReceipt,
  onViewCertificate,
  currentPeriod
}) => {
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'ปกติ').length;
  const deceasedCount = deceased.length;
  const pendingMembers = members.filter((m) => m.status === 'ค้างชำระ').length;

  const totalCollected = collections.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalPayouts = deceased.reduce((sum, d) => sum + Number(d.payoutAmount), 0);
  const netBalance = totalCollected - totalPayouts;

  // Current period collections
  const currentPeriodCollections = collections.filter((c) => c.period === currentPeriod);
  const currentPeriodPaidMemberIds = new Set(currentPeriodCollections.map((c) => c.memberId));
  const currentPeriodPaidCount = currentPeriodPaidMemberIds.size;
  const activeUnpaidCount = members.filter(
    (m) => m.status === 'ปกติ' && !currentPeriodPaidMemberIds.has(m.id)
  ).length;

  // Village counts: 11 official villages + any outside areas in members
  const officialKeys = villageList.filter((v) => v !== 'นอกเขต');
  const outsideInMembers = Array.from(
    new Set(
      members
        .map((m) => m.village)
        .filter((v) => !officialKeys.includes(v))
    )
  );
  const displayVillages = [
    ...officialKeys,
    ...(outsideInMembers.length > 0 ? outsideInMembers : ['นอกเขต'])
  ];

  const villageCounts = displayVillages.map((villageKey) => {
    const villageMembers = members.filter((m) => m.village === villageKey);
    const villageActive = villageMembers.filter((m) => m.status === 'ปกติ').length;
    const villagePaid = villageMembers.filter(
      (m) => m.status === 'ปกติ' && currentPeriodPaidMemberIds.has(m.id)
    ).length;
    return {
      key: villageKey,
      fullName: villageNamesMap[villageKey] || villageKey,
      total: villageMembers.length,
      active: villageActive,
      paid: villagePaid,
      percent: villageActive > 0 ? Math.round((villagePaid / villageActive) * 100) : 0
    };
  });

  // Recent combined activities (last 6)
  const activities = [
    ...collections.map((c) => ({
      id: c.id,
      type: 'collection' as const,
      title: `รับชำระเงินค่าบำรุง (${c.period})`,
      person: c.memberName,
      subtitle: `${c.village} • ${c.collector}`,
      amount: c.amount,
      date: c.date,
      data: c
    })),
    ...deceased.map((d) => ({
      id: d.id,
      type: 'deceased' as const,
      title: `จ่ายเงินสงเคราะห์ฌาปนกิจศพ`,
      person: `${d.memberName} (ถึงแก่กรรม)`,
      subtitle: `ผู้รับเงิน: ${d.recipientName} (${d.recipientRelation})`,
      amount: d.payoutAmount,
      date: d.payoutDate,
      data: d
    }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/30 text-teal-200 border border-teal-400/30">
                อบต.วังกวาง อ.น้ำหนาว จ.เพชรบูรณ์
              </span>
              <span className="text-xs text-teal-300 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>งวด: {currentPeriod}</span>
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold leading-tight">
              ชมรมฌาปนกิจสงเคราะห์ผู้สูงอายุ ตำบลวังกวาง
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              ระบบสารสนเทศทะเบียนสมาชิก ตรวจสอบการส่งเงินสมทบรายงวด และการเบิกจ่ายเงินสงเคราะห์ครอบครัวสมาชิกผู้ล่วงลับ
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddPayment}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-md shadow-teal-950/30"
            >
              <Receipt className="w-4 h-4" />
              <span>บันทึกรับเงิน</span>
            </button>
            <button
              onClick={onOpenAddMember}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>เพิ่มสมาชิก</span>
            </button>
            <button
              onClick={onOpenAddDeceased}
              className="px-4 py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>บันทึกจ่ายสงเคราะห์</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Members */}
        <div
          onClick={() => onSwitchTab('members')}
          className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 hover:border-teal-500 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500">สมาชิกทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{totalMembers}</span>
              <span className="text-xs text-slate-500">คน</span>
            </div>
            <span className="text-[10px] text-blue-600 font-medium">ม.1 - ม.11 & เขตติดต่อ</span>
          </div>
        </div>

        {/* Active Members */}
        <div
          onClick={() => onSwitchTab('members')}
          className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 hover:border-emerald-500 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500">สมาชิกปกติ (Active)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-emerald-600">{activeMembers}</span>
              <span className="text-xs text-slate-500">คน</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">พร้อมสมทบเข้ากองทุน</span>
          </div>
        </div>

        {/* Deceased Count */}
        <div
          onClick={() => onSwitchTab('deceased')}
          className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 hover:border-purple-500 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500">ผู้เสียชีวิต</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-purple-700">{deceasedCount}</span>
              <span className="text-xs text-slate-500">ราย</span>
            </div>
            <span className="text-[10px] text-purple-600 font-medium">จ่ายสงเคราะห์แล้ว</span>
          </div>
        </div>

        {/* Total Collected */}
        <div
          onClick={() => onSwitchTab('collections')}
          className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 hover:border-teal-500 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500">รวมเงินจัดเก็บได้</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-teal-700">{formatCurrency(totalCollected)}</span>
              <span className="text-xs text-slate-500">บ.</span>
            </div>
            <span className="text-[10px] text-teal-600 font-medium">{collections.length} รายการรับชำระ</span>
          </div>
        </div>

        {/* Total Payouts */}
        <div
          onClick={() => onSwitchTab('deceased')}
          className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 hover:border-amber-500 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500">รวมจ่ายสงเคราะห์</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-amber-700">{formatCurrency(totalPayouts)}</span>
              <span className="text-xs text-slate-500">บ.</span>
            </div>
            <span className="text-[10px] text-amber-600 font-medium">เฉลี่ย 10,500 บ./ราย</span>
          </div>
        </div>

        {/* Net Fund Balance */}
        <div
          onClick={() => onSwitchTab('reports')}
          className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 hover:border-teal-500 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500">ยอดคงเหลือสุทธิ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold ${netBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {formatCurrency(netBalance)}
              </span>
              <span className="text-xs text-slate-500">บ.</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">กองทุนหมุนเวียนชมรม</span>
          </div>
        </div>
      </div>

      {/* Progress & Alert Section for Current Period */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <h3 className="font-bold text-slate-800 text-sm">
              ความคืบหน้าการจัดเก็บเงินงวด {currentPeriod}
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            ชำระแล้ว <strong className="text-teal-700 font-bold">{currentPeriodPaidCount}</strong> จากสมาชิกปกติทั้งหมด {activeMembers} คน
            {activeUnpaidCount > 0 && (
              <span className="text-amber-700 ml-1 font-medium">
                (ยังค้างส่ง {activeUnpaidCount} คน)
              </span>
            )}
          </p>
        </div>

        <div className="w-full md:w-72 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-600 font-semibold">
            <span>อัตราจัดเก็บสำเร็จ</span>
            <span className="text-teal-700">
              {activeMembers > 0 ? Math.round((currentPeriodPaidCount / activeMembers) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${activeMembers > 0 ? Math.min(100, Math.round((currentPeriodPaidCount / activeMembers) * 100)) : 0}%`
              }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => onSwitchTab('collections')}
          className="px-4 py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
        >
          <span>ดูรายชื่อค้างจ่าย & ตารางเก็บเงิน</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Village Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Village Distribution Visualizer (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>การกระจายตัวของสมาชิกรายหมู่บ้าน</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ตำบลวังกวาง (ม.1 ถึง ม.11) และพื้นที่เขตติดต่อ
                </p>
              </div>
              <button
                onClick={() => onSwitchTab('members')}
                className="text-xs text-teal-700 hover:underline font-semibold"
              >
                ดูทะเบียนทั้งหมด
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {villageCounts.map((v) => (
                <div
                  key={v.key}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition flex flex-col justify-between"
                >
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-semibold text-slate-800 text-xs truncate max-w-[170px]" title={v.fullName}>
                      {v.fullName}
                    </span>
                    <span className="font-bold text-teal-800 text-xs shrink-0">
                      {v.total} <span className="text-[10px] font-normal text-slate-500">คน</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>ปกติ {v.active} คน</span>
                      <span className="text-teal-700 font-medium">งวดนี้จ่าย {v.paid} คน</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 h-full rounded-full"
                        style={{ width: `${v.percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Collector Routes Summary (1 Col) */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>สายผู้รับผิดชอบจัดเก็บเงิน</span>
              </h3>
              <button
                onClick={() => onSwitchTab('collectors')}
                className="text-xs text-teal-700 hover:underline font-semibold"
              >
                ดูทั้งหมด
              </button>
            </div>

            {collectors.length === 0 ? (
              <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs">ยังไม่มีสายผู้เก็บเงินในระบบ</p>
                <button
                  onClick={() => onSwitchTab('collectors')}
                  className="mt-2 text-xs font-semibold text-teal-700 hover:underline inline-block"
                >
                  + เพิ่มสายผู้เก็บเงิน
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {collectors.slice(0, 5).map((col) => {
                  const assignedMembers = members.filter((m) => m.collector === col.name);
                  const assignedPaid = assignedMembers.filter(
                    (m) => m.status === 'ปกติ' && currentPeriodPaidMemberIds.has(m.id)
                  ).length;
                  return (
                    <div
                      key={col.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-slate-900 text-xs truncate">{col.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{col.village}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-teal-700 text-xs">{assignedPaid} / {assignedMembers.length}</span>
                        <span className="block text-[10px] text-slate-400">ส่งเงินแล้ว</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onSwitchTab('collectors')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition text-center"
            >
              ตรวจสอบทั้ง 6 สายเก็บเงิน
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">รายการความเคลื่อนไหวล่าสุด</h3>
            <p className="text-xs text-slate-500">บันทึกการรับชำระเงินและการจ่ายเงินสงเคราะห์</p>
          </div>
          <button
            onClick={() => onSwitchTab('collections')}
            className="text-xs text-teal-700 hover:underline font-semibold"
          >
            ดูประวัติทั้งหมด
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
              <tr>
                <th className="p-3 font-semibold">ประเภท</th>
                <th className="p-3 font-semibold">รายการ / สมาชิก</th>
                <th className="p-3 font-semibold">พื้นที่ / สายผู้เก็บ</th>
                <th className="p-3 font-semibold text-right">จำนวนเงิน</th>
                <th className="p-3 font-semibold">วันที่</th>
                <th className="p-3 font-semibold text-center">เอกสาร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    ยังไม่มีรายการบันทึก
                  </td>
                </tr>
              ) : (
                activities.map((act) => {
                  const isCollection = act.type === 'collection';
                  return (
                    <tr key={act.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isCollection
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {isCollection ? 'รับชำระ' : 'จ่ายสงเคราะห์'}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-900">
                        {act.person}
                        <span className="block text-[11px] text-slate-500 font-normal">{act.title}</span>
                      </td>
                      <td className="p-3 text-slate-600">{act.subtitle}</td>
                      <td className="p-3 text-right font-bold text-xs">
                        <span className={isCollection ? 'text-teal-700' : 'text-purple-700'}>
                          {isCollection ? '+' : '-'}
                          {formatCurrency(act.amount)} บาท
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{formatThaiDate(act.date)}</td>
                      <td className="p-3 text-center">
                        {isCollection ? (
                          <button
                            onClick={() => onViewReceipt(act.data as CollectionRecord)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-[11px] font-semibold transition"
                          >
                            ใบเสร็จ
                          </button>
                        ) : (
                          <button
                            onClick={() => onViewCertificate(act.data as DeceasedRecord)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-[11px] font-semibold transition"
                          >
                            ใบสำคัญ
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
