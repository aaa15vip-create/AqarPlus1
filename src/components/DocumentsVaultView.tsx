import React from 'react';
import { FolderOpen } from 'lucide-react';
import { useAqar } from '../context/AqarContext';
import { DocumentArchiveOcrPanel } from './DocumentArchiveOcrPanel';
import { PrintViewButton } from './PrintViewButton';

export function DocumentsVaultView() {
  const { state, lang } = useAqar();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#26478D]/10 text-[#26478D] dark:text-blue-400">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">
              {isAr ? 'الأرشيف المركزي والمستندات' : 'Central Document Vault'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr
                ? `إجمالي المستندات المؤرشفة (${state?.documents.length || 0}) · مسح بالكاميرا + استخراج Gemini OCR وربط تلقائي`
                : `${state?.documents.length || 0} archived documents · Camera Scan & Gemini OCR`}
            </p>
          </div>
        </div>
        <PrintViewButton />
      </div>

      <DocumentArchiveOcrPanel />
    </div>
  );
}
