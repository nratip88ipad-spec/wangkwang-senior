import React from 'react';
import { Menu, HeartHandshake, Plus, Receipt, UserPlus } from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onOpenAddMember: () => void;
  onOpenAddPayment: () => void;
  currentTabName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  onOpenAddMember,
  onOpenAddPayment,
  currentTabName
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile menu button and Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="md:hidden w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                {currentTabName}
              </h1>
              <p className="hidden sm:block text-[11px] text-slate-500">
                ชมรมฌาปนกิจสงเคราะห์ผู้สูงอายุ ต.วังกวาง อ.น้ำหนาว จ.เพชรบูรณ์
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons in Top Bar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAddPayment}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold transition"
          >
            <Receipt className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">รับเงินด่วน</span>
            <span className="sm:hidden">รับเงิน</span>
          </button>

          <button
            onClick={onOpenAddMember}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition shadow-sm shadow-teal-700/20"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ สมาชิกใหม่</span>
            <span className="sm:hidden">+ สมาชิก</span>
          </button>
        </div>
      </div>
    </header>
  );
};
