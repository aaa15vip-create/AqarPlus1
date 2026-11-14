import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AqarDatabaseState,
  CurrencyCode,
  OfflineQueuedAction,
  PermissionKey,
  StaffUser,
} from '../types/aqar';
import {
  convertCurrency,
  DEFAULT_CURRENCY_RATES_TO_SAR,
  formatCurrency,
} from '../utils/formatters';

export interface ActiveSessionInfo {
  userId: string;
  nameAr: string;
  roleLabelAr: string;
  deviceName: string;
  connectedAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

export type PrimaryNavSection =
  | 'dashboard'
  | 'properties'
  | 'leasing_finance'
  | 'tenants'
  | 'maintenance'
  | 'reports'
  | 'team'
  | 'documents'
  | 'settings';

export type NavSection =
  | PrimaryNavSection
  | 'leasing'
  | 'finance'
  | 'accounting'
  | 'admin';

export type LeasingFinanceTab = 'leasing' | 'finance' | 'accounting';

interface AqarContextValue {
  state: AqarDatabaseState | null;
  loading: boolean;
  currentUser: StaffUser | null;
  switchUser: (userId: string) => void;
  hasPermission: (perm: PermissionKey) => boolean;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeNav: PrimaryNavSection;
  setActiveNav: (nav: NavSection) => void;
  leasingFinanceTab: LeasingFinanceTab;
  setLeasingFinanceTab: (tab: LeasingFinanceTab) => void;
  leasingWizardUnitId: string | null;
  setLeasingWizardUnitId: (unitId: string | null) => void;
  startLeasingWizardForUnit: (unitId: string) => void;
  baseCurrency: CurrencyCode;
  setBaseCurrency: (currency: CurrencyCode) => void;
  currencyRates: Record<CurrencyCode, number>;
  convertToBase: (amount: number, fromCurrency?: CurrencyCode) => number;
  formatInCurrency: (amount: number, currency?: CurrencyCode) => string;
  formatConvertedBase: (amount: number, fromCurrency?: CurrencyCode) => string;
  activeCompanyId: string;
  setActiveCompanyId: (companyId: string) => void;
  wsStatus: 'connected' | 'connecting' | 'offline';
  isOfflineSimulated: boolean;
  toggleOfflineSimulation: () => void;
  offlineQueue: OfflineQueuedAction[];
  syncOfflineQueue: () => Promise<void>;
  presence: ActiveSessionInfo[];
  toasts: ToastMessage[];
  pushToast: (type: ToastMessage['type'], text: string) => void;
  dismissToast: (id: string) => void;
  mutate: <T = unknown>(
    method: 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    body?: unknown,
    opts?: { idempotencyKey?: string; offlineDescAr?: string; offlineDescEn?: string }
  ) => Promise<T | null>;
  refreshState: () => Promise<void>;
}

const AqarContext = createContext<AqarContextValue | null>(null);

const OFFLINE_QUEUE_KEY = 'aqarplus_offline_queue_v1';
const USER_STORAGE_KEY = 'aqarplus_active_user_v1';
const THEME_STORAGE_KEY = 'aqarplus_theme_v1';
const LANG_STORAGE_KEY = 'aqarplus_lang_v1';
const BASE_CURRENCY_STORAGE_KEY = 'aqarplus_base_currency_v1';

export function AqarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AqarDatabaseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<string>(
    () => localStorage.getItem(USER_STORAGE_KEY) || 'usr-gm'
  );
  const [lang, setLangState] = useState<'ar' | 'en'>(
    () => (localStorage.getItem(LANG_STORAGE_KEY) as 'ar' | 'en') || 'ar'
  );
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem(THEME_STORAGE_KEY) as 'dark' | 'light') || 'dark'
  );
  const [baseCurrency, setBaseCurrencyState] = useState<CurrencyCode>(
    () => (localStorage.getItem(BASE_CURRENCY_STORAGE_KEY) as CurrencyCode) || 'SAR'
  );
  const [activeCompanyId, setActiveCompanyId] = useState<string>('all');
  const [activeNav, setActiveNavState] = useState<PrimaryNavSection>('dashboard');
  const [leasingFinanceTab, setLeasingFinanceTab] = useState<LeasingFinanceTab>('leasing');
  const [leasingWizardUnitId, setLeasingWizardUnitId] = useState<string | null>(null);

  const setActiveNav = useCallback((nav: NavSection) => {
    if (nav === 'leasing' || nav === 'finance' || nav === 'accounting') {
      setLeasingFinanceTab(nav);
      setActiveNavState('leasing_finance');
      return;
    }
    if (nav === 'admin') {
      setActiveNavState('reports');
      return;
    }
    setActiveNavState(nav);
  }, []);

  const startLeasingWizardForUnit = useCallback((unitId: string) => {
    setLeasingWizardUnitId(unitId);
    setLeasingFinanceTab('leasing');
    setActiveNavState('leasing_finance');
  }, []);
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'offline'>('connecting');
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [presence, setPresence] = useState<ActiveSessionInfo[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueuedAction[]>(() => {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? (JSON.parse(raw) as OfflineQueuedAction[]) : [];
    } catch {
      return [];
    }
  });

  const wsRef = useRef<WebSocket | null>(null);
  const activeUserIdRef = useRef(activeUserId);
  activeUserIdRef.current = activeUserId;

  const pushToast = useCallback((type: ToastMessage['type'], text: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync HTML dir, lang, and dark class
  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  const setLang = useCallback((next: 'ar' | 'en') => {
    setLangState(next);
  }, []);

  const setBaseCurrency = useCallback((next: CurrencyCode) => {
    setBaseCurrencyState(next);
    localStorage.setItem(BASE_CURRENCY_STORAGE_KEY, next);
  }, []);

  const currencyRates = useMemo<Record<CurrencyCode, number>>(
    () => ({
      ...DEFAULT_CURRENCY_RATES_TO_SAR,
      ...(state?.settings?.currencyRatesToSar || {}),
    }),
    [state?.settings?.currencyRatesToSar]
  );

  const convertToBase = useCallback(
    (amount: number, fromCurrency: CurrencyCode = 'SAR') => {
      return convertCurrency(amount, fromCurrency, baseCurrency, currencyRates);
    },
    [baseCurrency, currencyRates]
  );

  const formatInCurrency = useCallback(
    (amount: number, currency: CurrencyCode = 'SAR') => {
      return formatCurrency(amount, currency, lang);
    },
    [lang]
  );

  const formatConvertedBase = useCallback(
    (amount: number, fromCurrency: CurrencyCode = 'SAR') => {
      const converted = convertCurrency(amount, fromCurrency, baseCurrency, currencyRates);
      return formatCurrency(converted, baseCurrency, lang);
    },
    [baseCurrency, currencyRates, lang]
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const currentUser = useMemo(() => {
    if (!state) return null;
    return state.users.find((u) => u.id === activeUserId) || state.users[0] || null;
  }, [state, activeUserId]);

  const fetchState = useCallback(async (uid: string) => {
    try {
      const res = await fetch('/api/state', {
        headers: { 'x-user-id': uid },
      });
      if (!res.ok) throw new Error('Failed to fetch state');
      const data = await res.json();
      setState(data.state);
      if (data.presence) setPresence(data.presence);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshState = useCallback(async () => {
    await fetchState(activeUserIdRef.current);
  }, [fetchState]);

  useEffect(() => {
    fetchState(activeUserId);
  }, [activeUserId, fetchState]);

  // WebSocket live connection
  useEffect(() => {
    if (isOfflineSimulated) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsStatus('offline');
      return;
    }

    let closedByUser = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (closedByUser) return;
      setWsStatus('connecting');
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${proto}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        const userObj = state?.users.find((u) => u.id === activeUserIdRef.current);
        ws.send(
          JSON.stringify({
            type: 'session:identify',
            userId: activeUserIdRef.current,
            deviceName: userObj?.deviceName || 'Web Terminal',
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'state:init' || msg.type === 'state:updated') {
            if (msg.state) setState(msg.state);
            if (msg.presence) setPresence(msg.presence);
            if (msg.type === 'state:updated' && msg.actorUserId !== activeUserIdRef.current && msg.summary) {
              pushToast('info', `تحديث مباشر: ${msg.summary}`);
            }
          } else if (msg.type === 'presence:update') {
            setPresence(msg.sessions || []);
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        if (!closedByUser) {
          setWsStatus('offline');
          reconnectTimer = setTimeout(connect, 2500);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      closedByUser = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [isOfflineSimulated, pushToast]);

  // Identify updated role on WS when switching users
  useEffect(() => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const userObj = state?.users.find((u) => u.id === activeUserId);
      ws.send(
        JSON.stringify({
          type: 'session:identify',
          userId: activeUserId,
          deviceName: userObj?.deviceName || 'Web Terminal',
        })
      );
    }
  }, [activeUserId, state?.users]);

  const switchUser = useCallback(
    (userId: string) => {
      setActiveUserId(userId);
      localStorage.setItem(USER_STORAGE_KEY, userId);
      setActiveNav('dashboard');
    },
    [setActiveNav]
  );

  const hasPermission = useCallback(
    (perm: PermissionKey) => {
      if (!state || !currentUser) return false;
      const perms = state.rolePermissions[currentUser.role] || [];
      return perms.includes(perm);
    },
    [state, currentUser]
  );

  const syncOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0 || isOfflineSimulated) return;
    const remaining: OfflineQueuedAction[] = [];
    let syncedCount = 0;

    for (const action of offlineQueue) {
      try {
        const res = await fetch(action.endpoint, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': action.userId,
            'x-device-name': encodeURIComponent(action.deviceName),
            'x-idempotency-key': action.idempotencyKey,
          },
          body: action.body ? JSON.stringify(action.body) : undefined,
        });
        const data = await res.json();
        if (!res.ok) {
          pushToast('error', `تعذر مزامنة (${action.descriptionAr}): ${data.error || 'خطأ'}`);
        } else {
          syncedCount += 1;
          if (data.state) setState(data.state);
        }
      } catch {
        remaining.push(action);
      }
    }

    setOfflineQueue(remaining);
    if (syncedCount > 0) {
      pushToast(
        'success',
        lang === 'ar'
          ? `تمت مزامنة ${syncedCount} عملية مسجلة دون إنترنت بنجاح دون تكرار`
          : `Synced ${syncedCount} offline actions idempotently`
      );
      await fetchState(activeUserIdRef.current);
    }
  }, [offlineQueue, isOfflineSimulated, lang, pushToast, fetchState]);

  const toggleOfflineSimulation = useCallback(() => {
    setIsOfflineSimulated((prev) => {
      const next = !prev;
      if (next) {
        pushToast(
          'info',
          lang === 'ar'
            ? 'تم تفعيل وضع العمل دون إنترنت — تحفظ العمليات محلياً وتُزامن عند عودة الاتصال'
            : 'Offline mode enabled — mutations queue locally for sync'
        );
      }
      return next;
    });
  }, [lang, pushToast]);

  // Auto-sync when returning online
  useEffect(() => {
    if (!isOfflineSimulated && wsStatus === 'connected' && offlineQueue.length > 0) {
      syncOfflineQueue();
    }
  }, [isOfflineSimulated, wsStatus, offlineQueue.length, syncOfflineQueue]);

  const mutate = useCallback(
    async <T = unknown>(
      method: 'POST' | 'PATCH' | 'DELETE',
      endpoint: string,
      body?: unknown,
      opts?: { idempotencyKey?: string; offlineDescAr?: string; offlineDescEn?: string }
    ): Promise<T | null> => {
      const idempotencyKey =
        opts?.idempotencyKey || `idem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const deviceName = currentUser?.deviceName || 'Web Terminal';

      if (isOfflineSimulated || !navigator.onLine) {
        if (method === 'DELETE') {
          pushToast('error', lang === 'ar' ? 'الحذف يتطلب اتصالاً مباشراً بالخادم' : 'Delete requires live server connection');
          return null;
        }
        const queued: OfflineQueuedAction = {
          id: `off-${Date.now()}`,
          idempotencyKey,
          method,
          endpoint,
          body,
          descriptionAr: opts?.offlineDescAr || 'عملية محلية',
          descriptionEn: opts?.offlineDescEn || 'Queued operation',
          queuedAt: new Date().toISOString(),
          userId: activeUserIdRef.current,
          deviceName,
        };
        setOfflineQueue((prev) => [...prev, queued]);
        pushToast(
          'info',
          lang === 'ar'
            ? `تم حفظ العملية محلياً (${queued.descriptionAr}) وستتم مزامنتها فور عودة الاتصال`
            : `Queued locally (${queued.descriptionEn}) for sync`
        );
        return null;
      }

      try {
        const res = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': activeUserIdRef.current,
            'x-device-name': encodeURIComponent(deviceName),
            'x-idempotency-key': idempotencyKey,
          },
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        const data = await res.json();
        if (!res.ok) {
          pushToast('error', data.error || 'تعذر تنفيذ العملية');
          return null;
        }
        if (data.state) setState(data.state);
        return data as T;
      } catch {
        pushToast('error', lang === 'ar' ? 'تعذر الاتصال بالخادم المركزي' : 'Cannot reach central server');
        return null;
      }
    },
    [currentUser, isOfflineSimulated, lang, pushToast]
  );

  const value = useMemo<AqarContextValue>(
    () => ({
      state,
      loading,
      currentUser,
      switchUser,
      hasPermission,
      lang,
      setLang,
      theme,
      toggleTheme,
      activeNav,
      setActiveNav,
      leasingFinanceTab,
      setLeasingFinanceTab,
      leasingWizardUnitId,
      setLeasingWizardUnitId,
      startLeasingWizardForUnit,
      baseCurrency,
      setBaseCurrency,
      currencyRates,
      convertToBase,
      formatInCurrency,
      formatConvertedBase,
      activeCompanyId,
      setActiveCompanyId,
      wsStatus,
      isOfflineSimulated,
      toggleOfflineSimulation,
      offlineQueue,
      syncOfflineQueue,
      presence,
      toasts,
      pushToast,
      dismissToast,
      mutate,
      refreshState,
    }),
    [
      state,
      loading,
      currentUser,
      switchUser,
      hasPermission,
      lang,
      setLang,
      theme,
      toggleTheme,
      activeNav,
      setActiveNav,
      leasingFinanceTab,
      leasingWizardUnitId,
      startLeasingWizardForUnit,
      baseCurrency,
      setBaseCurrency,
      currencyRates,
      convertToBase,
      formatInCurrency,
      formatConvertedBase,
      activeCompanyId,
      wsStatus,
      isOfflineSimulated,
      toggleOfflineSimulation,
      offlineQueue,
      syncOfflineQueue,
      presence,
      toasts,
      pushToast,
      dismissToast,
      mutate,
      refreshState,
    ]
  );

  return <AqarContext.Provider value={value}>{children}</AqarContext.Provider>;
}

export function useAqar() {
  const ctx = useContext(AqarContext);
  if (!ctx) throw new Error('useAqar must be used within AqarProvider');
  return ctx;
}
