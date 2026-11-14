import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Eraser, FileSpreadsheet, PenTool, Plus, Receipt, Search, Wallet, X } from 'lucide-react';
import { useAqar } from '../context/AqarContext';
import { CurrencyCode, Installment, Payment, PaymentMethod, PaymentType } from '../types/aqar';
import { CURRENCY_META, formatCurrency, formatDateTime, formatGregorian } from '../utils/formatters';
import { exportFinanceReportToExcel } from '../utils/excelExport';
import { PrintViewButton } from './PrintViewButton';
import { ReceiptModal } from './ReceiptModal';

export function FinanceCollectionView() {
  const {
    state,
    currentUser,
    lang,
    hasPermission,
    mutate,
    pushToast,
    baseCurrency,
    setBaseCurrency,
    currencyRates,
    convertToBase,
    formatInCurrency,
    formatConvertedBase,
  } = useAqar();
  const [tab, setTab] = useState<'installments' | 'receipts'>('installments');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'paid'>('open');
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [payModal, setPayModal] = useState<{
    open: boolean;
    contractId: string;
    installmentId?: string;
    maxAmount: number;
    idempotencyKey: string;
  } | null>(null);

  const [payForm, setPayForm] = useState({
    amount: 0,
    paymentMethod: 'تحويل بنكي' as PaymentMethod,
    paymentType: 'إيجار' as PaymentType,
    referenceNumber: '',
    autoAllocateOldest: true,
    notes: '',
  });
  const [showSignaturePad, setShowSignaturePad] = useState(true);
  const [hasSignature, setHasSignature] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
  };

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const onSigPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pt = getCanvasPoint(e);
    ctx.strokeStyle = '#26478D';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    isDrawingRef.current = true;
    setHasSignature(true);
  };

  const onSigPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !sigCanvasRef.current) return;
    const ctx = sigCanvasRef.current.getContext('2d');
    if (!ctx) return;
    const pt = getCanvasPoint(e);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  const onSigPointerUp = () => {
    isDrawingRef.current = false;
  };

  const filteredInstallments = useMemo(() => {
    if (!state) return [];
    const q = search.trim().toLowerCase();
    return state.installments
      .filter((inst) => {
        if (statusFilter === 'open' && inst.remainingAmount <= 0) return false;
        if (statusFilter === 'paid' && inst.remainingAmount > 0) return false;
        if (q) {
          const tenant = state.tenants.find((t) => t.id === inst.tenantId);
          const unit = state.units.find((u) => u.id === inst.unitId);
          return (
            (tenant?.nameAr.toLowerCase().includes(q) ?? false) ||
            (unit?.unitNumber.toLowerCase().includes(q) ?? false)
          );
        }
        return true;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [state, statusFilter, search]);

  const filteredPayments = useMemo(() => {
    if (!state) return [];
    const q = search.trim().toLowerCase();
    return state.payments.filter((p) => {
      if (!q) return true;
      const tenant = state.tenants.find((t) => t.id === p.tenantId);
      return p.receiptNumber.toLowerCase().includes(q) || (tenant?.nameAr.toLowerCase().includes(q) ?? false);
    });
  }, [state, search]);

  const financeSummary = useMemo(() => {
    if (!state) return null;
    const activeInst = state.installments.filter((i) => i.status !== 'ملغاة');
    const totalDue = activeInst.reduce((s, i) => s + convertToBase(i.amount, i.currency || 'SAR'), 0);
    const totalCollected = activeInst.reduce((s, i) => s + convertToBase(i.paidAmount, i.currency || 'SAR'), 0);
    const totalRemaining = activeInst.reduce((s, i) => s + convertToBase(i.remainingAmount, i.currency || 'SAR'), 0);
    const collectionRate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;
    const approvedReceipts = state.payments.filter((p) => p.status === 'معتمد');
    const approvedReceiptsTotal = approvedReceipts.reduce((s, p) => s + convertToBase(p.amount, p.currency || 'SAR'), 0);
    return {
      totalDue,
      totalCollected,
      totalRemaining,
      collectionRate,
      approvedReceiptsCount: approvedReceipts.length,
      approvedReceiptsTotal,
    };
  }, [state, convertToBase]);

  if (!state || !financeSummary) return null;

  const handleExportExcel = () => {
    const filename = exportFinanceReportToExcel({
      state,
      lang,
      currentUser,
      filteredInstallments,
      filteredPayments,
      statusFilter,
      searchQuery: search,
      baseCurrency,
      currencyRates,
    });
    pushToast(
      'success',
      lang === 'ar'
        ? `تم تصدير التقرير المالي (${baseCurrency}) إلى Excel (${filename})`
        : `Exported financial report (${filename})`
    );
  };

  const openCollectModal = (inst?: Installment) => {
    const targetContractId = inst?.contractId || state.contracts[0]?.id || '';
    const openForContract = state.installments
      .filter((i) => i.contractId === targetContractId && i.remainingAmount > 0)
      .reduce((s, i) => s + i.remainingAmount, 0);
    const initialAmt = inst ? inst.remainingAmount : openForContract;
    setPayForm({
      amount: initialAmt,
      paymentMethod: 'تحويل بنكي',
      paymentType: 'إيجار',
      referenceNumber: '',
      autoAllocateOldest: !inst,
      notes: '',
    });
    setPayModal({
      open: true,
      contractId: targetContractId,
      installmentId: inst?.id,
      maxAmount: inst ? inst.remainingAmount : openForContract,
      idempotencyKey: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    });
    setHasSignature(false);
    setTimeout(() => clearSignature(), 0);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModal) return;
    const signatureDataUrl =
      hasSignature && sigCanvasRef.current ? sigCanvasRef.current.toDataURL('image/png') : undefined;
    const res = await mutate<{ payment?: Payment }>(
      'POST',
      '/api/payments',
      {
        idempotencyKey: payModal.idempotencyKey,
        contractId: payModal.contractId,
        installmentId: payForm.autoAllocateOldest ? undefined : payModal.installmentId,
        amount: payForm.amount,
        paymentMethod: payForm.paymentMethod,
        paymentType: payForm.paymentType,
        referenceNumber: payForm.referenceNumber,
        autoAllocateOldest: payForm.autoAllocateOldest,
        signatureDataUrl,
        notes: payForm.notes,
      },
      {
        idempotencyKey: payModal.idempotencyKey,
        offlineDescAr: `تحصيل مبلغ ${payForm.amount} ر.س`,
        offlineDescEn: `Collect ${payForm.amount} SAR`,
      }
    );
    setPayModal(null);
    if (res?.payment) {
      pushToast('success', `تم إصدار السند ${res.payment.receiptNumber} وترحيل القيد المحاسبي`);
      setSelectedReceipt(res.payment);
    }
  };

  // Live preview math for partial payment modal
  const previewDue = payModal?.maxAmount || 0;
  const previewReceived = Math.min(Math.max(0, payForm.amount), previewDue || payForm.amount);
  const previewRemaining = Math.max(0, Math.round((previewDue - payForm.amount) * 100) / 100);
  const pctCollected = previewDue > 0 ? Math.min(100, Math.round((previewReceived / previewDue) * 10000) / 100) : 100;
  const pctRemaining = Math.max(0, Math.round((100 - pctCollected) * 100) / 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-white/[0.06]">
          <button
            onClick={() => setTab('installments')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              tab === 'installments' ? 'bg-white dark:bg-[#26478D] text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {lang === 'ar' ? `جدول الاستحقاقات والدفعات (${state.installments.length})` : `Installments (${state.installments.length})`}
          </button>
          <button
            onClick={() => setTab('receipts')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              tab === 'receipts' ? 'bg-white dark:bg-[#26478D] text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {lang === 'ar' ? `سندات القبض الصادرة (${state.payments.length})` : `Receipts (${state.payments.length})`}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'تصدير Excel للمراجعة' : 'Export Excel Report'}</span>
          </button>

          <PrintViewButton />

          {hasPermission('collect_payments') && (
            <button
              onClick={() => openCollectModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#26478D] text-white hover:bg-[#1e3a75] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تسجيل تحصيل جديد' : 'Record Payment'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Summary KPI Strip (Visible on Screen & Paper) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 print-avoid-break">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 glass-surface">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {lang === 'ar' ? `إجمالي الاستحقاقات (${baseCurrency})` : `Total Active Due (${baseCurrency})`}
          </div>
          <div className="text-lg font-bold font-mono-num mt-1">{formatCurrency(financeSummary.totalDue, baseCurrency, lang)}</div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 glass-surface">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {lang === 'ar' ? 'المحصل الفعلي ونسبة التحصيل' : 'Collected & Rate'}
          </div>
          <div className="flex items-baseline justify-between gap-2 mt-1">
            <span className="text-lg font-bold font-mono-num text-emerald-600 dark:text-emerald-400">
              {formatCurrency(financeSummary.totalCollected, baseCurrency, lang)}
            </span>
            <span className="text-xs font-mono-num font-bold text-emerald-600 dark:text-emerald-400">
              {financeSummary.collectionRate}%
            </span>
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 glass-surface">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {lang === 'ar' ? 'الرصيد المتبقي للتحصيل' : 'Remaining Balance'}
          </div>
          <div className="text-lg font-bold font-mono-num text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(financeSummary.totalRemaining, baseCurrency, lang)}
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 glass-surface">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {lang === 'ar' ? `السندات المعتمدة (${financeSummary.approvedReceiptsCount})` : `Approved Receipts (${financeSummary.approvedReceiptsCount})`}
          </div>
          <div className="text-lg font-bold font-mono-num text-[#26478D] dark:text-blue-400 mt-1">
            {formatCurrency(financeSummary.approvedReceiptsTotal, baseCurrency, lang)}
          </div>
        </div>
      </div>

      {/* Filter Bar & Base Currency Converter */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث برقم السند، المستأجر، الوحدة...' : 'Search receipt, tenant, unit...'}
              className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 glass-surface"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {lang === 'ar' ? 'عملة التقرير الأساسية:' : 'Base Currency:'}
            </span>
            <select
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value as CurrencyCode)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13192B] text-xs font-semibold cursor-pointer"
            >
              {(Object.keys(CURRENCY_META) as CurrencyCode[]).map((code) => (
                <option key={code} value={code}>
                  {lang === 'ar' ? CURRENCY_META[code].labelAr : CURRENCY_META[code].labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {tab === 'installments' && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-white/[0.06] text-xs">
            {(['open', 'paid', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
                  statusFilter === f ? 'bg-white dark:bg-[#26478D] text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {f === 'open'
                  ? lang === 'ar'
                    ? 'المستحقة والمتبقية'
                    : 'Open / Due'
                  : f === 'paid'
                  ? lang === 'ar'
                    ? 'المدفوعة بالكامل'
                    : 'Paid'
                  : lang === 'ar'
                  ? 'الكل'
                  : 'All'}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'installments' ? (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 glass-surface overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'المستأجر / الوحدة' : 'Tenant / Unit'}</th>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'قيمة القسط' : 'Amount'}</th>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'المدفوع' : 'Paid'}</th>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'المتبقي' : 'Remaining'}</th>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'تحصيل' : 'Collect'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredInstallments.map((inst) => {
                const tenant = state.tenants.find((t) => t.id === inst.tenantId);
                const unit = state.units.find((u) => u.id === inst.unitId);
                const contract = state.contracts.find((c) => c.id === inst.contractId);
                const cur = inst.currency || contract?.currency || 'SAR';
                const showConverted = cur !== baseCurrency;
                return (
                  <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="font-semibold">{tenant?.nameAr || '—'}</div>
                      <div className="text-[11px] text-slate-500 font-mono-num">
                        {unit?.unitNumber} · {contract?.internalNumber} · قسط #{inst.installmentNumber}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono-num">{formatGregorian(inst.dueDate, lang)}</td>
                    <td className="py-3 px-4 font-mono-num">
                      <div>{formatInCurrency(inst.amount, cur)}</div>
                      {showConverted && (
                        <div className="text-[10px] text-slate-500">≈ {formatConvertedBase(inst.amount, cur)}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono-num text-emerald-600 dark:text-emerald-400">
                      {formatInCurrency(inst.paidAmount, cur)}
                    </td>
                    <td className="py-3 px-4 font-mono-num font-bold text-amber-600 dark:text-amber-400">
                      <div>{formatInCurrency(inst.remainingAmount, cur)}</div>
                      {showConverted && inst.remainingAmount > 0 && (
                        <div className="text-[10px] font-normal text-slate-500">≈ {formatConvertedBase(inst.remainingAmount, cur)}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold">{inst.status}</td>
                    <td className="py-3 px-4">
                      {inst.remainingAmount > 0 && hasPermission('collect_payments') ? (
                        <button
                          onClick={() => openCollectModal(inst)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#26478D] text-white text-[11px] font-semibold hover:bg-[#1e3a75] cursor-pointer whitespace-nowrap"
                        >
                          <Wallet className="w-3 h-3" />
                          <span>{lang === 'ar' ? 'تحصيل' : 'Collect'}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 glass-surface overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'رقم السند' : 'Receipt No.'}</th>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'المستأجر / الوحدة' : 'Tenant / Unit'}</th>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'النوع والطريقة' : 'Type & Method'}</th>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="py-3 px-4 text-start font-medium">{lang === 'ar' ? 'السند' : 'View'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredPayments.map((pay) => {
                const tenant = state.tenants.find((t) => t.id === pay.tenantId);
                const unit = state.units.find((u) => u.id === pay.unitId);
                const cur = pay.currency || 'SAR';
                return (
                  <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono-num font-bold">{pay.receiptNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{tenant?.nameAr || '—'}</div>
                      <div className="text-[11px] text-slate-500">وحدة {unit?.unitNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      {pay.paymentType} · {pay.paymentMethod}
                    </td>
                    <td className={`py-3 px-4 font-mono-num font-bold ${pay.status === 'معكوس' ? 'line-through text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      <div>{formatInCurrency(pay.amount, cur)}</div>
                      {cur !== baseCurrency && (
                        <div className="text-[10px] font-normal text-slate-500">≈ {formatConvertedBase(pay.amount, cur)}</div>
                      )}
                    </td>
                    <td className={`py-3 px-4 font-semibold ${pay.status === 'معكوس' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {pay.status}
                    </td>
                    <td className="py-3 px-4 font-mono-num text-slate-500">{formatDateTime(pay.createdAt, lang)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedReceipt(pay)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'معاينة' : 'Open'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Payment Modal with Live Partial Payment Calculator & Digital Signature */}
      {payModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleRecordPayment}
            className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13192B] p-6 space-y-4 my-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{lang === 'ar' ? 'تسجيل تحصيل وإصدار سند قبض' : 'Record Payment & Receipt'}</h3>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {lang === 'ar'
                    ? '1. تحديد العقد والمبلغ ← 2. المعاينة ← 3. التوقيع الرقمي وإصدار السند'
                    : '1. Contract & Amount → 2. Preview → 3. Digital Signature & Issue'}
                </div>
              </div>
              <button type="button" onClick={() => setPayModal(null)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="text-[11px] text-slate-500 block mb-1">العقد المستهدف</label>
                <select
                  value={payModal.contractId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    const rem = state.installments
                      .filter((i) => i.contractId === cid && i.remainingAmount > 0)
                      .reduce((s, i) => s + i.remainingAmount, 0);
                    setPayModal({ ...payModal, contractId: cid, installmentId: undefined, maxAmount: rem });
                    setPayForm((f) => ({ ...f, amount: rem, autoAllocateOldest: true }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0E1A]"
                >
                  {state.contracts.map((c) => {
                    const ten = state.tenants.find((t) => t.id === c.tenantId);
                    const u = state.units.find((x) => x.id === c.unitId);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.internalNumber} · {ten?.nameAr} ({u?.unitNumber})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">المبلغ المستلم (يدعم الجزئي)</label>
                <input
                  type="number"
                  required
                  min={1}
                  step="0.01"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent font-mono-num font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">طريقة الدفع</label>
                <select
                  value={payForm.paymentMethod}
                  onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0E1A]"
                >
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="شبكة مدى">شبكة مدى</option>
                  <option value="نقدي">نقدي</option>
                  <option value="سداد إلكتروني">سداد إلكتروني</option>
                  <option value="شيك">شيك</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">نوع العملية</label>
                <select
                  value={payForm.paymentType}
                  onChange={(e) => setPayForm({ ...payForm, paymentType: e.target.value as PaymentType })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0E1A]"
                >
                  <option value="إيجار">إيجار</option>
                  <option value="دفعة مقدمة">دفعة مقدمة</option>
                  <option value="تأمين">تأمين</option>
                  <option value="رسوم مكتب وسعي">رسوم مكتب وسعي</option>
                  <option value="عمولة فسخ">عمولة فسخ</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">رقم المرجع / الحوالة</label>
                <input
                  placeholder="TRN-..."
                  value={payForm.referenceNumber}
                  onChange={(e) => setPayForm({ ...payForm, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent font-mono-num"
                />
              </div>
            </div>

            {payForm.paymentType === 'إيجار' && (
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={payForm.autoAllocateOldest}
                  onChange={(e) => setPayForm({ ...payForm, autoAllocateOldest: e.target.checked })}
                />
                <span>توزيع الدفعة تلقائياً على أقدم استحقاق مفتوح</span>
              </label>
            )}

            {/* Live Partial Payment Preview Card (From Spec Section 4.5!) */}
            {payForm.paymentType === 'إيجار' && previewDue > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">المبلغ المتبقي بعد الدفعة</span>
                  <span className="text-lg font-bold font-mono-num text-[#26478D] dark:text-blue-400">
                    {formatInCurrency(
                      previewRemaining,
                      state.contracts.find((c) => c.id === payModal.contractId)?.currency || 'SAR'
                    )}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-600 transition-all" style={{ width: `${pctCollected}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono-num text-slate-500">
                  <span>{pctCollected}% محصل</span>
                  <span>{pctRemaining}% متبقٍ</span>
                </div>
              </div>
            )}

            {/* Progressive Disclosure: Digital Signature Pad */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSignaturePad((v) => !v)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#26478D] dark:text-blue-400" />
                  <span>
                    {lang === 'ar'
                      ? `التوقيع الإلكتروني للمستلم / المستأجر ${hasSignature ? '(موقّع ✓)' : '(اختياري)'}`
                      : `Digital Signature ${hasSignature ? '(Signed ✓)' : '(Optional)'}`}
                  </span>
                </span>
                {showSignaturePad ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showSignaturePad && (
                <div className="p-3 space-y-2">
                  <div className="relative rounded-lg border border-dashed border-slate-300 dark:border-white/20 bg-white">
                    <canvas
                      ref={sigCanvasRef}
                      width={420}
                      height={110}
                      onPointerDown={onSigPointerDown}
                      onPointerMove={onSigPointerMove}
                      onPointerUp={onSigPointerUp}
                      onPointerCancel={onSigPointerUp}
                      className="w-full h-[105px] touch-none cursor-crosshair rounded-lg"
                    />
                    {!hasSignature && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] text-slate-400">
                        {lang === 'ar' ? 'ارسم التوقيع الرقمي هنا بالماوس أو اللمس...' : 'Sign here with mouse or touch...'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{lang === 'ar' ? 'يُدمج التوقيع مباشرة في سند القبض المعتمد' : 'Embedded directly on issued receipt'}</span>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                    >
                      <Eraser className="w-3 h-3" />
                      <span>{lang === 'ar' ? 'مسح التوقيع' : 'Clear'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
              <span className="font-mono-num">Key: {payModal.idempotencyKey.slice(0, 16)}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPayModal(null)} className="px-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer text-slate-600 dark:text-slate-300">
                  إلغاء
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#26478D] text-white cursor-pointer">
                  اعتماد وإصدار السند
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {selectedReceipt && <ReceiptModal payment={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
    </div>
  );
}
