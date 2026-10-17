import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { MembersTab } from './components/MembersTab';
import { CollectionsTab } from './components/CollectionsTab';
import { DeceasedTab } from './components/DeceasedTab';
import { CollectorsTab } from './components/CollectorsTab';
import { ReportsTab } from './components/ReportsTab';
import { MemberModal } from './components/MemberModal';
import { MemberDetailModal } from './components/MemberDetailModal';
import { DeceasedModal } from './components/DeceasedModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ClaimCertificateModal } from './components/ClaimCertificateModal';
import { CollectorModal } from './components/CollectorModal';
import {
  initialMembers,
  initialCollections,
  initialDeceased,
  initialCollectors,
  sampleMembers,
  sampleCollectors,
  periodList
} from './data/initialData';
import { Member, CollectionRecord, DeceasedRecord, CollectorRoute } from './types';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User } from './lib/firebase';

// One-time automatic wipe of legacy mock data so the user gets a clean slate
if (typeof window !== 'undefined' && localStorage.getItem('wk_clean_slate_v3') !== 'true') {
  try {
    localStorage.removeItem('wk_senior_members');
    localStorage.removeItem('wk_senior_collections');
    localStorage.removeItem('wk_senior_deceased');
    localStorage.removeItem('wk_senior_collectors');
    localStorage.setItem('wk_clean_slate_v3', 'true');
  } catch (e) {
    // ignore
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("User closed the login popup.");
        return;
      }
      console.error("Login error:", error);
      alert("ไม่สามารถเข้าสู่ระบบผ่าน Google ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Load state from localStorage or initial data
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('wk_senior_members');
      return saved ? JSON.parse(saved) : initialMembers;
    } catch {
      return initialMembers;
    }
  });

  const [collections, setCollections] = useState<CollectionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('wk_senior_collections');
      return saved ? JSON.parse(saved) : initialCollections;
    } catch {
      return initialCollections;
    }
  });

  const [deceased, setDeceased] = useState<DeceasedRecord[]>(() => {
    try {
      const saved = localStorage.getItem('wk_senior_deceased');
      return saved ? JSON.parse(saved) : initialDeceased;
    } catch {
      return initialDeceased;
    }
  });

  const [collectors, setCollectors] = useState<CollectorRoute[]>(() => {
    try {
      const saved = localStorage.getItem('wk_senior_collectors');
      return saved ? JSON.parse(saved) : initialCollectors;
    } catch {
      return initialCollectors;
    }
  });

  const [customVillages, setCustomVillages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wk_senior_custom_villages');
      return saved ? JSON.parse(saved) : ['นอกเขต'];
    } catch {
      return ['นอกเขต'];
    }
  });

  const handleAddCustomVillage = (villageName: string) => {
    if (!villageName) return;
    setCustomVillages((prev) => {
      if (prev.includes(villageName)) return prev;
      const updated = [...prev, villageName];
      localStorage.setItem('wk_senior_custom_villages', JSON.stringify(updated));
      return updated;
    });
  };

  const currentPeriod = 'ตุลาคม 2569';

  // UI state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [viewingMemberDetail, setViewingMemberDetail] = useState<Member | null>(null);

  const [isDeceasedModalOpen, setIsDeceasedModalOpen] = useState(false);

  const [viewingReceipt, setViewingReceipt] = useState<CollectionRecord | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<DeceasedRecord | null>(null);

  const [preSelectedMemberForPayment, setPreSelectedMemberForPayment] = useState<Member | null>(null);

  // Collector modal state
  const [isCollectorModalOpen, setIsCollectorModalOpen] = useState(false);
  const [editingCollector, setEditingCollector] = useState<CollectorRoute | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('wk_senior_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('wk_senior_collections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem('wk_senior_deceased', JSON.stringify(deceased));
  }, [deceased]);

  useEffect(() => {
    localStorage.setItem('wk_senior_collectors', JSON.stringify(collectors));
  }, [collectors]);

  // Statistics calculation
  const activeMembersCount = members.filter((m) => m.status === 'ปกติ').length;
  const currentPeriodPaidMemberIds = new Set(
    collections.filter((c) => c.period === currentPeriod).map((c) => c.memberId)
  );
  const unpaidCount = members.filter(
    (m) => m.status === 'ปกติ' && !currentPeriodPaidMemberIds.has(m.id)
  ).length;

  // Handlers for Members
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setIsMemberModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (data: Omit<Member, 'id'>, editId?: string) => {
    if (editId) {
      setMembers((prev) =>
        prev.map((m) => (m.id === editId ? { ...data, id: editId } : m))
      );
      if (viewingMemberDetail && viewingMemberDetail.id === editId) {
        setViewingMemberDetail({ ...data, id: editId });
      }
    } else {
      const maxNum = members.reduce((max, m) => {
        const match = m.id.match(/\d+/);
        return match ? Math.max(max, parseInt(match[0], 10)) : max;
      }, 0);
      const newId = `M${String(maxNum + 1).padStart(3, '0')}`;
      const newMember: Member = { ...data, id: newId };
      setMembers((prev) => [newMember, ...prev]);
    }
    setIsMemberModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลสมาชิกรหัส ${id}?`)) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      if (viewingMemberDetail && viewingMemberDetail.id === id) {
        setViewingMemberDetail(null);
      }
    }
  };

  // Handlers for Collections
  const handleOpenAddPayment = (member?: Member) => {
    if (member) {
      setPreSelectedMemberForPayment(member);
    }
    setCurrentTab('collections');
  };

  const handleSavePayment = (record: Omit<CollectionRecord, 'id'>) => {
    const year = new Date().getFullYear() + 543;
    const recId = `REC-${year}-${String(collections.length + 1).padStart(3, '0')}`;
    const newRecord: CollectionRecord = { ...record, id: recId };
    setCollections((prev) => [newRecord, ...prev]);
    setViewingReceipt(newRecord);
  };

  const handleSaveBatchPayments = (records: Omit<CollectionRecord, 'id'>[]) => {
    const year = new Date().getFullYear() + 543;
    let counter = collections.length + 1;
    const newRecords: CollectionRecord[] = records.map((r) => {
      const recId = `REC-${year}-${String(counter++).padStart(3, '0')}`;
      return { ...r, id: recId };
    });
    setCollections((prev) => [...newRecords, ...prev]);
    alert(`บันทึกรับเงินยกสายเรียบร้อยแล้วทั้งหมด ${newRecords.length} รายการ!`);
  };

  // Handlers for Deceased
  const handleOpenAddDeceased = () => {
    setIsDeceasedModalOpen(true);
  };

  const handleSaveDeceased = (record: Omit<DeceasedRecord, 'id'>) => {
    const decId = `DEC-${String(deceased.length + 1).padStart(3, '0')}`;
    const newRecord: DeceasedRecord = { ...record, id: decId };

    setMembers((prev) =>
      prev.map((m) => (m.id === record.memberId ? { ...m, status: 'เสียชีวิต' } : m))
    );

    setDeceased((prev) => [newRecord, ...prev]);
    setIsDeceasedModalOpen(false);
    setViewingCertificate(newRecord);
  };

  // Handlers for Collectors
  const handleOpenAddCollector = () => {
    setEditingCollector(null);
    setIsCollectorModalOpen(true);
  };

  const handleEditCollector = (col: CollectorRoute) => {
    setEditingCollector(col);
    setIsCollectorModalOpen(true);
  };

  const handleSaveCollector = (data: Omit<CollectorRoute, 'id'>, editId?: string) => {
    if (editId) {
      const oldCol = collectors.find((c) => c.id === editId);
      const oldName = oldCol?.name;
      const newName = data.name;

      setCollectors((prev) =>
        prev.map((c) => (c.id === editId ? { ...data, id: editId } : c))
      );

      // Cascade update collector name in members & collections if changed
      if (oldName && oldName !== newName) {
        setMembers((prev) =>
          prev.map((m) => (m.collector === oldName ? { ...m, collector: newName } : m))
        );
        setCollections((prev) =>
          prev.map((c) => (c.collector === oldName ? { ...c, collector: newName } : c))
        );
      }
    } else {
      const maxNum = collectors.reduce((max, c) => {
        const match = c.id.match(/\d+/);
        return match ? Math.max(max, parseInt(match[0], 10)) : max;
      }, 0);
      const newId = `COL-${String(maxNum + 1).padStart(2, '0')}`;
      const newCollector: CollectorRoute = { ...data, id: newId };
      setCollectors((prev) => [...prev, newCollector]);
    }
    setIsCollectorModalOpen(false);
  };

  const handleDeleteCollector = (id: string) => {
    const col = collectors.find((c) => c.id === id);
    if (!col) return;

    const assignedCount = members.filter((m) => m.collector === col.name).length;
    let confirmMsg = `คุณแน่ใจหรือไม่ว่าต้องการลบสาย "${col.name}"?`;
    if (assignedCount > 0) {
      confirmMsg += `\nคำเตือน: มีสมาชิกในสายนี้จำนวน ${assignedCount} คน คุณควรย้ายสมาชิกไปสายอื่นด้วย`;
    }
    if (window.confirm(confirmMsg)) {
      setCollectors((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleImportMembers = (newMembers: Member[]) => {
    setMembers((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const filtered = newMembers.filter((m) => !existingIds.has(m.id));
      return [...filtered, ...prev];
    });
  };

  const handleResetData = () => {
    setMembers([]);
    setCollections([]);
    setDeceased([]);
    setCollectors([]);
    localStorage.removeItem('wk_senior_members');
    localStorage.removeItem('wk_senior_collections');
    localStorage.removeItem('wk_senior_deceased');
    localStorage.removeItem('wk_senior_collectors');
    alert('ล้างข้อมูลทั้งหมดในระบบให้ว่างเปล่าเรียบร้อยแล้ว พร้อมเริ่มบันทึกข้อมูลจริง');
  };

  const handleLoadSampleData = () => {
    setMembers(sampleMembers);
    setCollections([]);
    setDeceased([]);
    setCollectors(sampleCollectors);
    alert('โหลดข้อมูลตัวอย่างสำหรับทดสอบเรียบร้อยแล้ว');
  };

  const handleRestoreData = (backup: {
    members: Member[];
    collections: CollectionRecord[];
    deceased: DeceasedRecord[];
    collectors?: CollectorRoute[];
  }) => {
    setMembers(backup.members);
    setCollections(backup.collections);
    setDeceased(backup.deceased);
    if (backup.collectors && Array.isArray(backup.collectors)) {
      setCollectors(backup.collectors);
    }
  };

  const collectorNames = collectors.map((c) => c.name);

  // Tab Titles map
  const tabTitles: Record<string, string> = {
    dashboard: 'แผงควบคุมการบริหารจัดการ',
    members: 'ทะเบียนสมาชิกชมรม',
    collections: 'บันทึกจัดเก็บเงิน & ออกใบเสร็จ',
    deceased: 'ผู้เสียชีวิต & จ่ายเงินสงเคราะห์',
    collectors: 'สายผู้รับผิดชอบเก็บเงินรายหมู่บ้าน',
    reports: 'รายงานการเงิน & ศูนย์สำรองข้อมูล'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeMemberCount={activeMembersCount}
        unpaidCount={unpaidCount}
        deceasedCount={deceased.length}
        collectorsCount={collectors.length}
        onResetData={handleResetData}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Navbar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenAddMember={handleOpenAddMember}
          onOpenAddPayment={() => handleOpenAddPayment()}
          currentTabName={tabTitles[currentTab] || 'ระบบฌาปนกิจผู้สูงอายุ'}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          isCloudConnected={!!user}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardTab
              members={members}
              collections={collections}
              deceased={deceased}
              collectors={collectors}
              onOpenAddMember={handleOpenAddMember}
              onOpenAddPayment={() => handleOpenAddPayment()}
              onOpenAddDeceased={handleOpenAddDeceased}
              onSwitchTab={setCurrentTab}
              onViewReceipt={(rec) => setViewingReceipt(rec)}
              onViewCertificate={(dec) => setViewingCertificate(dec)}
              currentPeriod={currentPeriod}
            />
          )}

          {currentTab === 'members' && (
            <MembersTab
              members={members}
              collectors={collectorNames}
              onOpenAddMember={handleOpenAddMember}
              onEditMember={handleEditMember}
              onDeleteMember={handleDeleteMember}
              onViewMemberDetail={(m) => setViewingMemberDetail(m)}
              onRecordPaymentForMember={(m) => handleOpenAddPayment(m)}
              onImportMembers={handleImportMembers}
            />
          )}

          {currentTab === 'collections' && (
            <CollectionsTab
              members={members}
              collections={collections}
              collectors={collectorNames}
              currentPeriod={currentPeriod}
              onSavePayment={handleSavePayment}
              onSaveBatchPayments={handleSaveBatchPayments}
              onViewReceipt={(rec) => setViewingReceipt(rec)}
              preSelectedMember={preSelectedMemberForPayment}
              onClearPreSelectedMember={() => setPreSelectedMemberForPayment(null)}
            />
          )}

          {currentTab === 'deceased' && (
            <DeceasedTab
              deceased={deceased}
              onOpenAddDeceased={handleOpenAddDeceased}
              onViewCertificate={(dec) => setViewingCertificate(dec)}
            />
          )}

          {currentTab === 'collectors' && (
            <CollectorsTab
              collectors={collectors}
              members={members}
              collections={collections}
              currentPeriod={currentPeriod}
              onSelectMember={(m) => setViewingMemberDetail(m)}
              onOpenBatchForCollector={(collectorName) => {
                setCurrentTab('collections');
              }}
              onOpenAddCollector={handleOpenAddCollector}
              onEditCollector={handleEditCollector}
              onDeleteCollector={handleDeleteCollector}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsTab
              members={members}
              collections={collections}
              deceased={deceased}
              collectors={collectors}
              onResetData={handleResetData}
              onLoadSampleData={handleLoadSampleData}
              onRestoreData={handleRestoreData}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Add / Edit Member Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        memberToEdit={editingMember}
        collectors={collectorNames}
        customVillages={customVillages}
        onAddCustomVillage={handleAddCustomVillage}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
      />

      {/* 2. Member Detail Profile & History Modal */}
      <MemberDetailModal
        member={viewingMemberDetail}
        payments={collections}
        onClose={() => setViewingMemberDetail(null)}
        onEdit={(m) => {
          setViewingMemberDetail(null);
          handleEditMember(m);
        }}
        onRecordPayment={(m) => {
          setViewingMemberDetail(null);
          handleOpenAddPayment(m);
        }}
        onViewReceipt={(rec) => setViewingReceipt(rec)}
      />

      {/* 3. Record Deceased Modal */}
      <DeceasedModal
        isOpen={isDeceasedModalOpen}
        members={members}
        onClose={() => setIsDeceasedModalOpen(false)}
        onSave={handleSaveDeceased}
      />

      {/* 4. Official Printable Receipt Modal */}
      <ReceiptModal
        record={viewingReceipt}
        onClose={() => setViewingReceipt(null)}
      />

      {/* 5. Official Bereavement Aid Certificate Modal */}
      <ClaimCertificateModal
        record={viewingCertificate}
        onClose={() => setViewingCertificate(null)}
      />

      {/* 6. Add / Edit Collector Route Modal */}
      <CollectorModal
        isOpen={isCollectorModalOpen}
        collectorToEdit={editingCollector}
        onClose={() => {
          setIsCollectorModalOpen(false);
          setEditingCollector(null);
        }}
        onSave={handleSaveCollector}
      />
    </div>
  );
}
