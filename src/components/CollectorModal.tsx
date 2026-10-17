import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Save, ShieldCheck } from 'lucide-react';
import { CollectorRoute } from '../types';

import { villageList, villageNamesMap } from '../data/initialData';

interface CollectorModalProps {
  isOpen: boolean;
  collectorToEdit: CollectorRoute | null;
  onClose: () => void;
  onSave: (data: Omit<CollectorRoute, 'id'>, editId?: string) => void;
}

export const CollectorModal: React.FC<CollectorModalProps> = ({
  isOpen,
  collectorToEdit,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [phone, setPhone] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (collectorToEdit) {
      setName(collectorToEdit.name);
      setVillage(collectorToEdit.village);
      setLeaderName(collectorToEdit.leaderName);
      setPhone(collectorToEdit.phone);
      setDesc(collectorToEdit.desc);
    } else {
      setName('');
      setVillage('');
      setLeaderName('');
      setPhone('');
      setDesc('');
    }
  }, [collectorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !village.trim() || !leaderName.trim()) {
      alert('กรุณากรอกชื่อสาย, พื้นที่รับผิดชอบ และชื่อหัวหน้าสาย');
      return;
    }

    onSave(
      {
        name: name.trim(),
        village: village.trim(),
        leaderName: leaderName.trim(),
        phone: phone.trim() || 'ไม่ได้ระบุ',
        desc: desc.trim() || 'สายจัดเก็บเงินประจำพื้นที่'
      },
      collectorToEdit ? collectorToEdit.id : undefined
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              {collectorToEdit ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {collectorToEdit ? `แก้ไขสายผู้เก็บเงิน (${collectorToEdit.name})` : 'เพิ่มสายผู้เก็บเงินใหม่'}
              </h2>
              <p className="text-xs text-slate-500">
                ชมรมฌาปนกิจสงเคราะห์ผู้สูงอายุ ตำบลวังกวาง
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
        <form onSubmit={handleSubmit} className="py-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              ชื่อสายผู้เก็บเงิน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น สายพี่ประดับ, สายผู้ใหญ่ ม.3"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              หมู่บ้าน / พื้นที่รับผิดชอบ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              list="villageSuggestions"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="เลือกจาก 11 หมู่บ้าน หรือพิมพ์พื้นที่นอกเขตเองได้"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
            />
            <datalist id="villageSuggestions">
              {villageList.map((v) => (
                <option key={v} value={villageNamesMap[v] || v} />
              ))}
              <option value="นอกเขตพื้นที่" />
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ชื่อหัวหน้าสาย / ผู้เก็บเงิน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder="เช่น นายประดับ ศรีทอง"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08X-XXX-XXXX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">รายละเอียด / โซนพื้นที่</label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="เช่น ดูแลจัดเก็บเงินสมาชิกคุ้มกลาง และคุ้มเหนือ..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
            />
          </div>

          {collectorToEdit && (
            <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-800">
              * หากเปลี่ยนชื่อสาย ระบบจะอัปเดตชื่อสายในทะเบียนสมาชิกและประวัติการส่งเงินเดิมให้อัตโนมัติ
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-teal-700/20"
            >
              <Save className="w-4 h-4" />
              <span>{collectorToEdit ? 'บันทึกการแก้ไข' : 'เพิ่มสายผู้เก็บเงิน'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
