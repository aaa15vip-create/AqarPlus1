/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AqarProvider, useAqar } from './context/AqarContext';
import { LayoutShell } from './components/LayoutShell';
import { DashboardView } from './components/DashboardView';
import { PropertiesUnitsView } from './components/PropertiesUnitsView';
import { TenantsCrmView } from './components/TenantsCrmView';
import { LeasingFinanceHubView } from './components/LeasingFinanceHubView';
import { MaintenanceTasksView } from './components/MaintenanceTasksView';
import { AdminHubView } from './components/AdminHubView';
import { DocumentsVaultView } from './components/DocumentsVaultView';
import { CompaniesSettingsView } from './components/CompaniesSettingsView';

function AqarWorkspace() {
  const { loading, state, activeNav, lang } = useAqar();

  if (loading || !state) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A] flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#26478D] text-white flex items-center justify-center font-bold text-lg">
            A+
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {lang === 'ar' ? 'جاري الاتصال بالخادم المركزي AqarPlus...' : 'Connecting to AqarPlus Central Server...'}
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div className="h-full w-1/2 bg-[#26478D] animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <LayoutShell>
      {activeNav === 'dashboard' && <DashboardView />}
      {activeNav === 'properties' && <PropertiesUnitsView />}
      {activeNav === 'leasing_finance' && <LeasingFinanceHubView />}
      {activeNav === 'tenants' && <TenantsCrmView />}
      {activeNav === 'maintenance' && <MaintenanceTasksView />}
      {activeNav === 'reports' && <AdminHubView key="reports" mode="reports" />}
      {activeNav === 'team' && <AdminHubView key="team" mode="team" />}
      {activeNav === 'documents' && <DocumentsVaultView />}
      {activeNav === 'settings' && <CompaniesSettingsView />}
    </LayoutShell>
  );
}

export default function App() {
  return (
    <AqarProvider>
      <AqarWorkspace />
    </AqarProvider>
  );
}
