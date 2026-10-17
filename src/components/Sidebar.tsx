import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Receipt,
  HeartHandshake,
  ShieldAlert,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  MapPin,
  AlertTriangle,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  activeMemberCount: number;
  unpaidCount: number;
  deceasedCount: number;
  collectorsCount: number;
  onResetData: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeMemberCount,
  unpaidCount,
  deceasedCount,
  collectorsCount,
  onResetData,
  isOpenMobile,
  onCloseMobile
}) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const navItems = [
    {
      id: 'dashboard',
      label: 'แผงควบคุม (Dashboard)',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'members',
      label: 'ทะเบียนสมาชิก',
      icon: Users,
      badge: `${activeMemberCount} ปกติ`
    },
    {
      id: 'collections',
      label: 'บันทึกจัดเก็บเงิน & ใบเสร็จ',
      icon: Receipt,
      badge: unpaidCount > 0 ? `ค้าง ${unpaidCount}` : null,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'deceased',
      label: 'ผู้เสียชีวิต & จ่ายสงเคราะห์',
      icon: HeartHandshake,
      badge: `${deceasedCount} ราย`
    },
    {
      id: 'collectors',
      label: 'สายผู้รับผิดชอบเก็บเงิน',
      icon: ShieldAlert,
      badge: `${collectorsCount} สาย`
    },
    {
      id: 'reports',
      label: 'รายงานการเงิน & สำรองข้อมูล',
      icon: FileSpreadsheet,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } h-screen shadow-2xl border-r border-slate-800/80`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-950">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-teal-900/40 ring-2 ring-teal-400/30">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-base leading-snug tracking-tight">
                    ฌาปนกิจผู้สูงอายุ
                  </span>
                </div>
                <div className="flex items-center text-xs text-teal-400 font-medium">
                  <MapPin className="w-3 h-3 mr-1 shrink-0" />
                  <span className="truncate">ต.วังกวาง อ.น้ำหนาว</span>
                </div>
              </div>
            </div>
            <div className="mt-3 py-1 px-2.5 rounded-lg bg-teal-950/70 border border-teal-800/60 flex items-center justify-between text-[11px] text-teal-300">
              <span>งวดปัจจุบัน</span>
              <span className="font-semibold text-white">ต.ค. 2569</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
            <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              เมนูบริหารจัดการ
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-xs md:text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-950/40 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-teal-200' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`ml-2 px-2 py-0.5 text-[10px] rounded-full font-semibold shrink-0 ${
                        item.badgeColor || (isActive ? 'bg-teal-900 text-teal-200' : 'bg-slate-800 text-slate-300')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/70 space-y-3 shrink-0">
            <div className="flex items-center space-x-3 px-1">
              <div className="w-8 h-8 rounded-full bg-slate-800 ring-1 ring-slate-700 flex items-center justify-center text-teal-400 font-bold text-xs">
                WK
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">กองทุนฌาปนกิจชุมชน</p>
                <p className="text-[10px] text-teal-400 font-medium truncate">ตำบลวังกวาง อ.น้ำหนาว จ.เพชรบูรณ์</p>
              </div>
            </div>

            <button
              onClick={() => setShowResetModal(true)}
              className="w-full py-2 px-3 bg-slate-800/70 hover:bg-red-950/50 hover:text-red-300 hover:border-red-800/60 border border-slate-700/60 text-slate-400 text-xs rounded-xl transition flex items-center justify-center space-x-2"
              title="ล้างข้อมูลทั้งหมดในระบบให้ว่างเปล่า"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ล้างข้อมูลทั้งหมดให้ว่างเปล่า</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 text-red-400">
                <div className="p-2.5 bg-red-950/80 rounded-xl border border-red-800/60">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">ยืนยันการล้างข้อมูลทั้งหมด</h3>
              </div>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmText('');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              การดำเนินการนี้จะล้างข้อมูลสมาชิกและประวัติการจัดเก็บทั้งหมดในระบบให้ว่างเปล่าและไม่สามารถกู้คืนได้ทันที เว้นแต่จะมีไฟล์สำรองข้อมูล (Backup)
            </p>

            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-400 mb-2">
                กรุณาพิมพ์คำว่า <span className="text-red-400 font-bold">"ล้างข้อมูล"</span> เพื่อยืนยัน:
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="พิมพ์ว่า ล้างข้อมูล ที่นี่"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmText('');
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={resetConfirmText !== 'ล้างข้อมูล'}
                onClick={() => {
                  if (resetConfirmText === 'ล้างข้อมูล') {
                    onResetData();
                    setShowResetModal(false);
                    setResetConfirmText('');
                  }
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg ${
                  resetConfirmText === 'ล้างข้อมูล'
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                ยืนยันล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
