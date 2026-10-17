import React from 'react';
import { Menu, HeartHandshake, Receipt, UserPlus, LogIn, LogOut, Cloud, HardDrive } from 'lucide-react';
import { User } from '../lib/firebase';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onOpenAddMember: () => void;
  onOpenAddPayment: () => void;
  currentTabName: string;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isCloudConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  onOpenAddMember,
  onOpenAddPayment,
  currentTabName,
  user,
  onLogin,
  onLogout,
  isCloudConnected
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

        {/* Quick Actions & Cloud Auth Status */}
        <div className="flex items-center space-x-2.5">
          {/* Cloud Connection Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
            {isCloudConnected ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-teal-700">Cloud Sync (Firestore)</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                <span>Local Storage Mode</span>
              </>
            )}
          </div>

          {/* User Auth / Login */}
          {user ? (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
              <img
                src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={user.displayName || 'User'}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="hidden md:inline text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                {user.displayName || user.email}
              </span>
              <button
                onClick={onLogout}
                title="ออกจากระบบ"
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-red-600 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">เข้าสู่ระบบ Cloud (Google)</span>
              <span className="sm:hidden">เข้าสู่ระบบ</span>
            </button>
          )}

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
