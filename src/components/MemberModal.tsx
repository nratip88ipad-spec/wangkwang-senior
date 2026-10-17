import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, UserCheck, ShieldAlert } from 'lucide-react';
import { Member, MemberStatus } from '../types';
import { villageList, villageNamesMap } from '../data/initialData';
import { getTodayThaiDate } from '../utils/thaiDate';

interface MemberModalProps {
  isOpen: boolean;
  memberToEdit: Member | null;
  collectors: string[];
  customVillages?: string[];
  onAddCustomVillage?: (villageName: string) => void;
  onClose: () => void;
  onSave: (memberData: Omit<Member, 'id'>, editId?: string) => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  memberToEdit,
  collectors,
  customVillages = [],
  onAddCustomVillage,
  onClose,
  onSave
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [village, setVillage] = useState('ม.1');
  const [isCustomVillage, setIsCustomVillage] = useState(false);
  const [customVillageText, setCustomVillageText] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [phone, setPhone] = useState('');
  const [collector, setCollector] = useState('สายตัวแทนหมู่บ้าน');
  const [age, setAge] = useState(65);
  const [regDate, setRegDate] = useState(getTodayThaiDate());
  const [status, setStatus] = useState<MemberStatus>('ปกติ');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryRelation, setBeneficiaryRelation] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (memberToEdit) {
      setFirstName(memberToEdit.firstName);
      setLastName(memberToEdit.lastName);
      setCitizenId(memberToEdit.citizenId || '');
      
      // Check if village is one of the standard ones
      const isStandard = villageList.includes(memberToEdit.village);
      if (isStandard) {
        setVillage(memberToEdit.village);
        setIsCustomVillage(false);
        setCustomVillageText('');
      } else {
        setVillage('NEW_OUTSIDE');
        setIsCustomVillage(true);
        setCustomVillageText(memberToEdit.village);
      }

      setHouseNo(memberToEdit.houseNo || '');
      setPhone(memberToEdit.phone || '');
      setCollector(memberToEdit.collector);
      setAge(memberToEdit.age);
      setRegDate(memberToEdit.regDate);
      setStatus(memberToEdit.status);
      setBeneficiaryName(memberToEdit.beneficiaryName || '');
      setBeneficiaryRelation(memberToEdit.beneficiaryRelation || '');
      setBeneficiaryPhone(memberToEdit.beneficiaryPhone || '');
      setNotes(memberToEdit.notes || '');
    } else {
      setFirstName('');
      setLastName('');
      setCitizenId('');
      setVillage('ม.1');
      setIsCustomVillage(false);
      setCustomVillageText('');
      setHouseNo('');
      setPhone('');
      setCollector(collectors[0] || 'สายตัวแทนหมู่บ้าน');
      setAge(65);
      setRegDate(getTodayThaiDate());
      setStatus('ปกติ');
      setBeneficiaryName('');
      setBeneficiaryRelation('');
      setBeneficiaryPhone('');
      setNotes('');
    }
  }, [memberToEdit, isOpen, collectors]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const finalVillage = isCustomVillage
      ? (customVillageText.trim() || 'นอกเขต')
      : village;

    if (isCustomVillage && customVillageText.trim() && onAddCustomVillage) {
      onAddCustomVillage(customVillageText.trim());
    }

    onSave(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        citizenId: citizenId.trim() || undefined,
        village: finalVillage,
        houseNo: houseNo.trim(),
        phone: phone.trim() || undefined,
        collector,
        age: Number(age) || 60,
        regDate,
        status,
        beneficiaryName: beneficiaryName.trim() || undefined,
        beneficiaryRelation: beneficiaryRelation.trim() || undefined,
        beneficiaryPhone: beneficiaryPhone.trim() || undefined,
        notes: notes.trim() || undefined
      },
      memberToEdit ? memberToEdit.id : undefined
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              {memberToEdit ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {memberToEdit ? `แก้ไขข้อมูลสมาชิก (${memberToEdit.id})` : 'เพิ่มสมาชิกใหม่'}
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {/* General info */}
          <div className="space-y-3">
            <p className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              ข้อมูลส่วนตัว
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ชื่อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="เช่น สมพร"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="เช่น ศรีทา"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">เลขประจำตัวประชาชน</label>
                <input
                  type="text"
                  value={citizenId}
                  onChange={(e) => setCitizenId(e.target.value)}
                  placeholder="13 หลัก เช่น 3-4001-..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">อายุ (ปี)</label>
                <input
                  type="number"
                  min="50"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Address & Assignment */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <p className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              ที่อยู่และสายการเก็บเงิน
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  หมู่บ้าน / พื้นที่ <span className="text-red-500">*</span>
                </label>
                <select
                  value={isCustomVillage ? 'NEW_OUTSIDE' : village}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'NEW_OUTSIDE') {
                      setIsCustomVillage(true);
                      setVillage('NEW_OUTSIDE');
                    } else {
                      setIsCustomVillage(false);
                      setVillage(val);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs font-medium"
                >
                  <optgroup label="11 หมู่บ้าน ตำบลวังกวาง">
                    {villageList.filter((v) => v !== 'นอกเขต').map((v) => (
                      <option key={v} value={v}>
                        {villageNamesMap[v] || v}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="พื้นที่นอกเขต">
                    <option value="นอกเขต">นอกเขต (ทั่วไป)</option>
                    {customVillages
                      .filter((cv) => cv !== 'นอกเขต' && !villageList.includes(cv))
                      .map((cv) => (
                        <option key={cv} value={cv}>
                          {cv}
                        </option>
                      ))}
                    <option value="NEW_OUTSIDE">+ ระบุพื้นที่นอกเขตใหม่ (พิมพ์เอง)...</option>
                  </optgroup>
                </select>

                {isCustomVillage && (
                  <div className="pt-2">
                    <input
                      type="text"
                      required={isCustomVillage}
                      value={customVillageText}
                      onChange={(e) => setCustomVillageText(e.target.value)}
                      placeholder="พิมพ์ชื่อพื้นที่นอกเขต เช่น นอกเขต (เขตติดต่อ), นอกเขต (ภูกระดึง)"
                      className="w-full px-3 py-2 bg-amber-50/70 border border-amber-300 rounded-xl focus:outline-none focus:border-teal-600 text-xs font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <p className="text-[10px] text-amber-700 mt-1">
                      * ระบบจะเพิ่มชื่อพื้นที่นี้ลงในระบบโดยอัตโนมัติ
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">บ้านเลขที่</label>
                <input
                  type="text"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="เช่น 12/1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  สายผู้รับผิดชอบเก็บเงิน <span className="text-red-500">*</span>
                </label>
                <select
                  value={collector}
                  onChange={(e) => setCollector(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs font-medium"
                >
                  {collectors.length === 0 ? (
                    <option value="สายตัวแทนหมู่บ้าน">สายตัวแทนหมู่บ้าน (ค่าเริ่มต้น)</option>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">วันที่สมัครสมาชิก</label>
                <input
                  type="date"
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  สถานะสมาชิก <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MemberStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs font-semibold"
                >
                  <option value="ปกติ">ปกติ (Active)</option>
                  <option value="ค้างชำระ">ค้างชำระ (Pending)</option>
                  <option value="เสียชีวิต">เสียชีวิต (Deceased)</option>
                  <option value="ลาออก">ลาออก (Resigned)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Beneficiary Info */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <p className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              ผู้รับประโยชน์ / ทายาทตามระเบียบ
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">ชื่อผู้รับประโยชน์</label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="ชื่อ - นามสกุล ผู้รับเงิน"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">ความสัมพันธ์</label>
                <input
                  type="text"
                  value={beneficiaryRelation}
                  onChange={(e) => setBeneficiaryRelation(e.target.value)}
                  placeholder="เช่น ภรรยา, บุตร, สามี"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ผู้รับประโยชน์</label>
              <input
                type="text"
                value={beneficiaryPhone}
                onChange={(e) => setBeneficiaryPhone(e.target.value)}
                placeholder="08X-XXX-XXXX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="บันทึกรายละเอียดเพิ่มเติม..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-xs"
              />
            </div>
          </div>

          {/* Submit Buttons */}
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-teal-700/20"
            >
              <Save className="w-4 h-4" />
              <span>{memberToEdit ? 'บันทึกการแก้ไข' : 'เพิ่มสมาชิก'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
