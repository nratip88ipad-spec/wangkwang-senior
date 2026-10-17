import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Search,
  Filter,
  Layers,
  UserCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Member, CollectionRecord } from '../types';
import { periodList } from '../data/initialData';
import { formatThaiDate, formatCurrency, getTodayThaiDate, downloadCSV } from '../utils/thaiDate';

interface CollectionsTabProps {
  members: Member[];
  collections: CollectionRecord[];
  collectors: string[];
  currentPeriod: string;
  onSavePayment: (record: Omit<CollectionRecord, 'id'>) => void;
  onSaveBatchPayments: (records: Omit<CollectionRecord, 'id'>[]) => void;
  onViewReceipt: (record: CollectionRecord) => void;
  preSelectedMember?: Member | null;
  onClearPreSelectedMember?: () => void;
}

export const CollectionsTab: React.FC<CollectionsTabProps> = ({
  members,
  collections,
  collectors,
  currentPeriod,
  onSavePayment,
  onSaveBatchPayments,
  onViewReceipt,
  preSelectedMember,
  onClearPreSelectedMember
}) => {
  // Mode: 'single' vs 'batch'
  const [entryMode, setEntryMode] = useState<'single' | 'batch'>('single');

  // Single form states
  const [singleMemberId, setSingleMemberId] = useState(preSelectedMember ? preSelectedMember.id : '');
  const [singleCollector, setSingleCollector] = useState(
    preSelectedMember ? preSelectedMember.collector : collectors[0] || 'สายตัวแทนหมู่บ้าน'
  );
  const [singlePeriod, setSinglePeriod] = useState(currentPeriod);
  const [singleAmount, setSingleAmount] = useState(100);
  const [singleDate, setSingleDate] = useState(getTodayThaiDate());
  const [singleMethod, setSingleMethod] = useState<'เงินสด' | 'โอนเงิน'>('เงินสด');
  const [singleNote, setSingleNote] = useState('ค่าบำรุงประจำงวด');

  // Batch form states
  const [batchCollector, setBatchCollector] = useState(collectors[0] || 'สายตัวแทนหมู่บ้าน');
  const [batchPeriod, setBatchPeriod] = useState(currentPeriod);
  const [batchDate, setBatchDate] = useState(getTodayThaiDate());
  const [batchAmount, setBatchAmount] = useState(100);
  const [batchMethod, setBatchMethod] = useState<'เงินสด' | 'โอนเงิน'>('เงินสด');
  const [selectedBatchMemberIds, setSelectedBatchMemberIds] = useState<string[]>([]);

  // History filters
  const [historyPeriodFilter, setHistoryPeriodFilter] = useState('');
  const [historyCollectorFilter, setHistoryCollectorFilter] = useState('');
  const [historySearch, setHistorySearch] = useState('');

  // When preSelectedMember changes, update single form
  React.useEffect(() => {
    if (preSelectedMember) {
      setSingleMemberId(preSelectedMember.id);
      setSingleCollector(preSelectedMember.collector);
      setEntryMode('single');
    }
  }, [preSelectedMember]);

  // Handle member change in single form to update collector automatically
  const handleSingleMemberChange = (id: string) => {
    setSingleMemberId(id);
    const m = members.find((item) => item.id === id);
    if (m) {
      setSingleCollector(m.collector);
    }
  };

  // Submit Single Payment
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleMemberId) {
      alert('กรุณาเลือกสมาชิก');
      return;
    }
    const m = members.find((item) => item.id === singleMemberId);
    if (!m) return;

    onSavePayment({
      memberId: m.id,
      memberName: `${m.firstName} ${m.lastName}`,
      village: m.village,
      period: singlePeriod,
      amount: Number(singleAmount) || 100,
      collector: singleCollector,
      date: singleDate,
      note: singleNote.trim() || undefined,
      paymentMethod: singleMethod
    });

    if (onClearPreSelectedMember) {
      onClearPreSelectedMember();
    }
    // reset form
    setSingleMemberId('');
    setSingleNote('ค่าบำรุงประจำงวด');
  };

  // Batch selection calculation
  const batchRouteMembers = useMemo(() => {
    return members.filter((m) => m.collector === batchCollector && m.status === 'ปกติ');
  }, [members, batchCollector]);

  const batchPaidMemberIdsInPeriod = useMemo(() => {
    return new Set(
      collections
        .filter((c) => c.period === batchPeriod && c.collector === batchCollector)
        .map((c) => c.memberId)
    );
  }, [collections, batchPeriod, batchCollector]);

  const toggleBatchMember = (memberId: string) => {
    setSelectedBatchMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const selectAllUnpaidInBatch = () => {
    const unpaidIds = batchRouteMembers
      .filter((m) => !batchPaidMemberIdsInPeriod.has(m.id))
      .map((m) => m.id);
    setSelectedBatchMemberIds(unpaidIds);
  };

  const clearBatchSelection = () => {
    setSelectedBatchMemberIds([]);
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBatchMemberIds.length === 0) {
      alert('กรุณาเลือกสมาชิกอย่างน้อย 1 คนเพื่อบันทึก');
      return;
    }

    const newRecords: Omit<CollectionRecord, 'id'>[] = selectedBatchMemberIds.map((memId) => {
      const m = members.find((item) => item.id === memId)!;
      return {
        memberId: m.id,
        memberName: `${m.firstName} ${m.lastName}`,
        village: m.village,
        period: batchPeriod,
        amount: Number(batchAmount) || 100,
        collector: batchCollector,
        date: batchDate,
        note: `บันทึกรับเงินรอบสาย ${batchCollector}`,
        paymentMethod: batchMethod
      };
    });

    onSaveBatchPayments(newRecords);
    setSelectedBatchMemberIds([]);
  };

  // Filtered History
  const filteredCollections = useMemo(() => {
    return collections.filter((c) => {
      const query = historySearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        c.memberName.toLowerCase().includes(query) ||
        c.memberId.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query);
      const matchesPeriod = !historyPeriodFilter || c.period === historyPeriodFilter;
      const matchesCollector = !historyCollectorFilter || c.collector === historyCollectorFilter;
      return matchesSearch && matchesPeriod && matchesCollector;
    });
  }, [collections, historySearch, historyPeriodFilter, historyCollectorFilter]);

  const filteredTotal = filteredCollections.reduce((sum, c) => sum + Number(c.amount), 0);

  const handleExportCSV = () => {
    const headers = [
      'เลขที่ใบเสร็จ',
      'รหัสสมาชิก',
      'ชื่อสมาชิก',
      'หมู่บ้าน',
      'งวดประจำ',
      'จำนวนเงิน (บาท)',
      'สายผู้เก็บเงิน',
      'วันที่ชำระ',
      'ช่องทางชำระ',
      'หมายเหตุ'
    ];
    const rows = filteredCollections.map((c) => [
      c.id,
      c.memberId,
      c.memberName,
      c.village,
      c.period,
      c.amount,
      c.collector,
      c.date,
      c.paymentMethod || 'เงินสด',
      c.note || ''
    ]);
    downloadCSV(`รายงานการจัดเก็บเงิน_${historyPeriodFilter || 'ทั้งหมด'}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            <span>บันทึกการจัดเก็บเงิน & ออกใบเสร็จ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            บันทึกรับเงินสมทบ/ค่าบำรุงรายงวด งวดละ 100 บาทต่อคน
          </p>
        </div>

        {/* Tab switch between Single and Batch */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setEntryMode('single')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              entryMode === 'single'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>บันทึกรายคน</span>
          </button>
          <button
            onClick={() => setEntryMode('batch')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              entryMode === 'batch'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>บันทึกยกสาย (Batch Pay)</span>
          </button>
        </div>
      </div>

      {/* Entry Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Recording Form (Single or Batch) */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 h-fit">
          {entryMode === 'single' ? (
            /* SINGLE ENTRY FORM */
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  <span>บันทึกรับเงินรายคน</span>
                </h3>
                {preSelectedMember && (
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                    ระบุสมาชิกแล้ว
                  </span>
                )}
              </div>

              <form onSubmit={handleSingleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    เลือกสมาชิก <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={singleMemberId}
                    onChange={(e) => handleSingleMemberChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs font-semibold"
                  >
                    <option value="">-- ค้นหาและเลือกสมาชิก --</option>
                    {members
                      .filter((m) => m.status === 'ปกติ')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.id} - {m.firstName} {m.lastName} ({m.village} - {m.collector})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      งวดประจำเดือน/ปี <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={singlePeriod}
                      onChange={(e) => setSinglePeriod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs font-medium"
                    >
                      {periodList.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      ผู้เก็บเงิน/สายรับ <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={singleCollector}
                      onChange={(e) => setSingleCollector(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs font-medium"
                    >
                      {collectors.length === 0 ? (
                        <option value="สายตัวแทนหมู่บ้าน">สายตัวแทนหมู่บ้าน</option>
                      ) : (
                        collectors.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      จำนวนเงิน (บาท) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={singleAmount}
                      onChange={(e) => setSingleAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-teal-50/70 border border-teal-300 rounded-xl focus:outline-none focus:border-teal-600 font-bold text-teal-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      วันที่รับชำระ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={singleDate}
                      onChange={(e) => setSingleDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">ช่องทางชำระ</label>
                    <select
                      value={singleMethod}
                      onChange={(e) => setSingleMethod(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
                    >
                      <option value="เงินสด">เงินสด (Cash)</option>
                      <option value="โอนเงิน">โอนเงินเข้าบัญชี (Transfer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">หมายเหตุ</label>
                    <input
                      type="text"
                      value={singleNote}
                      onChange={(e) => setSingleNote(e.target.value)}
                      placeholder="เช่น ค่าบำรุงประจำปี"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition shadow-md shadow-teal-700/20 flex items-center justify-center space-x-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>บันทึกชำระ & ออกใบเสร็จ</span>
                </button>
              </form>
            </div>
          ) : (
            /* BATCH FAST ENTRY FORM */
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  <span>บันทึกรับเงินยกสาย (ตารางเร็ว)</span>
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                เลือกสายผู้รับผิดชอบ แล้วติ๊กเลือกสมาชิกที่ส่งเงินพร้อมกันได้ในคลิกเดียว
              </p>

              <form onSubmit={handleBatchSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">สายผู้เก็บเงิน</label>
                    <select
                      value={batchCollector}
                      onChange={(e) => {
                        setBatchCollector(e.target.value);
                        setSelectedBatchMemberIds([]);
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs font-semibold"
                    >
                      {collectors.length === 0 ? (
                        <option value="สายตัวแทนหมู่บ้าน">สายตัวแทนหมู่บ้าน</option>
                      ) : (
                        collectors.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">งวดประจำ</label>
                    <select
                      value={batchPeriod}
                      onChange={(e) => {
                        setBatchPeriod(e.target.value);
                        setSelectedBatchMemberIds([]);
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs font-semibold"
                    >
                      {periodList.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">วันที่รับเงิน</label>
                    <input
                      type="date"
                      value={batchDate}
                      onChange={(e) => setBatchDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">จำนวน/คน (บาท)</label>
                    <input
                      type="number"
                      value={batchAmount}
                      onChange={(e) => setBatchAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-teal-800"
                    />
                  </div>
                </div>

                {/* Member selection table */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1.5 text-[11px]">
                    <span className="font-semibold text-slate-700">
                      สมาชิกในสาย ({batchRouteMembers.length} คน):
                    </span>
                    <div className="space-x-1">
                      <button
                        type="button"
                        onClick={selectAllUnpaidInBatch}
                        className="text-teal-700 font-semibold hover:underline"
                      >
                        เลือกที่ยังไม่จ่าย
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={clearBatchSelection}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        ล้างเลือก
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                    {batchRouteMembers.length === 0 ? (
                      <p className="p-4 text-center text-slate-400">ไม่มีสมาชิกในสายนี้</p>
                    ) : (
                      batchRouteMembers.map((m) => {
                        const isPaid = batchPaidMemberIdsInPeriod.has(m.id);
                        const isChecked = selectedBatchMemberIds.includes(m.id);
                        return (
                          <label
                            key={m.id}
                            className={`p-2 flex items-center justify-between transition cursor-pointer text-xs ${
                              isPaid
                                ? 'bg-emerald-50/50 text-slate-400 opacity-80'
                                : isChecked
                                ? 'bg-teal-50 text-teal-900 font-medium'
                                : 'hover:bg-slate-100/60 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                disabled={isPaid}
                                checked={isChecked}
                                onChange={() => toggleBatchMember(m.id)}
                                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                              />
                              <div>
                                <span>{m.firstName} {m.lastName}</span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  {m.id} • {m.village}
                                </span>
                              </div>
                            </div>
                            {isPaid && (
                              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                จ่ายแล้ว
                              </span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs flex justify-between items-center">
                  <span>เลือก {selectedBatchMemberIds.length} รายการ</span>
                  <span className="font-bold text-teal-800 text-sm">
                    รวม {formatCurrency(selectedBatchMemberIds.length * batchAmount)} บาท
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={selectedBatchMemberIds.length === 0}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition shadow-md shadow-teal-700/20 flex items-center justify-center space-x-1.5"
                >
                  <Layers className="w-4 h-4" />
                  <span>บันทึกทั้ง {selectedBatchMemberIds.length} คนพร้อมกัน</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Collections History Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">ประวัติการรับชำระเงิน</h3>
                <p className="text-xs text-slate-500">
                  รวม {filteredCollections.length} รายการ ({formatCurrency(filteredTotal)} บาท)
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 self-end sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ส่งออก CSV</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="ค้นชื่อ, รหัส, ใบเสร็จ..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <select
                  value={historyPeriodFilter}
                  onChange={(e) => setHistoryPeriodFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">-- ทุกงวดประจำ --</option>
                  {periodList.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={historyCollectorFilter}
                  onChange={(e) => setHistoryCollectorFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">-- ทุกสายผู้เก็บเงิน --</option>
                  {collectors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="p-3">เลขที่ใบเสร็จ</th>
                      <th className="p-3">สมาชิก</th>
                      <th className="p-3">งวดประจำ</th>
                      <th className="p-3 text-right">จำนวนเงิน</th>
                      <th className="p-3">สายผู้รับ</th>
                      <th className="p-3">วันที่</th>
                      <th className="p-3 text-center">พิมพ์</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCollections.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          ไม่พบประวัติการรับชำระเงิน
                        </td>
                      </tr>
                    ) : (
                      filteredCollections.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-mono font-bold text-teal-800">{c.id}</td>
                          <td className="p-3 font-medium text-slate-900">
                            {c.memberName}
                            <span className="block text-[11px] text-slate-400 font-mono">
                              {c.memberId} • {c.village}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-700">{c.period}</td>
                          <td className="p-3 text-right font-bold text-teal-800">
                            {formatCurrency(c.amount)} บ.
                          </td>
                          <td className="p-3 text-slate-600">{c.collector}</td>
                          <td className="p-3 text-slate-400">{formatThaiDate(c.date)}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => onViewReceipt(c)}
                              className="px-2 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg text-[11px] font-semibold transition flex items-center justify-center space-x-1 mx-auto"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>ใบเสร็จ</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>แสดง {filteredCollections.length} รายการ</span>
            <span className="font-bold text-slate-700">
              ยอดเงินรวม: {formatCurrency(filteredTotal)} บาท
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
