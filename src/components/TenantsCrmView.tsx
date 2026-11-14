import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  MessageSquare,
  X,
  AlertCircle,
  CheckSquare,
  FileText,
  Sparkles,
  Loader2,
  Camera,
  Upload,
} from 'lucide-react';
import { useAqar } from '../context/AqarContext';
import { OcrExtractedData, Tenant, TenantOnboardingChecklist } from '../types/aqar';
import { formatDateTime, formatSar } from '../utils/formatters';
import { PrintViewButton } from './PrintViewButton';
import { readFileAsDataUrl, runGeminiOcrExtraction } from '../utils/ocrClient';
import { CameraDocumentScannerModal } from './CameraDocumentScannerModal';
import { ProcessedScanResult } from '../utils/documentScanProcessor';

const TEMPLATES: Record<string, Record<'ar' | 'en' | 'bn', string>> = {
  'تذكير الإيجار': {
    ar: 'السلام عليكم، نود تذكيركم بموعد استحقاق دفعة الإيجار القادمة. نشكركم على تعاونكم.',
    en: 'Dear tenant, this is a friendly reminder regarding your upcoming rent installment due date.',
    bn: 'আসসালামু আলাইকুম, আপনার আসন্ন ভাড়ার কিস্তি পরিশোধের তারিখ সম্পর্কে স্মরণ করিয়ে দেওয়া হচ্ছে।',
  },
  'طلب سداد المتأخرات': {
    ar: 'نرجو المبادرة بسداد المبالغ المتأخرة المستحقة على عقد الإيجار لتجنب الإجراءات النظامية.',
    en: 'Please settle the overdue rent balance on your lease contract at your earliest convenience.',
    bn: 'আপনার বকেয়া ভাড়া দ্রুত পরিশোধ করার জন্য অনুরোধ করা হচ্ছে।',
  },
  'تحديد موعد صيانة': {
    ar: 'تم تحديد موعد زيارة فني الصيانة للوحدة، نرجو تأكيد تواجدكم.',
    en: 'A maintenance technician visit has been scheduled for your unit. Please confirm availability.',
    bn: 'আপনার ইউনিটের মেরামতের জন্য টেকনিশিয়ান পরিদর্শনের সময় নির্ধারণ করা হয়েছে।',
  },
};

export function TenantsCrmView() {
  const { state, currentUser, lang, hasPermission, mutate, pushToast } = useAqar();
  const [tab, setTab] = useState<'tenants' | 'leads'>('tenants');
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [isTenantOcrBusy, setIsTenantOcrBusy] = useState(false);
  const [showTenantCamera, setShowTenantCamera] = useState(false);
  const [scannedTenantDoc, setScannedTenantDoc] = useState<{
    dataUrl: string;
    mimeType: string;
    fileName: string;
    sizeKb: number;
    extracted: OcrExtractedData;
  } | null>(null);

  const [tenantForm, setTenantForm] = useState({
    nameAr: '',
    nameEn: '',
    nationalIdOrIqama: '',
    nationality: 'سعودي',
    phone: '',
    email: '',
    employer: '',
    classification: 'محتمل' as Tenant['classification'],
    notes: '',
  });

  const [leadForm, setLeadForm] = useState({
    nameAr: '',
    phone: '',
    source: 'منصة عقار',
    propertyId: '',
    unitId: '',
    offeredRent: 42000,
    viewingDate: '2026-11-18',
    notes: '',
  });

  const [commForm, setCommForm] = useState({
    channel: 'رسالة نصية / واتساب' as 'اتصال هاتفي' | 'رسالة نصية / واتساب' | 'بريد إلكتروني' | 'ملاحظة داخلية',
    templateUsed: 'تذكير الإيجار',
    language: 'ar' as 'ar' | 'en' | 'bn',
    summary: TEMPLATES['تذكير الإيجار'].ar,
  });

  const duplicateIdWarning = useMemo(() => {
    if (!state || !tenantForm.nationalIdOrIqama.trim()) return null;
    return state.tenants.find(
      (t) => t.nationalIdOrIqama.trim() === tenantForm.nationalIdOrIqama.trim()
    );
  }, [state, tenantForm.nationalIdOrIqama]);

  const filteredTenants = useMemo(() => {
    if (!state) return [];
    const q = search.trim().toLowerCase();
    return state.tenants.filter(
      (t) =>
        !q ||
        t.nameAr.toLowerCase().includes(q) ||
        t.nationalIdOrIqama.includes(q) ||
        t.phone.includes(q)
    );
  }, [state, search]);

  if (!state) return null;

  const activeTenant = selectedTenant ? state.tenants.find((t) => t.id === selectedTenant.id) || null : null;

  const handleProcessTenantIdOcr = async (
    dataUrl: string,
    mimeType: string,
    fileName: string,
    sizeKb: number,
    targetTenantId?: string
  ) => {
    setIsTenantOcrBusy(true);
    try {
      const res = await runGeminiOcrExtraction({
        userId: currentUser?.id || 'usr-gm',
        dataUrl,
        mimeType,
        fileName,
        categoryHint: 'هويات وإقامات',
        autoSync: Boolean(targetTenantId),
        targetTenantId,
        applyProperty: false,
        createMissing: false,
      });
      const ext = res.extracted;

      if (targetTenantId) {
        await mutate('POST', '/api/documents', {
          title: [ext.docType, ext.tenantNameAr || fileName].filter(Boolean).join(' - '),
          category: ext.docType === 'عقد إيجار' ? 'عقود إيجار' : 'هويات وإقامات',
          fileName,
          fileType: mimeType.includes('pdf') ? 'PDF' : 'JPG',
          fileSizeKb: sizeKb,
          relatedType: 'مستأجر',
          relatedId: targetTenantId,
          expiryDate: ext.expiryDate || ext.endDate || undefined,
          version: 1,
          dataUrl,
          ocrStatus: 'تم الاستخراج آلياً',
          ocrRawText: res.rawText,
          ocrExtracted: ext,
          accessLog: [],
        });
        pushToast('success', lang === 'ar' ? 'تم استخراج البيانات من المستند وتحديث ملف المستأجر وأرشفته آلياً' : 'Tenant updated from Gemini OCR');
      } else {
        setScannedTenantDoc({ dataUrl, mimeType, fileName, sizeKb, extracted: ext });
        setTenantForm((prev) => ({
          ...prev,
          nameAr: ext.tenantNameAr || prev.nameAr,
          nameEn: ext.tenantNameEn || prev.nameEn,
          nationalIdOrIqama: ext.nationalIdOrIqama || prev.nationalIdOrIqama,
          nationality: ext.nationality || prev.nationality,
          phone: ext.phone || prev.phone,
          email: ext.email || prev.email,
          employer: ext.employer || prev.employer,
          notes:
            prev.notes ||
            [
              ext.docType ? `مستخرج آلياً من ${ext.docType}` : '',
              ext.expiryDate ? `تاريخ الانتهاء: ${ext.expiryDate}` : '',
            ]
              .filter(Boolean)
              .join(' · '),
        }));
        pushToast('success', lang === 'ar' ? 'تم استخراج بيانات المستأجر من المستند وتعبئة الحقول تلقائياً' : 'Tenant fields auto-filled from OCR');
      }
    } catch (err) {
      pushToast('error', (err as Error).message);
    } finally {
      setIsTenantOcrBusy(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await mutate<{ tenant?: Tenant }>(
      'POST',
      '/api/tenants',
      {
        ...tenantForm,
        rating: 4,
        onboardingChecklist: scannedTenantDoc
          ? {
              idVerified: Boolean(tenantForm.nationalIdOrIqama),
              docsArchived: true,
              depositPaid: false,
              contractSigned: scannedTenantDoc.extracted.docType === 'عقد إيجار',
              ejarRegistered: Boolean(scannedTenantDoc.extracted.ejarNumber),
              handoverSigned: false,
            }
          : undefined,
      },
      { offlineDescAr: `تسجيل مستأجر ${tenantForm.nameAr}` }
    );
    if (res) {
      if (scannedTenantDoc && res.tenant) {
        await mutate('POST', '/api/documents', {
          title: [scannedTenantDoc.extracted.docType, res.tenant.nameAr].filter(Boolean).join(' - '),
          category: scannedTenantDoc.extracted.docType === 'عقد إيجار' ? 'عقود إيجار' : 'هويات وإقامات',
          fileName: scannedTenantDoc.fileName,
          fileType: scannedTenantDoc.mimeType.includes('pdf') ? 'PDF' : 'JPG',
          fileSizeKb: scannedTenantDoc.sizeKb,
          relatedType: 'مستأجر',
          relatedId: res.tenant.id,
          expiryDate: scannedTenantDoc.extracted.expiryDate || scannedTenantDoc.extracted.endDate || undefined,
          version: 1,
          dataUrl: scannedTenantDoc.dataUrl,
          ocrStatus: 'تم الاستخراج آلياً',
          ocrRawText: scannedTenantDoc.extracted.rawText,
          ocrExtracted: scannedTenantDoc.extracted,
          accessLog: [],
        });
      }
      pushToast('success', lang === 'ar' ? 'تم تسجيل ملف المستأجر وأرشفة مستنداته بنجاح' : 'Tenant registered');
      setShowAddTenant(false);
      setScannedTenantDoc(null);
      setTenantForm({
        nameAr: '',
        nameEn: '',
        nationalIdOrIqama: '',
        nationality: 'سعودي',
        phone: '',
        email: '',
        employer: '',
        classification: 'محتمل',
        notes: '',
      });
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    const res = await mutate('DELETE', `/api/tenants/${tenantId}`);
    if (res) {
      pushToast('success', lang === 'ar' ? 'تم حذف الملف' : 'Tenant deleted');
      setSelectedTenant(null);
    }
  };

  const handleSendComm = async (tenant: Tenant) => {
    if (!commForm.summary.trim()) return;
    const res = await mutate(
      'POST',
      '/api/communications',
      {
        targetType: 'مستأجر',
        targetId: tenant.id,
        targetName: tenant.nameAr,
        ...commForm,
      },
      { offlineDescAr: `تواصل مع ${tenant.nameAr}` }
    );
    if (res) {
      pushToast('success', lang === 'ar' ? 'تم توثيق المراسلة في سجل التواصل الموحد' : 'Communication logged');
    }
  };

  const handleToggleOnboarding = async (tenant: Tenant, key: keyof TenantOnboardingChecklist) => {
    const current: TenantOnboardingChecklist = tenant.onboardingChecklist || {
      idVerified: false,
      docsArchived: false,
      depositPaid: false,
      contractSigned: false,
      ejarRegistered: false,
      handoverSigned: false,
    };
    const next = { ...current, [key]: !current[key] };
    await mutate('PATCH', `/api/tenants/${tenant.id}/checklist`, next);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const unitId = leadForm.unitId || state.units[0]?.id;
    const unit = state.units.find((u) => u.id === unitId);
    const res = await mutate(
      'POST',
      '/api/leads',
      {
        ...leadForm,
        unitId,
        propertyId: unit?.propertyId || state.properties[0]?.id,
        status: 'جديد',
        assignedTo: 'usr-lease',
      },
      { offlineDescAr: `تسجيل عميل محتمل ${leadForm.nameAr}` }
    );
    if (res) {
      pushToast('success', lang === 'ar' ? 'تم تسجيل العميل المحتمل' : 'Lead created');
      setShowAddLead(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-white/[0.06]">
          <button
            onClick={() => setTab('tenants')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              tab === 'tenants' ? 'bg-white dark:bg-[#26478D] text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {lang === 'ar' ? `ملفات المستأجرين (${state.tenants.length})` : `Tenants (${state.tenants.length})`}
          </button>
          <button
            onClick={() => setTab('leads')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              tab === 'leads' ? 'bg-white dark:bg-[#26478D] text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {lang === 'ar' ? `العملاء المحتملون والمعاينات (${state.leads.length})` : `Leads & Viewings (${state.leads.length})`}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PrintViewButton />
          {hasPermission('manage_tenants') && tab === 'tenants' && (
            <button
              onClick={() => setShowAddTenant(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#26478D] text-white hover:bg-[#1e3a75] cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تسجيل مستأجر جديد' : 'Add Tenant'}</span>
            </button>
          )}
          {hasPermission('manage_contracts') && tab === 'leads' && (
            <button
              onClick={() => setShowAddLead(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#26478D] text-white hover:bg-[#1e3a75] cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تسجيل استفسار / معاينة' : 'Add Lead'}</span>
            </button>
          )}
        </div>
      </div>

      {tab === 'tenants' ? (
        <>
          <div className="relative max-w-md no-print">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث بالاسم، الهوية/الإقامة، الجوال...' : 'Search name, ID, phone...'}
              className="w-full ps-9 pe-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 glass-surface focus:outline-none focus:ring-2 focus:ring-[#26478D]"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 glass-surface overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'المستأجر' : 'Tenant'}</th>
                  <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'الهوية / الإقامة' : 'National ID'}</th>
                  <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'الجوال' : 'Phone'}</th>
                  <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'التصنيف' : 'Type'}</th>
                  <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'المدفوع / المتبقي' : 'Paid / Balance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredTenants.map((t) => {
                  const paid = state.payments
                    .filter((p) => p.tenantId === t.id && p.status === 'معتمد')
                    .reduce((s, p) => s + p.amount, 0);
                  const balance = state.installments
                    .filter((i) => i.tenantId === t.id && i.status !== 'ملغاة')
                    .reduce((s, i) => s + i.remainingAmount, 0);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTenant(t)}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{t.nameAr}</div>
                        <div className="text-[11px] text-slate-500">{t.employer || t.nationality}</div>
                      </td>
                      <td className="py-3 px-4 font-mono-num">{t.nationalIdOrIqama}</td>
                      <td className="py-3 px-4 font-mono-num">{t.phone}</td>
                      <td className="py-3 px-4 font-medium">{t.classification}</td>
                      <td className="py-3 px-4 font-mono-num">
                        <span className="text-emerald-600 dark:text-emerald-400">{formatSar(paid, lang)}</span>
                        {' · '}
                        <span className={balance > 0 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400'}>
                          {formatSar(balance, lang)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.leads.map((lead) => {
            const unit = state.units.find((u) => u.id === lead.unitId);
            const prop = state.properties.find((p) => p.id === lead.propertyId);
            return (
              <div key={lead.id} className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 glass-surface space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold">{lead.nameAr}</div>
                    <div className="text-xs text-slate-500 font-mono-num mt-0.5">
                      {lead.phone} · {lead.source}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#26478D] dark:text-blue-400">{lead.status}</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {prop?.nameAr} · {unit?.unitNumber} · عرض <span className="font-mono-num font-semibold">{formatSar(lead.offeredRent, lang)}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  موعد المعاينة: <span className="font-mono-num">{lead.viewingDate}</span> {lead.viewingResult ? `· ${lead.viewingResult}` : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tenant Unified Dossier Drawer */}
      {activeTenant && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-[#13192B] h-full overflow-y-auto p-6 space-y-6 border-s border-slate-200 dark:border-white/10 shadow-2xl">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {activeTenant.classification} · {activeTenant.nationality} · هوية{' '}
                  <span className="font-mono-num">{activeTenant.nationalIdOrIqama}</span>
                </div>
                <h3 className="text-xl font-bold mt-0.5">{activeTenant.nameAr}</h3>
                <div className="text-xs text-slate-500 font-mono-num mt-1">
                  {activeTenant.phone} · {activeTenant.email}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasPermission('manage_tenants') && (
                  <button
                    onClick={() => handleDeleteTenant(activeTenant.id)}
                    title={lang === 'ar' ? 'حذف الملف (ممنوع عند وجود معاملات مالية)' : 'Delete Tenant'}
                    className="p-2 rounded-lg border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setSelectedTenant(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Linked Contracts */}
            <div className="space-y-2">
              <div className="text-xs font-semibold">{lang === 'ar' ? 'العقود والوحدات المرتبطة' : 'Contracts & Units'}</div>
              {state.contracts.filter((c) => c.tenantId === activeTenant.id).length === 0 ? (
                <div className="text-xs text-slate-500 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                  لا توجد عقود رسمية مسجلة لهذا العميل بعد.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                  {state.contracts
                    .filter((c) => c.tenantId === activeTenant.id)
                    .map((c) => {
                      const unit = state.units.find((u) => u.id === c.unitId);
                      return (
                        <div key={c.id} className="p-3 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold font-mono-num">
                              {c.internalNumber} · وحدة {unit?.unitNumber}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              إيجار: {c.ejarNumber || 'غير موثق'} · {c.startDate} ← {c.endDate}
                            </div>
                          </div>
                          <div className="text-end font-mono-num">
                            <div className="font-bold">{formatSar(c.annualRent, lang)}</div>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">{c.lifecycleStatus}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Tenant Onboarding Policy Checklist */}
            {(() => {
              const chk = activeTenant.onboardingChecklist || {
                idVerified: false,
                docsArchived: false,
                depositPaid: false,
                contractSigned: false,
                ejarRegistered: false,
                handoverSigned: false,
              };
              const steps: { key: keyof TenantOnboardingChecklist; label: string }[] = [
                { key: 'idVerified', label: 'التحقق من الهوية / الإقامة' },
                { key: 'docsArchived', label: 'أرشفة المستندات ومسحها OCR' },
                { key: 'depositPaid', label: 'سداد التأمين ورسوم المكتب' },
                { key: 'contractSigned', label: 'توقيع العقد وجدول الدفعات' },
                { key: 'ejarRegistered', label: 'التوثيق في منصة إيجار' },
                { key: 'handoverSigned', label: 'توقيع محضر استلام الوحدة' },
              ];
              const doneCount = Object.values(chk).filter(Boolean).length;
              return (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-[#26478D] dark:text-blue-400" />
                      <span>قائمة سياسة وإجراءات التسكين</span>
                    </span>
                    <span className="font-mono-num text-emerald-600 dark:text-emerald-400">{doneCount} / 6</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {steps.map((s) => (
                      <label
                        key={s.key}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200/70 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                      >
                        <input
                          type="checkbox"
                          checked={chk[s.key]}
                          disabled={!hasPermission('manage_tenants')}
                          onChange={() => handleToggleOnboarding(activeTenant, s.key)}
                          className="accent-emerald-600 cursor-pointer"
                        />
                        <span className={chk[s.key] ? 'line-through text-slate-400' : ''}>{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Linked Archived Documents + Direct ID/Contract OCR Sync */}
            {(() => {
              const tenantDocs = state.documents.filter(
                (d) =>
                  d.relatedId === activeTenant.id ||
                  d.ocrExtracted?.nationalIdOrIqama === activeTenant.nationalIdOrIqama
              );
              return (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#26478D] dark:text-blue-400" />
                      <span>المستندات المؤرشفة المرتبطة ({tenantDocs.length})</span>
                    </div>
                    {hasPermission('manage_documents') && (
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer">
                        {isTenantOcrBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        <span>{lang === 'ar' ? 'مسح هوية / عقد لتحديث البيانات (OCR)' : 'Scan ID/Contract (OCR)'}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          disabled={isTenantOcrBusy}
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const url = await readFileAsDataUrl(f);
                            await handleProcessTenantIdOcr(
                              url,
                              f.type || 'image/jpeg',
                              f.name,
                              Math.max(1, Math.round(f.size / 1024)),
                              activeTenant.id
                            );
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {tenantDocs.length > 0 && (
                    <div className="divide-y divide-slate-100 dark:divide-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                    {tenantDocs.map((d) => (
                      <div key={d.id} className="p-2.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold">{d.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono-num">{d.category} · {d.fileName}</div>
                        </div>
                        {d.expiryDate && (
                          <span className="text-[11px] font-mono-num text-amber-600 dark:text-amber-400">
                            ينتهي: {d.expiryDate}
                          </span>
                        )}
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Multilingual Communication Center inside Tenant Dossier */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-3">
              <div className="text-xs font-semibold flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#26478D] dark:text-blue-400" />
                <span>{lang === 'ar' ? 'تسجيل تواصل وإرسال قالب رسالة (عربي / إنجليزي / بنغالي)' : 'Log Communication & Multilingual Templates'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <select
                  value={commForm.channel}
                  onChange={(e) => setCommForm({ ...commForm, channel: e.target.value as typeof commForm.channel })}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0E1A]"
                >
                  <option value="رسالة نصية / واتساب">رسالة / واتساب</option>
                  <option value="اتصال هاتفي">اتصال هاتفي</option>
                  <option value="بريد إلكتروني">بريد إلكتروني</option>
                  <option value="ملاحظة داخلية">ملاحظة داخلية</option>
                </select>
                <select
                  value={commForm.templateUsed}
                  onChange={(e) => {
                    const tpl = e.target.value;
                    setCommForm({
                      ...commForm,
                      templateUsed: tpl,
                      summary: TEMPLATES[tpl]?.[commForm.language] || commForm.summary,
                    });
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0E1A]"
                >
                  {Object.keys(TEMPLATES).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                <select
                  value={commForm.language}
                  onChange={(e) => {
                    const l = e.target.value as 'ar' | 'en' | 'bn';
                    setCommForm({
                      ...commForm,
                      language: l,
                      summary: TEMPLATES[commForm.templateUsed]?.[l] || commForm.summary,
                    });
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0E1A]"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                  <option value="bn">বাংলা (Bengali)</option>
                </select>
              </div>
              <textarea
                rows={2}
                value={commForm.summary}
                onChange={(e) => setCommForm({ ...commForm, summary: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-transparent"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => handleSendComm(activeTenant)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#26478D] text-white hover:bg-[#1e3a75] cursor-pointer"
                >
                  {lang === 'ar' ? 'حفظ في سجل التواصل' : 'Log Communication'}
                </button>
              </div>

              {/* Previous Communication Logs */}
              <div className="divide-y divide-slate-100 dark:divide-white/5 pt-2">
                {state.communications
                  .filter((c) => c.targetId === activeTenant.id)
                  .map((c) => (
                    <div key={c.id} className="py-2 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          {c.channel} · {c.templateUsed || 'مباشر'} ({c.language.toUpperCase()})
                        </span>
                        <span className="font-mono-num">{formatDateTime(c.createdAt, lang)}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200">{c.summary}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Tenant Modal with Duplicate ID Detection + Gemini OCR Auto-Fill */}
      {showAddTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateTenant}
            className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13192B] p-6 space-y-4 my-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{lang === 'ar' ? 'تسجيل ملف مستأجر جديد' : 'New Tenant Profile'}</h3>
              <button type="button" onClick={() => setShowAddTenant(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gemini OCR Auto-Fill Strip from ID Card or Lease Contract */}
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تعبئة تلقائية من صورة الهوية / العقد (Gemini OCR)' : 'Auto-Fill from ID / Contract (OCR)'}</span>
                </span>
                {isTenantOcrBusy && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'رفع صورة هوية / عقد إيجار' : 'Upload ID / Lease'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    disabled={isTenantOcrBusy}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await readFileAsDataUrl(f);
                      await handleProcessTenantIdOcr(
                        url,
                        f.type || 'image/jpeg',
                        f.name,
                        Math.max(1, Math.round(f.size / 1024))
                      );
                    }}
                  />
                </label>
                <button
                  type="button"
                  disabled={isTenantOcrBusy}
                  onClick={() => setShowTenantCamera(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-white/80 dark:bg-white/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'التقاط بالكاميرا' : 'Scan Camera'}</span>
                </button>
                {scannedTenantDoc && (
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                    ✓ تم استخراج: {scannedTenantDoc.fileName}
                  </span>
                )}
              </div>
            </div>

            {duplicateIdWarning && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  تنبيه تكرار: رقم الهوية/الإقامة مسجل مسبقاً باسم <strong>{duplicateIdWarning.nameAr}</strong>
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <input
                required
                placeholder="الاسم الكامل بالعربية"
                value={tenantForm.nameAr}
                onChange={(e) => setTenantForm({ ...tenantForm, nameAr: e.target.value })}
                className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent"
              />
              <input
                required
                placeholder="رقم الهوية الوطنية أو الإقامة"
                value={tenantForm.nationalIdOrIqama}
                onChange={(e) => setTenantForm({ ...tenantForm, nationalIdOrIqama: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent font-mono-num"
              />
              <input
                placeholder="الجنسية"
                value={tenantForm.nationality}
                onChange={(e) => setTenantForm({ ...tenantForm, nationality: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent"
              />
              <input
                required
                placeholder="رقم الجوال (05XXXXXXXX)"
                value={tenantForm.phone}
                onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent font-mono-num"
              />
              <input
                placeholder="البريد الإلكتروني"
                value={tenantForm.email}
                onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent"
              />
              <input
                placeholder="جهة العمل"
                value={tenantForm.employer}
                onChange={(e) => setTenantForm({ ...tenantForm, employer: e.target.value })}
                className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddTenant(false)} className="px-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer">
                إلغاء
              </button>
              <button
                type="submit"
                disabled={Boolean(duplicateIdWarning)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#26478D] text-white disabled:opacity-50 cursor-pointer"
              >
                حفظ ملف المستأجر
              </button>
            </div>
          </form>
        </div>
      )}

      <CameraDocumentScannerModal
        open={showTenantCamera}
        lang={lang}
        onClose={() => setShowTenantCamera(false)}
        onComplete={async (scan: ProcessedScanResult) => {
          setShowTenantCamera(false);
          await handleProcessTenantIdOcr(scan.dataUrl, scan.mimeType, `tenant-id-${Date.now()}.jpg`, scan.sizeKb);
        }}
      />

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateLead}
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13192B] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">تسجيل عميل محتمل / موعد معاينة</h3>
              <button type="button" onClick={() => setShowAddLead(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <input
                required
                placeholder="اسم العميل"
                value={leadForm.nameAr}
                onChange={(e) => setLeadForm({ ...leadForm, nameAr: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent"
              />
              <input
                required
                placeholder="رقم الجوال"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent font-mono-num"
              />
              <select
                value={leadForm.unitId || state.units[0]?.id}
                onChange={(e) => setLeadForm({ ...leadForm, unitId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0E1A]"
              >
                {state.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unitNumber} ({u.status})
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={leadForm.viewingDate}
                onChange={(e) => setLeadForm({ ...leadForm, viewingDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent font-mono-num"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddLead(false)} className="px-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer">
                إلغاء
              </button>
              <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#26478D] text-white cursor-pointer">
                حفظ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
