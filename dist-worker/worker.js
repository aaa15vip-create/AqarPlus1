// worker/src/workspaceDo.ts
import { DurableObject } from "cloudflare:workers";

// server/seed.ts
var DEFAULT_ROLE_PERMISSIONS = {
  sys_owner: [
    "view_all",
    "manage_properties",
    "manage_tenants",
    "manage_contracts",
    "collect_payments",
    "reverse_receipts",
    "manage_accounting",
    "create_expense",
    "approve_expense_supervisor",
    "approve_expense_manager",
    "manage_maintenance",
    "execute_maintenance",
    "manage_tasks",
    "manage_documents",
    "manage_users",
    "backup_restore",
    "view_audit"
  ],
  gm: [
    "view_all",
    "manage_properties",
    "manage_tenants",
    "manage_contracts",
    "collect_payments",
    "reverse_receipts",
    "manage_accounting",
    "create_expense",
    "approve_expense_supervisor",
    "approve_expense_manager",
    "manage_maintenance",
    "execute_maintenance",
    "manage_tasks",
    "manage_documents",
    "manage_users",
    "backup_restore",
    "view_audit"
  ],
  accountant: [
    "view_all",
    "collect_payments",
    "reverse_receipts",
    "manage_accounting",
    "create_expense",
    "manage_documents",
    "view_audit"
  ],
  leasing: [
    "manage_properties",
    "manage_tenants",
    "manage_contracts",
    "manage_tasks",
    "manage_documents"
  ],
  supervisor: [
    "manage_properties",
    "manage_tenants",
    "create_expense",
    "approve_expense_supervisor",
    "manage_maintenance",
    "manage_tasks",
    "manage_documents"
  ],
  maint_manager: [
    "manage_maintenance",
    "execute_maintenance",
    "manage_tasks",
    "create_expense",
    "approve_expense_supervisor",
    "manage_documents"
  ],
  technician: ["execute_maintenance", "manage_tasks", "create_expense"],
  receptionist: ["manage_tenants", "manage_tasks", "manage_documents"],
  auditor: ["view_all", "view_audit"],
  owner: []
};
function createInitialSeed() {
  const now = "2026-11-14T10:15:00.000Z";
  return {
    settings: {
      nameAr: "\u0634\u0631\u0643\u0629 \u062F\u0627\u0631 \u0627\u0644\u0623\u0641\u0642 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643 \u0648\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A",
      nameEn: "Dar Al-Ofoq Property Management Co.",
      vatNumber: "310482910300003",
      crNumber: "1010648291",
      city: "\u0627\u0644\u0631\u064A\u0627\u0636",
      address: "\u0637\u0631\u064A\u0642 \u0627\u0644\u0645\u0644\u0643 \u0641\u0647\u062F\u060C \u062D\u064A \u0627\u0644\u0639\u0644\u064A\u0627\u060C \u0628\u0631\u062C \u0627\u0644\u0623\u0639\u0645\u0627\u0644\u060C \u0627\u0644\u062F\u0648\u0631 4",
      mapLat: 24.7136,
      mapLng: 46.6753,
      phone: "0114892200",
      whatsapp: "966505123400",
      email: "ops@aqarplus.sa",
      ejarApiMode: "PDF + \u0645\u0637\u0627\u0628\u0642\u0629 \u064A\u062F\u0648\u064A\u0629",
      zatcaPhase: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 (QR + \u0623\u0631\u0634\u0641\u0629)",
      supervisorApprovalThreshold: 500,
      managerApprovalThreshold: 2e3,
      defaultManagementFeePercent: 5,
      baseCurrency: "SAR",
      currencyRatesToSar: {
        SAR: 1,
        AED: 1.021,
        USD: 3.75,
        EGP: 0.077,
        KWD: 12.22
      },
      dateCalendar: "\u0647\u062C\u0631\u064A \u0648\u0645\u064A\u0644\u0627\u062F\u064A",
      bankAccounts: [
        {
          id: "bnk-1",
          bankName: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A (SNB)",
          iban: "SA1910000041200008819201",
          accountHolder: "\u0634\u0631\u0643\u0629 \u062F\u0627\u0631 \u0627\u0644\u0623\u0641\u0642 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643 \u0648\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A",
          isDefault: true,
          showOnReceipts: true
        },
        {
          id: "bnk-2",
          bankName: "\u0645\u0635\u0631\u0641 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
          iban: "SA4480000123608010778899",
          accountHolder: "\u0634\u0631\u0643\u0629 \u0627\u0644\u062C\u0646\u064A\u062F\u0644 \u0627\u0644\u0639\u0642\u0627\u0631\u064A\u0629 - \u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u062D\u0635\u064A\u0644",
          isDefault: false,
          showOnReceipts: true
        }
      ],
      receiptBranding: {
        layout: "portrait",
        showLogo: true,
        showVat: true,
        showQr: true,
        showSignature: true,
        showWatermark: true,
        accentColor: "#26478D"
      },
      generalPrefs: {
        language: "ar",
        rtlAuto: true,
        currency: "SAR",
        calendar: "both",
        dateFormat: "DD/MM/YYYY",
        numeralFormat: "en",
        timezone: "Asia/Riyadh (UTC+3)",
        themeMode: "dark"
      },
      securityCenter: {
        lockMethod: "pin",
        patternCode: "1-4-7-8-9",
        autoLockTiming: "5m",
        requirePinBeforeDeleteReceipt: true,
        requirePinBeforeCancelPayment: true,
        requirePinBeforeEditContract: true,
        requirePinBeforeExportData: false
      },
      notificationsCenter: {
        inApp: {
          rentDueBefore: true,
          rentDueDay: true,
          rentDueAfter: true,
          contractExpiry: true,
          maintenanceTickets: true,
          assignedTasks: true,
          syncUpdates: true
        },
        push: {
          rentDue: true,
          contractExpiry: true,
          maintenance: true,
          tasks: true,
          sync: false
        },
        workHoursEnabled: true,
        workHoursStart: "08:00",
        workHoursEnd: "20:00",
        whatsappAutoEnabled: true,
        whatsappDefaultTemplates: {
          rentDueId: "tpl-pay-1",
          receiptId: "tpl-pay-2",
          maintenanceId: "tpl-mnt-1",
          contractId: "tpl-ctr-2"
        }
      },
      printShare: {
        discoveredPrinters: [
          { id: "prt-1", name: "HP LaserJet Pro M404dn \xB7 \u0627\u0644\u0625\u062F\u0627\u0631\u0629", connection: "Network", address: "192.168.10.50:9100" },
          { id: "prt-2", name: "Epson TM-T88VI \xB7 \u0637\u0627\u0628\u0639\u0629 \u0627\u0644\u0625\u064A\u0635\u0627\u0644\u0627\u062A \u0627\u0644\u062D\u0631\u0627\u0631\u064A\u0629 80mm", connection: "Bluetooth", address: "BT-00:1A:7D:DA:71:13" },
          { id: "prt-3", name: "Canon imageCLASS \xB7 \u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644", connection: "USB", address: "USB001" }
        ],
        defaultPrinters: {
          receipts: "prt-2",
          reports: "prt-1",
          documents: "prt-1"
        },
        paperSize: "A4",
        printQuality: "high",
        defaultShareChannel: "whatsapp"
      },
      backupPolicy: {
        frequency: "daily",
        scheduledTime: "02:00",
        storageTarget: "nas",
        customPath: "\\\\NAS-AQAR\\Backups\\AqarPlus",
        encryptBackups: true
      },
      syncCenter: {
        mode: "private_server",
        serverHost: "192.168.10.10",
        serverPort: 3e3,
        protocol: "wss",
        behavior: "auto",
        conflictResolution: "latest_wins"
      },
      developerCenter: {
        tempCacheSizeKb: 3840,
        errorLogs: [
          {
            id: "err-1",
            timestamp: "2026-11-14T08:42:10.000Z",
            source: "SyncEngine/WebSocket",
            message: "\u0625\u0639\u0627\u062F\u0629 \u0627\u062A\u0635\u0627\u0644 \u062A\u0644\u0642\u0627\u0626\u064A\u0629 \u0628\u0639\u062F \u062A\u0628\u062F\u064A\u0644 \u0634\u0628\u0643\u0629 Wi-Fi \u0641\u064A \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629 \u062E\u0644\u0627\u0644 420ms",
            severity: "info"
          },
          {
            id: "err-2",
            timestamp: "2026-11-14T09:15:33.000Z",
            source: "OCR/GeminiClient",
            message: "\u0627\u0643\u062A\u0645\u0627\u0644 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0636\u0648\u0626\u064A \u0644\u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 \u0645\u0648\u062D\u062F (\u062B\u0642\u0629 98%)",
            severity: "info"
          }
        ]
      }
    },
    companies: [
      {
        id: "comp-1",
        nameAr: "\u0634\u0631\u0643\u0629 \u062F\u0627\u0631 \u0627\u0644\u0623\u0641\u0642 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643 \u0648\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A",
        nameEn: "Dar Al-Ofoq Property Management Co.",
        logoText: "\u062F\u0627\u0631 \u0627\u0644\u0623\u0641\u0642",
        crNumber: "1010648291",
        vatNumber: "310482910300003",
        address: "\u0637\u0631\u064A\u0642 \u0627\u0644\u0645\u0644\u0643 \u0641\u0647\u062F\u060C \u062D\u064A \u0627\u0644\u0639\u0644\u064A\u0627",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        phone: "0114892200",
        email: "ops@aqarplus.sa",
        bankName: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A",
        iban: "SA1910000041200008819201",
        receiptFooterAr: "\u0647\u0630\u0627 \u0627\u0644\u0633\u0646\u062F \u0635\u0627\u062F\u0631 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u064B \u0645\u0646 \u0646\u0638\u0627\u0645 AqarPlus \u0648\u0644\u0627 \u064A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u062E\u062A\u0645 \u0648\u0631\u0642\u064A",
        isDefault: true
      },
      {
        id: "comp-2",
        nameAr: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0645\u062F\u0627\u0631 \u0644\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0648\u0627\u0644\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0639\u0642\u0627\u0631\u064A",
        nameEn: "Al-Madar Real Estate Investment Co.",
        logoText: "\u0627\u0644\u0645\u062F\u0627\u0631",
        crNumber: "1010772210",
        vatNumber: "310992817200003",
        address: "\u0637\u0631\u064A\u0642 \u0623\u0646\u0633 \u0628\u0646 \u0645\u0627\u0644\u0643\u060C \u062D\u064A \u0627\u0644\u0645\u0644\u0642\u0627",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        phone: "0112981144",
        email: "finance@almadar.sa",
        bankName: "\u0645\u0635\u0631\u0641 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        iban: "SA4480000123608010778899",
        receiptFooterAr: "\u0645\u062D\u0635\u0644 \u0644\u0635\u0627\u0644\u062D \u0645\u062D\u0641\u0638\u0629 \u0634\u0631\u0643\u0629 \u0627\u0644\u0645\u062F\u0627\u0631 \u0627\u0644\u0639\u0642\u0627\u0631\u064A\u0629",
        isDefault: false
      }
    ],
    users: [
      {
        id: "usr-sys",
        nameAr: "\u0639\u0628\u062F\u0627\u0644\u0644\u0647 \u0628\u0646 \u0641\u0647\u062F \u0627\u0644\u0633\u0628\u064A\u0639\u064A",
        nameEn: "Abdullah Al-Subaie",
        role: "sys_owner",
        roleLabelAr: "\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645",
        roleLabelEn: "System Owner",
        email: "owner.sys@aqarplus.sa",
        phone: "0505123400",
        approvalLimitSar: 1e6,
        active: true,
        deviceName: "MacBook Pro M3 \xB7 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0644\u064A\u0627",
        lastActiveAt: now,
        statusState: "\u0645\u062A\u0635\u0644",
        specialty: "\u0627\u0644\u062D\u0648\u0643\u0645\u0629 \u0648\u0627\u0644\u0623\u0645\u0646 \u0648\u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A",
        managerRating: 5,
        lastActivitySummary: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u0623\u0645\u0627\u0646 \u0648\u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0627\u0644\u064A\u0648\u0645\u064A\u0629",
        security: {
          twoFactorEnabled: true,
          biometricEnabled: true,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-20T09:00:00.000Z",
          requirePasswordChange90d: true
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: true
        }
      },
      {
        id: "usr-gm",
        nameAr: "\u0641\u0647\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0633\u0628\u064A\u0639\u064A",
        nameEn: "Fahad Al-Subaie",
        role: "gm",
        roleLabelAr: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629 / \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
        roleLabelEn: "Company Manager",
        email: "fahad@aqarplus.sa",
        phone: "0505123401",
        approvalLimitSar: 5e5,
        active: true,
        deviceName: "Windows Desktop \xB7 \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        lastActiveAt: now,
        statusState: "\u0645\u062A\u0635\u0644",
        specialty: "\u0627\u0644\u0625\u0634\u0631\u0627\u0641 \u0627\u0644\u0639\u0627\u0645 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A",
        managerRating: 5,
        lastActivitySummary: "\u0627\u0639\u062A\u0645\u062F \u0645\u0635\u0631\u0648\u0641 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0645\u062C\u0645\u0639 \u0642\u0628\u0644 18 \u062F\u0642\u064A\u0642\u0629",
        security: {
          twoFactorEnabled: true,
          biometricEnabled: true,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-25T10:00:00.000Z",
          requirePasswordChange90d: true
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: true
        }
      },
      {
        id: "usr-acc",
        nameAr: "\u0633\u0644\u0645\u0627\u0646 \u0628\u0646 \u0646\u0627\u0635\u0631 \u0627\u0644\u062F\u0648\u0633\u0631\u064A",
        nameEn: "Salman Al-Dosari",
        role: "accountant",
        roleLabelAr: "\u0627\u0644\u0645\u062D\u0627\u0633\u0628 \u0627\u0644\u0645\u0627\u0644\u064A",
        roleLabelEn: "Financial Accountant",
        email: "salman@aqarplus.sa",
        phone: "0505123402",
        approvalLimitSar: 5e3,
        active: true,
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        lastActiveAt: now,
        statusState: "\u0645\u062A\u0635\u0644",
        specialty: "\u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u0648\u0627\u0644\u0625\u064A\u0635\u0627\u0644\u0627\u062A \u0648\u0627\u0644\u0642\u064A\u0648\u062F \u0627\u0644\u0645\u0627\u0644\u064A\u0629",
        managerRating: 4.8,
        lastActivitySummary: "\u0633\u062C\u0644 \u0633\u0646\u062F \u0642\u0628\u0636 9,000 \u0631.\u0633 \u0642\u0628\u0644 5 \u062F\u0642\u0627\u0626\u0642",
        security: {
          twoFactorEnabled: true,
          biometricEnabled: false,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-15T11:00:00.000Z",
          requirePasswordChange90d: true
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: false
        }
      },
      {
        id: "usr-lease",
        nameAr: "\u0631\u064A\u0645 \u0628\u0646\u062A \u062E\u0627\u0644\u062F \u0627\u0644\u0639\u062A\u064A\u0628\u064A",
        nameEn: "Reem Al-Otaibi",
        role: "leasing",
        roleLabelAr: "\u0645\u0648\u0638\u0641 \u0627\u0644\u062A\u0623\u062C\u064A\u0631 \u0648\u0627\u0644\u0639\u0642\u0648\u062F",
        roleLabelEn: "Leasing Agent",
        email: "reem@aqarplus.sa",
        phone: "0505123403",
        approvalLimitSar: 1e3,
        active: true,
        deviceName: "iPad Pro \xB7 \u0645\u0643\u062A\u0628 \u0627\u0644\u062A\u0623\u062C\u064A\u0631",
        lastActiveAt: now,
        statusState: "\u0645\u0634\u063A\u0648\u0644",
        specialty: "\u0627\u0644\u0639\u0642\u0648\u062F \u0648\u0627\u0644\u0645\u0639\u0627\u064A\u0646\u0627\u062A \u0648\u062A\u0648\u062B\u064A\u0642 \u0625\u064A\u062C\u0627\u0631",
        managerRating: 4.9,
        lastActivitySummary: "\u0623\u0631\u0633\u0644\u062A \u062A\u0630\u0643\u064A\u0631 \u062A\u062C\u062F\u064A\u062F \u0639\u0642\u062F \u0627\u0644\u0645\u0639\u0631\u0636 S-01 \u0642\u0628\u0644 12 \u062F\u0642\u064A\u0642\u0629",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: true,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-11-01T08:30:00.000Z"
        },
        notificationPrefs: {
          dndEnabled: true,
          dndFrom: "21:00",
          dndTo: "08:00",
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: false
        }
      },
      {
        id: "usr-sup",
        nameAr: "\u0645\u0627\u062C\u062F \u0628\u0646 \u062A\u0631\u0643\u064A \u0627\u0644\u062D\u0631\u0628\u064A",
        nameEn: "Majed Al-Harbi",
        role: "supervisor",
        roleLabelAr: "\u0627\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0639\u0642\u0627\u0631\u064A",
        roleLabelEn: "Property Supervisor",
        email: "majed@aqarplus.sa",
        phone: "0505123404",
        approvalLimitSar: 2e3,
        active: true,
        deviceName: "Android Tablet \xB7 \u0645\u064A\u062F\u0627\u0646\u064A",
        lastActiveAt: now,
        statusState: "\u0645\u062A\u0635\u0644",
        specialty: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0625\u0634\u063A\u0627\u0644 \u0648\u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0627\u0644\u0625\u062E\u0644\u0627\u0621",
        managerRating: 4.7,
        lastActivitySummary: "\u0631\u0627\u062C\u0639 \u0645\u0635\u0631\u0648\u0641 \u0635\u064A\u0627\u0646\u0629 B-204 \u0648\u0623\u062D\u0627\u0644\u0647 \u0644\u0644\u0645\u062F\u064A\u0631",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: true,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-12T09:00:00.000Z"
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: true
        }
      },
      {
        id: "usr-mm",
        nameAr: "\u0628\u062F\u0631 \u0628\u0646 \u0639\u0644\u064A \u0627\u0644\u063A\u0627\u0645\u062F\u064A",
        nameEn: "Badr Al-Ghamdi",
        role: "maint_manager",
        roleLabelAr: "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        roleLabelEn: "Maintenance Manager",
        email: "badr@aqarplus.sa",
        phone: "0505123406",
        approvalLimitSar: 1500,
        active: true,
        deviceName: "iPad Air \xB7 \u0642\u0633\u0645 \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        lastActiveAt: now,
        statusState: "\u0645\u062A\u0635\u0644",
        specialty: "\u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0648\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u064A\u0646 \u0648\u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631",
        managerRating: 4.6,
        lastActivitySummary: "\u0623\u0633\u0646\u062F \u0628\u0644\u0627\u063A \u062A\u0633\u0631\u0628 A-102 \u0644\u0644\u0641\u0646\u064A \u0639\u0645\u0631 \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: true,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-28T09:00:00.000Z"
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: true
        }
      },
      {
        id: "usr-tech",
        nameAr: "\u0639\u0645\u0631 \u0628\u0646 \u0633\u0639\u064A\u062F \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A",
        nameEn: "Omar Al-Qahtani",
        role: "technician",
        roleLabelAr: "\u0641\u0646\u064A \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        roleLabelEn: "Maintenance Technician",
        email: "omar@aqarplus.sa",
        phone: "0505123405",
        approvalLimitSar: 300,
        active: true,
        deviceName: "Android Mobile \xB7 \u062C\u0648\u0627\u0644 \u0627\u0644\u0641\u0646\u064A",
        lastActiveAt: now,
        statusState: "\u0645\u0634\u063A\u0648\u0644",
        specialty: "\u062A\u0643\u064A\u064A\u0641 \u0648\u062A\u0628\u0631\u064A\u062F \u0648\u0633\u0628\u0627\u0643\u0629 \u0648\u0643\u0647\u0631\u0628\u0627\u0621",
        managerRating: 4.9,
        lastActivitySummary: "\u0631\u0641\u0639 \u062A\u0642\u0631\u064A\u0631 \u0641\u062D\u0635 \u0627\u0644\u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0648\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: true,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-11-02T09:00:00.000Z"
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: true
        }
      },
      {
        id: "usr-rec",
        nameAr: "\u0646\u0648\u0631\u0629 \u0628\u0646\u062A \u0633\u0639\u062F \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A",
        nameEn: "Noura Al-Qahtani",
        role: "receptionist",
        roleLabelAr: "\u0645\u0648\u0638\u0641 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644",
        roleLabelEn: "Receptionist",
        email: "noura@aqarplus.sa",
        phone: "0505123407",
        approvalLimitSar: 0,
        active: true,
        deviceName: "Windows Reception \xB7 \u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644",
        lastActiveAt: "2026-11-14T09:40:00.000Z",
        statusState: "\u0645\u062A\u0635\u0644",
        specialty: "\u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0623\u0648\u0644\u064A\u0629",
        managerRating: 4.5,
        lastActivitySummary: "\u0627\u0633\u062A\u0642\u0628\u0644\u062A 3 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0645\u0639\u0627\u064A\u0646\u0629 \u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0645\u0644\u0642\u0627",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: false,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-30T09:00:00.000Z"
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: false,
          taskComment: true,
          urgentTicket: false
        }
      },
      {
        id: "usr-aud",
        nameAr: "\u062E\u0627\u0644\u062F \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0645\u0646\u064A\u0641",
        nameEn: "Khalid Al-Muneef",
        role: "auditor",
        roleLabelAr: "\u0627\u0644\u0645\u0631\u0627\u062C\u0639",
        roleLabelEn: "Auditor",
        email: "audit@aqarplus.sa",
        phone: "0505123408",
        approvalLimitSar: 0,
        active: true,
        deviceName: "Laptop \xB7 \u0648\u062D\u062F\u0629 \u0627\u0644\u0631\u0642\u0627\u0628\u0629 \u0648\u0627\u0644\u062A\u062F\u0642\u064A\u0642",
        lastActiveAt: "2026-11-14T08:50:00.000Z",
        statusState: "\u063A\u064A\u0631 \u0645\u062A\u0635\u0644",
        specialty: "\u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629 \u0648\u0641\u062D\u0635 \u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644",
        managerRating: 5,
        lastActivitySummary: "\u0635\u062F\u0651\u0631 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u062A\u062F\u0642\u064A\u0642 \u0627\u0644\u0634\u0647\u0631\u064A \u0648\u0633\u062C\u0644 \u0627\u0644\u0639\u0643\u0633 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u064A",
        security: {
          twoFactorEnabled: true,
          biometricEnabled: false,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-18T09:00:00.000Z",
          requirePasswordChange90d: true
        },
        notificationPrefs: {
          dndEnabled: true,
          dndFrom: "18:00",
          dndTo: "08:00",
          taskAssigned: false,
          taskReminder: false,
          taskApproved: false,
          taskComment: false,
          urgentTicket: false
        }
      },
      {
        id: "usr-owner",
        nameAr: "\u0627\u0644\u0634\u064A\u062E \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0628\u0646 \u0645\u062D\u0645\u062F \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        nameEn: "Abdulaziz Al-Rajhi",
        role: "owner",
        roleLabelAr: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0645\u0627\u0644\u0643",
        roleLabelEn: "Property Owner",
        email: "owner.rajhi@aqarplus.sa",
        phone: "0559812200",
        approvalLimitSar: 0,
        active: true,
        ownerId: "own-1",
        deviceName: "iPhone \xB7 \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0645\u0627\u0644\u0643",
        lastActiveAt: now,
        statusState: "\u063A\u064A\u0631 \u0645\u062A\u0635\u0644",
        specialty: "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0639\u0648\u0627\u0626\u062F \u0648\u0643\u0634\u0648\u0641 \u0627\u0644\u0645\u0644\u0627\u0643"
      }
    ],
    rolePermissions: DEFAULT_ROLE_PERMISSIONS,
    owners: [
      {
        id: "own-1",
        nameAr: "\u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0628\u0646 \u0645\u062D\u0645\u062F \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        nameEn: "Abdulaziz Al-Rajhi",
        nationalId: "1029384756",
        phone: "0559812200",
        email: "a.rajhi@outlook.sa",
        iban: "SA4480000123608010998821",
        bankName: "\u0645\u0635\u0631\u0641 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        totalTransferred: 145e3,
        notes: "\u0645\u0627\u0644\u0643 \u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0627\u0644\u0633\u0643\u0646\u064A \u0648\u0634\u0631\u064A\u0643 \u0641\u064A \u0628\u0631\u062C \u0627\u0644\u0645\u0644\u0642\u0627"
      },
      {
        id: "own-2",
        nameAr: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0646\u062E\u0628\u0629 \u0644\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0627\u0644\u0639\u0642\u0627\u0631\u064A",
        nameEn: "Al-Nukhbah Real Estate Investment",
        nationalId: "7001928374",
        phone: "0112983300",
        email: "finance@nukhbah.sa",
        iban: "SA1910000041200009182734",
        bankName: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A",
        totalTransferred: 82e3,
        notes: "\u0634\u0631\u064A\u0643 \u0628\u0646\u0633\u0628\u0629 40% \u0641\u064A \u0628\u0631\u062C \u0627\u0644\u0645\u0644\u0642\u0627 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0627\u0644\u0633\u0643\u0646\u064A"
      }
    ],
    vendors: [
      {
        id: "vnd-1",
        nameAr: "\u0645\u0624\u0633\u0633\u0629 \u0646\u0633\u064A\u0645 \u0644\u0644\u062A\u0643\u064A\u064A\u0641 \u0648\u0627\u0644\u062A\u0628\u0631\u064A\u062F",
        nameEn: "Naseem HVAC Services",
        crNumber: "1010928371",
        vatNumber: "310884422100003",
        category: "\u062A\u0643\u064A\u064A\u0641 \u0648\u062A\u0628\u0631\u064A\u062F",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        nationalAddress: "RYDA8821 \xB7 \u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646",
        iban: "SA1910000041200009911220",
        contactPerson: "\u0645. \u0639\u0628\u062F\u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0634\u0645\u0631\u064A",
        phone: "0508819201",
        email: "orders@naseem-hvac.sa",
        rating: 4.8,
        ratingBreakdown: { quality: 4.9, punctuality: 4.8, pricing: 4.6, cooperation: 4.9 },
        avgExecutionDays: 1.5,
        complaintsCount: 0,
        active: true
      },
      {
        id: "vnd-2",
        nameAr: "\u0634\u0631\u0643\u0629 \u0631\u0643\u0627\u0626\u0632 \u0627\u0644\u0633\u0628\u0627\u0643\u0629 \u0648\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621",
        nameEn: "Rakaiz MEP Contracting",
        crNumber: "1010445566",
        vatNumber: "310772233400003",
        category: "\u0633\u0628\u0627\u0643\u0629 \u0648\u0643\u0647\u0631\u0628\u0627\u0621",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        nationalAddress: "RYDM4410 \xB7 \u062D\u064A \u0627\u0644\u0645\u0644\u0642\u0627",
        iban: "SA4480000123608010556677",
        contactPerson: "\u0623\u062D\u0645\u062F \u0628\u0646 \u0635\u0627\u0644\u062D \u0627\u0644\u0632\u0647\u0631\u0627\u0646\u064A",
        phone: "0553312299",
        email: "billing@rakaiz.sa",
        rating: 4.5,
        ratingBreakdown: { quality: 4.7, punctuality: 4.3, pricing: 4.5, cooperation: 4.5 },
        avgExecutionDays: 2.2,
        complaintsCount: 1,
        active: true
      },
      {
        id: "vnd-3",
        nameAr: "\u0645\u0624\u0633\u0633\u0629 \u0625\u0634\u0631\u0627\u0642\u0629 \u0644\u0644\u0646\u0638\u0627\u0641\u0629 \u0648\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0631\u0627\u0641\u0642",
        nameEn: "Ishraqah Facility Care",
        crNumber: "1010778899",
        vatNumber: "310661188200003",
        category: "\u0646\u0638\u0627\u0641\u0629 \u0648\u0635\u064A\u0627\u0646\u0629 \u0639\u0627\u0645\u0629",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        nationalAddress: "RYDO1104 \xB7 \u062D\u064A \u0627\u0644\u0639\u0644\u064A\u0627",
        iban: "SA5520000001928374650011",
        contactPerson: "\u0633\u0639\u062F \u0628\u0646 \u0641\u0647\u062F \u0627\u0644\u0645\u0637\u064A\u0631\u064A",
        phone: "0541129988",
        email: "care@ishraqah.sa",
        rating: 4.7,
        ratingBreakdown: { quality: 4.8, punctuality: 4.7, pricing: 4.6, cooperation: 4.7 },
        avgExecutionDays: 1,
        complaintsCount: 0,
        active: true
      }
    ],
    properties: [
      {
        id: "prop-1",
        companyId: "comp-1",
        ownershipMode: "\u0625\u062F\u0627\u0631\u0629 \u0644\u0644\u063A\u064A\u0631",
        code: "RYD-YAS-01",
        nameAr: "\u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0627\u0644\u0633\u0643\u0646\u064A",
        nameEn: "Al-Yasmin Residential Complex",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        district: "\u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646",
        street: "\u0637\u0631\u064A\u0642 \u0623\u0646\u0633 \u0628\u0646 \u0645\u0627\u0644\u0643",
        nationalAddress: "RYDA7412 \xB7 13325",
        type: "\u0633\u0643\u0646\u064A",
        deedNumber: "410109034821",
        status: "\u0646\u0634\u0637",
        buildingsCount: 2,
        floorsCount: 4,
        managementFeePercent: 5,
        ownerShares: [{ ownerId: "own-1", sharePercent: 100 }],
        electricityMeterMain: "SEC-30918274",
        waterMeterMain: "NWC-8819201",
        caretakerName: "\u0645\u062D\u0645\u062F \u0625\u0642\u0628\u0627\u0644",
        caretakerPhone: "0539011223",
        createdAt: "2025-01-10T08:00:00.000Z"
      },
      {
        id: "prop-2",
        companyId: "comp-2",
        ownershipMode: "\u0645\u0644\u0643\u064A\u0629 \u0645\u0634\u062A\u0631\u0643\u0629",
        code: "RYD-MLQ-02",
        nameAr: "\u0628\u0631\u062C \u0627\u0644\u0645\u0644\u0642\u0627 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0627\u0644\u0633\u0643\u0646\u064A",
        nameEn: "Al-Malqa Mixed-Use Tower",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        district: "\u062D\u064A \u0627\u0644\u0645\u0644\u0642\u0627",
        street: "\u0637\u0631\u064A\u0642 \u0623\u0646\u0633 \u0628\u0646 \u0645\u0627\u0644\u0643 \u062A\u0642\u0627\u0637\u0639 \u0627\u0644\u062E\u064A\u0631",
        nationalAddress: "RYDM3910 \xB7 13524",
        type: "\u0645\u062E\u062A\u0644\u0637",
        deedNumber: "410108991122",
        status: "\u0646\u0634\u0637",
        buildingsCount: 1,
        floorsCount: 6,
        managementFeePercent: 6,
        ownerShares: [
          { ownerId: "own-1", sharePercent: 60 },
          { ownerId: "own-2", sharePercent: 40 }
        ],
        electricityMeterMain: "SEC-99102938",
        waterMeterMain: "NWC-5510291",
        caretakerName: "\u0623\u0634\u0631\u0641 \u0639\u0644\u064A",
        caretakerPhone: "0534455667",
        createdAt: "2025-04-01T08:00:00.000Z"
      }
    ],
    units: [
      {
        id: "unit-101",
        propertyId: "prop-1",
        buildingName: "\u0645\u0628\u0646\u0649 \u0623",
        floor: 1,
        unitNumber: "A-101",
        unitType: "\u0634\u0642\u0629",
        areaSqm: 135,
        rooms: 3,
        bathrooms: 2,
        furnished: false,
        acCount: 4,
        electricityMeter: "E-101-882",
        waterMeter: "W-101-21",
        keyCount: 4,
        acRemoteCount: 4,
        suggestedMonthlyRent: 4e3,
        suggestedAnnualRent: 48e3,
        officeFee: 1200,
        status: "\u0645\u0624\u062C\u0631\u0629",
        notes: "\u0634\u0642\u0629 \u0632\u0627\u0648\u064A\u0629 \u0645\u0637\u0644\u0629 \u0639\u0644\u0649 \u0627\u0644\u062D\u062F\u064A\u0642\u0629 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629"
      },
      {
        id: "unit-102",
        propertyId: "prop-1",
        buildingName: "\u0645\u0628\u0646\u0649 \u0623",
        floor: 1,
        unitNumber: "A-102",
        unitType: "\u0634\u0642\u0629",
        areaSqm: 120,
        rooms: 3,
        bathrooms: 2,
        furnished: true,
        acCount: 4,
        electricityMeter: "E-102-883",
        waterMeter: "W-102-22",
        keyCount: 3,
        acRemoteCount: 4,
        suggestedMonthlyRent: 4500,
        suggestedAnnualRent: 54e3,
        officeFee: 1350,
        status: "\u0645\u062A\u0623\u062E\u0631\u0629 \u0641\u064A \u0627\u0644\u0633\u062F\u0627\u062F",
        notes: "\u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0645\u0637\u0628\u062E \u0631\u0627\u0643\u0628 \u0648\u0645\u0643\u064A\u0641\u0627\u062A \u0633\u0628\u0644\u064A\u062A \u062D\u062F\u064A\u062B\u0629"
      },
      {
        id: "unit-103",
        propertyId: "prop-1",
        buildingName: "\u0645\u0628\u0646\u0649 \u0623",
        floor: 2,
        unitNumber: "A-201",
        unitType: "\u0634\u0642\u0629",
        areaSqm: 110,
        rooms: 2,
        bathrooms: 2,
        furnished: false,
        acCount: 3,
        electricityMeter: "E-201-884",
        waterMeter: "W-201-23",
        keyCount: 3,
        acRemoteCount: 3,
        suggestedMonthlyRent: 3500,
        suggestedAnnualRent: 42e3,
        officeFee: 1050,
        status: "\u0634\u0627\u063A\u0631\u0629",
        vacantSince: "2026-10-20",
        notes: "\u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0645\u0639\u0627\u064A\u0646\u0629 \u0648\u0627\u0644\u062A\u0623\u062C\u064A\u0631 \u0627\u0644\u0641\u0648\u0631\u064A"
      },
      {
        id: "unit-104",
        propertyId: "prop-1",
        buildingName: "\u0645\u0628\u0646\u0649 \u0628",
        floor: 2,
        unitNumber: "B-204",
        unitType: "\u0634\u0642\u0629",
        areaSqm: 140,
        rooms: 4,
        bathrooms: 3,
        furnished: false,
        acCount: 5,
        electricityMeter: "E-204-885",
        waterMeter: "W-204-24",
        keyCount: 5,
        acRemoteCount: 5,
        suggestedMonthlyRent: 4800,
        suggestedAnnualRent: 57600,
        officeFee: 1400,
        status: "\u062A\u062D\u062A \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        notes: "\u064A\u062C\u0631\u064A \u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0645\u0643\u064A\u0641 \u0627\u0644\u0635\u0627\u0644\u0629"
      },
      {
        id: "unit-201",
        propertyId: "prop-2",
        buildingName: "\u0627\u0644\u0628\u0631\u062C \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        floor: 0,
        unitNumber: "S-01",
        unitType: "\u0645\u0639\u0631\u0636 \u062A\u062C\u0627\u0631\u064A",
        areaSqm: 210,
        rooms: 2,
        bathrooms: 2,
        furnished: false,
        acCount: 4,
        electricityMeter: "E-S01-901",
        waterMeter: "W-S01-09",
        keyCount: 2,
        acRemoteCount: 4,
        suggestedMonthlyRent: 1e4,
        suggestedAnnualRent: 12e4,
        officeFee: 3e3,
        status: "\u0645\u0624\u062C\u0631\u0629",
        notes: "\u0648\u0627\u062C\u0647\u0629 \u0632\u062C\u0627\u062C\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0637\u0631\u064A\u0642 \u0627\u0644\u0631\u0626\u064A\u0633\u064A"
      },
      {
        id: "unit-202",
        propertyId: "prop-2",
        buildingName: "\u0627\u0644\u0628\u0631\u062C \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        floor: 3,
        unitNumber: "M-302",
        unitType: "\u0645\u0643\u062A\u0628",
        areaSqm: 95,
        rooms: 3,
        bathrooms: 1,
        furnished: false,
        acCount: 3,
        electricityMeter: "E-302-902",
        waterMeter: "W-302-10",
        keyCount: 3,
        acRemoteCount: 3,
        suggestedMonthlyRent: 4e3,
        suggestedAnnualRent: 48e3,
        officeFee: 1200,
        status: "\u0645\u062D\u062C\u0648\u0632\u0629",
        linkedTenantId: "ten-4",
        notes: "\u0645\u0631\u062A\u0628\u0637 \u0628\u0645\u0633\u062A\u0623\u062C\u0631 \u0625\u062F\u0627\u0631\u064A\u0627\u064B \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0648\u062B\u064A\u0642 \u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631"
      },
      {
        id: "unit-203",
        propertyId: "prop-2",
        buildingName: "\u0627\u0644\u0628\u0631\u062C \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        floor: 4,
        unitNumber: "M-405",
        unitType: "\u0645\u0643\u062A\u0628",
        areaSqm: 85,
        rooms: 2,
        bathrooms: 1,
        furnished: false,
        acCount: 2,
        electricityMeter: "E-405-903",
        waterMeter: "W-405-11",
        keyCount: 2,
        acRemoteCount: 2,
        suggestedMonthlyRent: 3600,
        suggestedAnnualRent: 43200,
        officeFee: 1e3,
        status: "\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u062A\u0646\u0638\u064A\u0641",
        vacantSince: "2026-11-11",
        notes: "\u062A\u0645 \u0625\u062E\u0644\u0627\u0621 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u0627\u0644\u0633\u0627\u0628\u0642 \u0648\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062A\u062C\u0647\u064A\u0632"
      },
      {
        id: "unit-arch-1",
        propertyId: "prop-1",
        buildingName: "\u0645\u0644\u062D\u0642 \u0627\u0644\u0633\u0637\u062D",
        floor: 4,
        unitNumber: "R-401",
        unitType: "\u0627\u0633\u062A\u0648\u062F\u064A\u0648",
        areaSqm: 58,
        rooms: 1,
        bathrooms: 1,
        furnished: false,
        acCount: 1,
        electricityMeter: "E-401-701",
        waterMeter: "W-401-19",
        keyCount: 2,
        acRemoteCount: 1,
        suggestedMonthlyRent: 2200,
        suggestedAnnualRent: 26400,
        officeFee: 700,
        status: "\u0645\u0648\u0642\u0648\u0641\u0629",
        linkedTenantId: "ten-arch-1",
        notes: "\u062A\u0645 \u0625\u062E\u0631\u0627\u062C \u0627\u0644\u0648\u062D\u062F\u0629 \u0645\u0624\u0642\u062A\u0627\u064B \u0644\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A \u0648\u0627\u0644\u062A\u0631\u0645\u064A\u0645 \u0627\u0644\u0634\u0627\u0645\u0644",
        archivedAt: "2026-09-18T11:30:00.000Z",
        archiveReason: "\u0625\u063A\u0644\u0627\u0642 \u0644\u0644\u062A\u0631\u0645\u064A\u0645 \u0648\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0634\u0628\u0643\u0629 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A\u0629",
        archivedBy: "usr-sup",
        archiveMode: "\u064A\u062F\u0648\u064A",
        preArchiveStatus: "\u0634\u0627\u063A\u0631\u0629"
      },
      {
        id: "unit-arch-2",
        propertyId: "prop-2",
        buildingName: "\u0627\u0644\u0628\u0631\u062C \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        floor: 1,
        unitNumber: "M-108",
        unitType: "\u0645\u0643\u062A\u0628",
        areaSqm: 72,
        rooms: 2,
        bathrooms: 1,
        furnished: false,
        acCount: 2,
        electricityMeter: "E-108-799",
        waterMeter: "W-108-05",
        keyCount: 2,
        acRemoteCount: 2,
        suggestedMonthlyRent: 3200,
        suggestedAnnualRent: 38400,
        officeFee: 950,
        status: "\u0645\u0624\u0631\u0634\u0641\u0629",
        linkedTenantId: "ten-arch-2",
        notes: "\u062A\u0645 \u062F\u0645\u062C \u0627\u0644\u0645\u0633\u0627\u062D\u0629 \u0645\u0639 \u0627\u0644\u0645\u0639\u0631\u0636 \u0627\u0644\u0623\u0631\u0636\u064A \u062D\u0633\u0628 \u0642\u0631\u0627\u0631 \u0627\u0644\u0645\u0644\u0627\u0643",
        archivedAt: "2025-12-28T10:00:00.000Z",
        archiveReason: "\u062F\u0645\u062C \u0645\u0639\u0645\u0627\u0631\u064A \u0645\u0639 \u0648\u062D\u062F\u0629 \u0645\u062C\u0627\u0648\u0631\u0629",
        archivedBy: "usr-gm",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0634\u0627\u063A\u0631\u0629"
      }
    ],
    tenants: [
      {
        id: "ten-1",
        nameAr: "\u0628\u0646\u062F\u0631 \u0628\u0646 \u0645\u062D\u0645\u062F \u0627\u0644\u063A\u0627\u0645\u062F\u064A",
        nameEn: "Bandar Al-Ghamdi",
        nationalIdOrIqama: "1088442211",
        nationality: "\u0633\u0639\u0648\u062F\u064A",
        phone: "0551122334",
        altPhone: "0509988771",
        email: "bandar.g@gmail.com",
        employer: "\u0627\u0644\u0647\u064A\u0626\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0644\u0644\u0628\u064A\u0627\u0646\u0627\u062A",
        tenantType: "\u0639\u0627\u0626\u0644\u0629",
        birthDate: "1988-04-12",
        maritalStatus: "\u0645\u062A\u0632\u0648\u062C",
        familyMembersCount: 4,
        emergencyContactName: "\u0645\u062D\u0645\u062F \u0627\u0644\u063A\u0627\u0645\u062F\u064A (\u0627\u0644\u0623\u062E)",
        emergencyContactPhone: "0504411229",
        nationalAddress: "RYDA7412 \xB7 \u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \xB7 \u0627\u0644\u0631\u064A\u0627\u0636",
        classification: "\u0646\u0634\u0637",
        rating: 5,
        behaviorScores: { paymentCommitment: 5, unitCare: 5, cooperation: 5, penaltyTotal: 0 },
        violationNotes: [
          {
            id: "vn-1",
            title: "\u0625\u0634\u0627\u062F\u0629 \u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0627\u0644\u0633\u062F\u0627\u062F \u0627\u0644\u0645\u0628\u0643\u0631",
            category: "\u0625\u0634\u0627\u062F\u0629",
            details: "\u0633\u062F\u062F \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0642\u0628\u0644 \u0645\u0648\u0639\u062F \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u062F\u0648\u0646 \u0623\u064A \u062A\u0623\u062E\u064A\u0631.",
            createdBy: "usr-acc",
            createdAt: "2026-07-14T12:00:00.000Z"
          }
        ],
        onboardingChecklist: {
          idVerified: true,
          docsArchived: true,
          depositPaid: true,
          contractSigned: true,
          ejarRegistered: true,
          handoverSigned: true
        },
        notes: "\u0645\u0633\u062A\u0623\u062C\u0631 \u0645\u0644\u062A\u0632\u0645 \u0628\u0627\u0644\u0633\u062F\u0627\u062F \u0627\u0644\u0645\u0628\u0643\u0631",
        createdAt: "2026-01-12T09:00:00.000Z"
      },
      {
        id: "ten-2",
        nameAr: "\u0637\u0627\u0631\u0642 \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A",
        nameEn: "Tariq Al-Shehri",
        nationalIdOrIqama: "1077331199",
        nationality: "\u0633\u0639\u0648\u062F\u064A",
        phone: "0547788990",
        altPhone: "0558800112",
        email: "tariq.s@yahoo.com",
        employer: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0627\u0644\u0645\u062A\u0642\u062F\u0645\u0629",
        tenantType: "\u0641\u0631\u062F",
        birthDate: "1992-09-21",
        maritalStatus: "\u0623\u0639\u0632\u0628",
        emergencyContactName: "\u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A (\u0627\u0644\u0648\u0627\u0644\u062F)",
        emergencyContactPhone: "0501199882",
        nationalAddress: "RYDA7415 \xB7 \u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \xB7 \u0627\u0644\u0631\u064A\u0627\u0636",
        classification: "\u0646\u0634\u0637",
        rating: 3,
        behaviorScores: { paymentCommitment: 3, unitCare: 4, cooperation: 4, penaltyTotal: 250 },
        violationNotes: [
          {
            id: "vn-2",
            title: "\u062A\u0623\u062E\u0631 \u0641\u064A \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u062B\u0627\u0644\u062B \u0648\u0627\u0644\u0631\u0627\u0628\u0639",
            category: "\u062A\u0623\u062E\u0631 \u0633\u062F\u0627\u062F",
            details: "\u062A\u0645 \u0633\u062F\u0627\u062F 9,000 \u0631.\u0633 \u062C\u0632\u0626\u064A\u0627\u064B \u0645\u0646 \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u062B\u0627\u0644\u062B \u0648\u062C\u0627\u0631\u064D \u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u0645\u062A\u0628\u0642\u064A.",
            createdBy: "usr-acc",
            createdAt: "2026-11-05T10:30:00.000Z"
          }
        ],
        onboardingChecklist: {
          idVerified: true,
          docsArchived: true,
          depositPaid: true,
          contractSigned: true,
          ejarRegistered: true,
          handoverSigned: true
        },
        notes: "\u0644\u062F\u064A\u0647 \u062F\u0641\u0639\u0629 \u062C\u0632\u0626\u064A\u0629 \u0648\u0645\u062A\u0628\u0642\u064D \u0642\u064A\u062F \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629",
        createdAt: "2026-02-01T09:00:00.000Z"
      },
      {
        id: "ten-3",
        nameAr: "\u0645\u0624\u0633\u0633\u0629 \u0645\u0630\u0627\u0642 \u0627\u0644\u0628\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629",
        nameEn: "Mazaq Al-Bun Trading Est.",
        nationalIdOrIqama: "7022119988",
        nationality: "\u0643\u064A\u0627\u0646 \u062A\u062C\u0627\u0631\u064A \u0633\u0639\u0648\u062F\u064A",
        phone: "0502233445",
        altPhone: "0114422990",
        email: "accounts@mazaqbun.sa",
        employer: "\u0633\u062C\u0644 \u062A\u062C\u0627\u0631\u064A 1010554433",
        tenantType: "\u0634\u0631\u0643\u0629",
        emergencyContactName: "\u0648\u0644\u064A\u062F \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A (\u0645\u062F\u064A\u0631 \u0627\u0644\u062A\u0634\u063A\u064A\u0644)",
        emergencyContactPhone: "0559922110",
        nationalAddress: "RYDM3910 \xB7 \u0637\u0631\u064A\u0642 \u0623\u0646\u0633 \u0628\u0646 \u0645\u0627\u0644\u0643 \xB7 \u0627\u0644\u0631\u064A\u0627\u0636",
        classification: "\u0646\u0634\u0637",
        rating: 4,
        behaviorScores: { paymentCommitment: 4, unitCare: 5, cooperation: 4, penaltyTotal: 0 },
        violationNotes: [],
        onboardingChecklist: {
          idVerified: true,
          docsArchived: true,
          depositPaid: true,
          contractSigned: true,
          ejarRegistered: true,
          handoverSigned: true
        },
        notes: "\u0645\u0633\u062A\u0623\u062C\u0631 \u0627\u0644\u0645\u0639\u0631\u0636 \u0627\u0644\u062A\u062C\u0627\u0631\u064A S-01",
        createdAt: "2025-11-20T09:00:00.000Z"
      },
      {
        id: "ten-4",
        nameAr: "\u064A\u0627\u0633\u0631 \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0644\u0647 \u0627\u0644\u0645\u0646\u0635\u0648\u0631",
        nameEn: "Yasser Al-Mansour",
        nationalIdOrIqama: "1099887766",
        nationality: "\u0633\u0639\u0648\u062F\u064A",
        phone: "0564455112",
        email: "yasser.m@domain.sa",
        employer: "\u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0647\u0646\u062F\u0633\u064A\u0629",
        tenantType: "\u0641\u0631\u062F",
        birthDate: "1985-11-02",
        maritalStatus: "\u0645\u062A\u0632\u0648\u062C",
        classification: "\u0645\u062D\u062A\u0645\u0644",
        rating: 4,
        behaviorScores: { paymentCommitment: 4, unitCare: 4, cooperation: 5, penaltyTotal: 0 },
        onboardingChecklist: {
          idVerified: true,
          docsArchived: true,
          depositPaid: false,
          contractSigned: false,
          ejarRegistered: false,
          handoverSigned: false
        },
        notes: "\u0645\u0631\u0628\u0648\u0637 \u0625\u062F\u0627\u0631\u064A\u0627\u064B \u0628\u0627\u0644\u0645\u0643\u062A\u0628 M-302 \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u0639\u0642\u062F \u0641\u064A \u0625\u064A\u062C\u0627\u0631",
        createdAt: "2026-11-10T11:00:00.000Z"
      },
      {
        id: "ten-arch-1",
        nameAr: "\u062E\u0627\u0644\u062F \u0628\u0646 \u0633\u0639\u0648\u062F \u0627\u0644\u0639\u0644\u064A\u0627\u0646",
        nameEn: "Khalid Al-Olayan",
        nationalIdOrIqama: "1055667788",
        nationality: "\u0633\u0639\u0648\u062F\u064A",
        phone: "0557711223",
        email: "khalid.olayan@gmail.com",
        employer: "\u0634\u0631\u0643\u0629 \u0633\u0627\u0628\u0643 \u0644\u0644\u062A\u0642\u0646\u064A\u0629",
        tenantType: "\u0641\u0631\u062F",
        maritalStatus: "\u0623\u0639\u0632\u0628",
        classification: "\u0633\u0627\u0628\u0642",
        rating: 5,
        behaviorScores: { paymentCommitment: 5, unitCare: 5, cooperation: 5, penaltyTotal: 0 },
        notes: "\u0633\u062F\u062F \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0642\u0628\u0644 \u0645\u0648\u0639\u062F\u0647\u0627 \u0648\u0623\u0633\u0644\u0645 \u0627\u0644\u0648\u062D\u062F\u0629 R-401 \u0628\u062D\u0627\u0644\u0629 \u0645\u0645\u062A\u0627\u0632\u0629",
        createdAt: "2024-10-01T08:00:00.000Z",
        archivedAt: "2026-09-15T14:00:00.000Z",
        archiveReason: "\u0627\u0646\u062A\u0647\u0627\u0621 \u0645\u062F\u0629 \u0627\u0644\u0639\u0642\u062F \u0648\u0627\u0644\u0625\u062E\u0644\u0627\u0621 \u0627\u0644\u0646\u0638\u0627\u0645\u064A \u0628\u0646\u062C\u0627\u062D",
        archivedBy: "usr-lease",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0646\u0634\u0637"
      },
      {
        id: "ten-arch-2",
        nameAr: "\u0645\u0624\u0633\u0633\u0629 \u0623\u0641\u0642 \u0627\u0644\u0631\u064A\u0627\u0636 \u0644\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A",
        nameEn: "Ofoq Riyadh Consulting Est.",
        nationalIdOrIqama: "7008822114",
        nationality: "\u0643\u064A\u0627\u0646 \u062A\u062C\u0627\u0631\u064A \u0633\u0639\u0648\u062F\u064A",
        phone: "0508822199",
        email: "admin@ofoq-sa.com",
        employer: "\u0633\u062C\u0644 \u062A\u062C\u0627\u0631\u064A 1010449922",
        tenantType: "\u0634\u0631\u0643\u0629",
        classification: "\u0633\u0627\u0628\u0642",
        rating: 2,
        behaviorScores: { paymentCommitment: 2, unitCare: 3, cooperation: 2, penaltyTotal: 1200 },
        notes: "\u062A\u0623\u062E\u0631 \u0645\u062A\u0643\u0631\u0631 \u0641\u064A \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0623\u062E\u064A\u0631 \u0648\u062A\u0645\u062A \u062A\u0633\u0648\u064A\u0629 \u0627\u0644\u0625\u062E\u0644\u0627\u0621 \u0645\u0639 \u062E\u0635\u0645 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0645\u0646 \u0627\u0644\u062A\u0623\u0645\u064A\u0646",
        createdAt: "2024-11-15T09:00:00.000Z",
        archivedAt: "2025-12-20T16:10:00.000Z",
        archiveReason: "\u0625\u062E\u0644\u0627\u0621 \u0628\u0639\u062F \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0639\u0642\u062F \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0645\u0639 \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u062A\u0623\u062E\u0631 \u0633\u062F\u0627\u062F",
        archivedBy: "usr-acc",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0646\u0634\u0637"
      }
    ],
    leads: [
      {
        id: "lead-1",
        nameAr: "\u0641\u064A\u0635\u0644 \u0628\u0646 \u0646\u0627\u0635\u0631 \u0627\u0644\u0632\u0647\u0631\u0627\u0646\u064A",
        phone: "0558899112",
        email: "faisal.z@outlook.sa",
        nationalIdOrIqama: "1088442211",
        birthDate: "1991-06-14",
        tenantType: "\u0639\u0627\u0626\u0644\u0629",
        familyMembersCount: 4,
        source: "\u0645\u0646\u0635\u0629 \u0639\u0642\u0627\u0631",
        propertyId: "prop-1",
        unitId: "unit-103",
        offeredRent: 41e3,
        paymentFrequency: "\u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
        officeFee: 1e3,
        earlyTerminationFee: 2e3,
        budgetMonthly: 3500,
        roomsRequired: 3,
        preferredArea: "\u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646",
        moveInDate: "2026-12-01",
        viewingDate: "2026-11-16",
        viewingResult: "\u0623\u0628\u062F\u0649 \u0631\u063A\u0628\u0629 \u062C\u062F\u064A\u0629 \u0648\u0637\u0644\u0628 \u062F\u0641\u0639\u062A\u064A\u0646",
        status: "\u0639\u0631\u0636 \u0633\u0639\u0631",
        approvalState: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629",
        rating: 5,
        assignedTo: "usr-lease",
        notes: "\u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0644\u062A\u0632\u0645 \u0648\u0645\u064A\u0632\u0627\u0646\u064A\u062A\u0647 \u0645\u0646\u0627\u0633\u0628\u0629\u060C \u0623\u0646\u0635\u062D \u0628\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629",
        createdAt: "2026-11-12T10:15:00.000Z",
        updatedAt: "2026-11-14T09:20:00.000Z",
        interactions: [
          {
            id: "lint-1",
            type: "visit",
            direction: "inbound",
            summary: "\u062A\u0645\u062A \u0645\u0639\u0627\u064A\u0646\u0629 \u0648\u062D\u062F\u0629 A-103 \u0648\u0623\u0628\u062F\u0649 \u0631\u063A\u0628\u0629 \u062C\u0627\u062F\u0629 \u0628\u0627\u0644\u062A\u0639\u0627\u0642\u062F",
            actorName: "\u0631\u064A\u0645 \u0627\u0644\u062D\u0631\u0628\u064A",
            createdAt: "2026-11-13T16:30:00.000Z"
          },
          {
            id: "lint-2",
            type: "escalation",
            direction: "outbound",
            summary: "\u0625\u0631\u0633\u0627\u0644 \u0628\u0637\u0627\u0642\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0647\u062A\u0645 \u0644\u0644\u0645\u0627\u0644\u0643 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0627\u0644\u0631\u0627\u062C\u062D\u064A \u0644\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
            actorName: "\u0631\u064A\u0645 \u0627\u0644\u062D\u0631\u0628\u064A",
            createdAt: "2026-11-14T09:20:00.000Z"
          }
        ]
      },
      {
        id: "lead-2",
        nameAr: "\u062F. \u0646\u0648\u0631\u0629 \u0628\u0646\u062A \u0641\u0647\u062F \u0627\u0644\u0633\u0627\u0644\u0645",
        phone: "0503344119",
        email: "dr.noura@clinic.sa",
        nationalIdOrIqama: "1044991123",
        birthDate: "1988-03-22",
        tenantType: "\u0634\u0631\u0643\u0629",
        companyCrNumber: "1010558899",
        source: "\u0632\u064A\u0627\u0631\u0629 \u0645\u0628\u0627\u0634\u0631\u0629",
        propertyId: "prop-2",
        unitId: "unit-203",
        offeredRent: 43200,
        paymentFrequency: "\u0633\u0646\u0648\u064A",
        officeFee: 1500,
        earlyTerminationFee: 3e3,
        budgetMonthly: 3800,
        roomsRequired: 2,
        preferredArea: "\u062D\u064A \u0627\u0644\u0645\u0644\u0642\u0627",
        moveInDate: "2026-11-25",
        viewingDate: "2026-11-18",
        status: "\u062C\u062F\u064A\u062F",
        approvalState: "\u0644\u0645 \u064A\u064F\u0631\u0633\u0644",
        rating: 4,
        assignedTo: "usr-lease",
        notes: "\u062A\u0628\u062D\u062B \u0639\u0646 \u0645\u0643\u062A\u0628 \u0625\u062F\u0627\u0631\u064A \u062C\u0627\u0647\u0632 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u0642\u0627\u062F\u0645",
        createdAt: "2026-11-14T08:00:00.000Z",
        updatedAt: "2026-11-14T08:00:00.000Z",
        interactions: [
          {
            id: "lint-3",
            type: "call",
            direction: "inbound",
            summary: "\u0627\u062A\u0635\u0627\u0644 \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0639\u0646 \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0625\u062F\u0627\u0631\u064A B-203 \u0648\u062D\u062C\u0632 \u0645\u0648\u0639\u062F \u0645\u0639\u0627\u064A\u0646\u0629",
            actorName: "\u0631\u064A\u0645 \u0627\u0644\u062D\u0631\u0628\u064A",
            createdAt: "2026-11-14T08:05:00.000Z"
          }
        ]
      }
    ],
    leadEscalations: [
      {
        id: "lesc-1",
        requestCode: "ESC-2026-001",
        leadId: "lead-1",
        propertyId: "prop-1",
        unitId: "unit-103",
        recipientType: "owner",
        recipientId: "own-1",
        recipientName: "\u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0628\u0646 \u0645\u062D\u0645\u062F \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        recipientPhone: "0559812200",
        recipientEmail: "a.rajhi@outlook.sa",
        channel: "\u0648\u0627\u062A\u0633\u0627\u0628",
        status: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629",
        priority: "\u0639\u0627\u062C\u0644",
        employeeNotes: "\u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0644\u062A\u0632\u0645 \u0648\u0645\u064A\u0632\u0627\u0646\u064A\u062A\u0647 \u0645\u0646\u0627\u0633\u0628\u0629\u060C \u0623\u0646\u0635\u062D \u0628\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u062F\u0641\u0639 \u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
        token: "tok-esc-2026-001",
        tokenExpiresAt: "2026-11-17T09:20:00.000Z",
        snapshot: {
          companyName: "\u0634\u0631\u0643\u0629 \u062F\u0627\u0631 \u0627\u0644\u0623\u0641\u0642 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643 \u0648\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A",
          propertyName: "\u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0627\u0644\u0633\u0643\u0646\u064A",
          unitNumber: "A-103",
          leadName: "\u0641\u064A\u0635\u0644 \u0628\u0646 \u0646\u0627\u0635\u0631 \u0627\u0644\u0632\u0647\u0631\u0627\u0646\u064A",
          nationalIdOrIqama: "1088442211",
          hasIdPhoto: false,
          birthDate: "1991-06-14",
          phone: "0558899112",
          rentAmount: 41e3,
          paymentFrequency: "\u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
          officeFee: 1e3,
          earlyTerminationFee: 2e3,
          employeeNotes: "\u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0644\u062A\u0632\u0645 \u0648\u0645\u064A\u0632\u0627\u0646\u064A\u062A\u0647 \u0645\u0646\u0627\u0633\u0628\u0629\u060C \u0623\u0646\u0635\u062D \u0628\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u062F\u0641\u0639 \u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
          registrationDate: "2026-11-12",
          registrationSource: "\u0645\u0646\u0635\u0629 \u0639\u0642\u0627\u0631"
        },
        createdBy: "usr-lease",
        createdByName: "\u0631\u064A\u0645 \u0627\u0644\u062D\u0631\u0628\u064A",
        createdAt: "2026-11-14T09:20:00.000Z"
      }
    ],
    contracts: [
      {
        id: "ctr-1",
        internalNumber: "CNT-2026-001",
        ejarNumber: "EJ-1049283711",
        ejarStatus: "\u0645\u0648\u062B\u0642 \u0641\u064A \u0625\u064A\u062C\u0627\u0631",
        ejarPortalUrl: "https://ejar.sa/contracts/EJ-1049283711",
        lifecycleStatus: "\u0646\u0634\u0637",
        propertyId: "prop-1",
        unitId: "unit-101",
        tenantId: "ten-1",
        startDate: "2026-01-15",
        endDate: "2027-01-14",
        handoverDate: "2026-01-15",
        occupancyStartDate: "2026-01-15",
        occupancyStatus: "\u0646\u0634\u0637",
        keysDeliveredCount: 4,
        remotesDeliveredCount: 4,
        annualRent: 48e3,
        paymentFrequency: "\u0646\u0635\u0641 \u0633\u0646\u0648\u064A",
        installmentsCount: 2,
        securityDeposit: 3e3,
        officeFee: 1200,
        earlyTerminationFee: 4e3,
        managementCommissionPercent: 5,
        includedServices: "\u0627\u0644\u0645\u064A\u0627\u0647 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629 \u0644\u0644\u0639\u0645\u0627\u0631\u0629",
        version: 1,
        createdBy: "usr-lease",
        createdAt: "2026-01-14T10:00:00.000Z"
      },
      {
        id: "ctr-2",
        internalNumber: "CNT-2026-002",
        ejarNumber: "EJ-1049289922",
        ejarStatus: "\u0645\u0648\u062B\u0642 \u0641\u064A \u0625\u064A\u062C\u0627\u0631",
        ejarPortalUrl: "https://ejar.sa/contracts/EJ-1049289922",
        lifecycleStatus: "\u0646\u0634\u0637",
        propertyId: "prop-1",
        unitId: "unit-102",
        tenantId: "ten-2",
        startDate: "2026-02-01",
        endDate: "2026-12-10",
        handoverDate: "2026-02-01",
        occupancyStartDate: "2026-02-01",
        occupancyStatus: "\u0646\u0634\u0637",
        keysDeliveredCount: 3,
        remotesDeliveredCount: 4,
        annualRent: 54e3,
        paymentFrequency: "\u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
        installmentsCount: 4,
        securityDeposit: 4e3,
        officeFee: 1350,
        earlyTerminationFee: 4500,
        managementCommissionPercent: 5,
        includedServices: "\u0634\u0627\u0645\u0644 \u0627\u0644\u0645\u064A\u0627\u0647 \u0641\u0642\u0637",
        version: 1,
        createdBy: "usr-lease",
        createdAt: "2026-02-01T10:00:00.000Z",
        notes: "\u0642\u0631\u064A\u0628 \u0645\u0646 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 - \u064A\u062D\u062A\u0627\u062C \u0645\u062A\u0627\u0628\u0639\u0629 \u062A\u062C\u062F\u064A\u062F \u0642\u0628\u0644 30 \u064A\u0648\u0645\u0627\u064B"
      },
      {
        id: "ctr-3",
        internalNumber: "CNT-2025-019",
        ejarNumber: "EJ-1048112233",
        ejarStatus: "\u0645\u0648\u062B\u0642 \u0641\u064A \u0625\u064A\u062C\u0627\u0631",
        ejarPortalUrl: "https://ejar.sa/contracts/EJ-1048112233",
        lifecycleStatus: "\u0646\u0634\u0637",
        propertyId: "prop-2",
        unitId: "unit-201",
        tenantId: "ten-3",
        startDate: "2025-12-01",
        endDate: "2026-11-30",
        handoverDate: "2025-12-01",
        occupancyStartDate: "2025-12-01",
        occupancyStatus: "\u0646\u0634\u0637",
        keysDeliveredCount: 2,
        remotesDeliveredCount: 4,
        annualRent: 12e4,
        paymentFrequency: "\u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
        installmentsCount: 4,
        securityDeposit: 1e4,
        officeFee: 3e3,
        earlyTerminationFee: 15e3,
        managementCommissionPercent: 6,
        includedServices: "\u0628\u062F\u0648\u0646 \u062E\u062F\u0645\u0627\u062A",
        version: 1,
        createdBy: "usr-lease",
        createdAt: "2025-11-28T10:00:00.000Z",
        notes: "\u0639\u0642\u062F \u062A\u062C\u0627\u0631\u064A \u0642\u0631\u064A\u0628 \u0645\u0646 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 \u062E\u0644\u0627\u0644 16 \u064A\u0648\u0645\u0627\u064B"
      },
      {
        id: "ctr-arch-1",
        internalNumber: "CNT-2025-008",
        ejarNumber: "EJ-1047001122",
        ejarStatus: "\u0645\u0648\u062B\u0642 \u0641\u064A \u0625\u064A\u062C\u0627\u0631",
        lifecycleStatus: "\u0645\u0646\u062A\u0647\u064D \u0628\u0627\u0644\u0625\u062E\u0644\u0627\u0621",
        propertyId: "prop-1",
        unitId: "unit-arch-1",
        tenantId: "ten-arch-1",
        startDate: "2025-09-15",
        endDate: "2026-09-14",
        annualRent: 26400,
        paymentFrequency: "\u0646\u0635\u0641 \u0633\u0646\u0648\u064A",
        installmentsCount: 2,
        securityDeposit: 2e3,
        officeFee: 700,
        managementCommissionPercent: 5,
        includedServices: "\u0627\u0644\u0645\u064A\u0627\u0647 \u0641\u0642\u0637",
        version: 1,
        createdBy: "usr-lease",
        createdAt: "2025-09-10T10:00:00.000Z",
        notes: "\u0623\u064F\u062E\u0644\u064A\u062A \u0627\u0644\u0648\u062D\u062F\u0629 R-401 \u0628\u062A\u0633\u0648\u064A\u0629 \u062A\u0623\u0645\u064A\u0646 \u0643\u0627\u0645\u0644\u0629",
        archivedAt: "2026-09-15T14:00:00.000Z",
        archiveReason: "\u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0645\u062F\u0629 \u0648\u0625\u062E\u0644\u0627\u0621 \u0633\u0644\u064A\u0645",
        archivedBy: "usr-lease",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0646\u0634\u0637"
      },
      {
        id: "ctr-arch-2",
        internalNumber: "CNT-2025-003",
        ejarNumber: "EJ-1046552211",
        ejarStatus: "\u0645\u0648\u062B\u0642 \u0641\u064A \u0625\u064A\u062C\u0627\u0631",
        lifecycleStatus: "\u0645\u0646\u062A\u0647\u064A",
        propertyId: "prop-2",
        unitId: "unit-arch-2",
        tenantId: "ten-arch-2",
        startDate: "2024-12-20",
        endDate: "2025-12-19",
        annualRent: 38400,
        paymentFrequency: "\u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
        installmentsCount: 4,
        securityDeposit: 3500,
        officeFee: 950,
        managementCommissionPercent: 6,
        includedServices: "\u0628\u062F\u0648\u0646 \u062E\u062F\u0645\u0627\u062A",
        version: 1,
        createdBy: "usr-lease",
        createdAt: "2024-12-15T09:30:00.000Z",
        notes: "\u0639\u0642\u062F \u0645\u0643\u062A\u0628 \u0633\u0627\u0628\u0642 \u0627\u0646\u062A\u0647\u0649 \u0648\u062F\u0645\u062C\u062A \u0627\u0644\u0648\u062D\u062F\u0629 \u0641\u064A \u062E\u0637\u0629 \u0627\u0644\u062A\u0648\u0633\u0639\u0629",
        archivedAt: "2025-12-20T16:10:00.000Z",
        archiveReason: "\u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0639\u0642\u062F \u0627\u0644\u0645\u0627\u0644\u064A \u0644\u0639\u0627\u0645 2025",
        archivedBy: "usr-gm",
        archiveMode: "\u0645\u062C\u062F\u0648\u0644",
        preArchiveStatus: "\u0646\u0634\u0637"
      },
      {
        id: "ctr-arch-3",
        internalNumber: "CNT-2026-000",
        ejarNumber: "EJ-1049000912",
        ejarStatus: "\u063A\u064A\u0631 \u0645\u0648\u062B\u0642",
        lifecycleStatus: "\u0645\u0644\u063A\u064A",
        propertyId: "prop-1",
        unitId: "unit-103",
        tenantId: "ten-arch-1",
        startDate: "2026-10-01",
        endDate: "2027-09-30",
        annualRent: 42e3,
        paymentFrequency: "\u0646\u0635\u0641 \u0633\u0646\u0648\u064A",
        installmentsCount: 2,
        securityDeposit: 3e3,
        officeFee: 1050,
        managementCommissionPercent: 5,
        includedServices: "\u0627\u0644\u0645\u064A\u0627\u0647 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        version: 1,
        createdBy: "usr-lease",
        createdAt: "2026-09-25T13:00:00.000Z",
        notes: "\u0623\u0644\u063A\u064A \u0642\u0628\u0644 \u0627\u0644\u062A\u0648\u062B\u064A\u0642 \u0644\u062A\u0639\u062F\u064A\u0644 \u0631\u063A\u0628\u0629 \u0627\u0644\u0639\u0645\u064A\u0644 \u0644\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u0623\u0631\u0636\u064A\u0629",
        archivedAt: "2026-09-29T17:00:00.000Z",
        archiveReason: "\u0625\u0644\u063A\u0627\u0621 \u0642\u0628\u0644 \u0627\u0644\u062A\u0641\u0639\u064A\u0644 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0644\u0637\u0631\u0641\u064A\u0646",
        archivedBy: "usr-lease",
        archiveMode: "\u064A\u062F\u0648\u064A",
        preArchiveStatus: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062A\u0648\u062B\u064A\u0642"
      }
    ],
    handovers: [
      {
        id: "hnd-1",
        contractId: "ctr-1",
        unitId: "unit-101",
        propertyId: "prop-1",
        type: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0639\u0646\u062F \u0627\u0644\u062A\u0623\u062C\u064A\u0631",
        date: "2026-01-15",
        inspectorId: "usr-sup",
        keysReturned: 4,
        acRemotesReturned: 4,
        electricityReading: "14220",
        waterReading: "318",
        checklist: [
          { item: "\u0627\u0644\u0623\u0628\u0648\u0627\u0628 \u0648\u0627\u0644\u0623\u0642\u0641\u0627\u0644", status: "\u0633\u0644\u064A\u0645" },
          { item: "\u0627\u0644\u0645\u0643\u064A\u0641\u0627\u062A \u0648\u0627\u0644\u0631\u064A\u0645\u0648\u062A\u0627\u062A", status: "\u0633\u0644\u064A\u0645" },
          { item: "\u0627\u0644\u0625\u0646\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D", status: "\u0633\u0644\u064A\u0645" },
          { item: "\u0627\u0644\u0633\u0628\u0627\u0643\u0629 \u0648\u0627\u0644\u0646\u0638\u0627\u0641\u0629", status: "\u0633\u0644\u064A\u0645" }
        ],
        damageCost: 0,
        unpaidRentDue: 0,
        depositHeld: 3e3,
        netRefundOrDue: 3e3,
        approvedBy: "usr-gm",
        status: "\u0645\u0639\u062A\u0645\u062F",
        createdAt: "2026-01-15T12:00:00.000Z"
      }
    ],
    installments: [
      {
        id: "inst-1",
        contractId: "ctr-1",
        unitId: "unit-101",
        propertyId: "prop-1",
        tenantId: "ten-1",
        installmentNumber: 1,
        dueDate: "2026-01-15",
        amount: 24e3,
        paidAmount: 24e3,
        remainingAmount: 0,
        lastPaymentDate: "2026-01-15",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-2",
        contractId: "ctr-1",
        unitId: "unit-101",
        propertyId: "prop-1",
        tenantId: "ten-1",
        installmentNumber: 2,
        dueDate: "2026-07-15",
        amount: 24e3,
        paidAmount: 24e3,
        remainingAmount: 0,
        lastPaymentDate: "2026-07-14",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-3",
        contractId: "ctr-2",
        unitId: "unit-102",
        propertyId: "prop-1",
        tenantId: "ten-2",
        installmentNumber: 1,
        dueDate: "2026-02-01",
        amount: 13500,
        paidAmount: 13500,
        remainingAmount: 0,
        lastPaymentDate: "2026-02-01",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-4",
        contractId: "ctr-2",
        unitId: "unit-102",
        propertyId: "prop-1",
        tenantId: "ten-2",
        installmentNumber: 2,
        dueDate: "2026-05-01",
        amount: 13500,
        paidAmount: 13500,
        remainingAmount: 0,
        lastPaymentDate: "2026-05-03",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-5",
        contractId: "ctr-2",
        unitId: "unit-102",
        propertyId: "prop-1",
        tenantId: "ten-2",
        installmentNumber: 3,
        dueDate: "2026-08-01",
        amount: 13500,
        paidAmount: 9e3,
        remainingAmount: 4500,
        lastPaymentDate: "2026-08-12",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u062C\u0632\u0626\u064A\u0627\u064B"
      },
      {
        id: "inst-6",
        contractId: "ctr-2",
        unitId: "unit-102",
        propertyId: "prop-1",
        tenantId: "ten-2",
        installmentNumber: 4,
        dueDate: "2026-11-01",
        amount: 13500,
        paidAmount: 0,
        remainingAmount: 13500,
        status: "\u0645\u062A\u0623\u062E\u0631\u0629"
      },
      {
        id: "inst-7",
        contractId: "ctr-3",
        unitId: "unit-201",
        propertyId: "prop-2",
        tenantId: "ten-3",
        installmentNumber: 1,
        dueDate: "2025-12-01",
        amount: 3e4,
        paidAmount: 3e4,
        remainingAmount: 0,
        lastPaymentDate: "2025-12-01",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-8",
        contractId: "ctr-3",
        unitId: "unit-201",
        propertyId: "prop-2",
        tenantId: "ten-3",
        installmentNumber: 2,
        dueDate: "2026-03-01",
        amount: 3e4,
        paidAmount: 3e4,
        remainingAmount: 0,
        lastPaymentDate: "2026-03-01",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-9",
        contractId: "ctr-3",
        unitId: "unit-201",
        propertyId: "prop-2",
        tenantId: "ten-3",
        installmentNumber: 3,
        dueDate: "2026-06-01",
        amount: 3e4,
        paidAmount: 3e4,
        remainingAmount: 0,
        lastPaymentDate: "2026-06-02",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-10",
        contractId: "ctr-3",
        unitId: "unit-201",
        propertyId: "prop-2",
        tenantId: "ten-3",
        installmentNumber: 4,
        dueDate: "2026-11-14",
        amount: 3e4,
        paidAmount: 0,
        remainingAmount: 3e4,
        status: "\u0645\u0633\u062A\u062D\u0642\u0629 \u0627\u0644\u064A\u0648\u0645"
      }
    ],
    payments: [
      {
        id: "pay-1",
        receiptNumber: "RCP-2026-0001",
        idempotencyKey: "seed-pay-1",
        contractId: "ctr-1",
        unitId: "unit-101",
        propertyId: "prop-1",
        tenantId: "ten-1",
        allocations: [{ installmentId: "inst-2", amount: 24e3 }],
        amount: 24e3,
        paymentMethod: "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        paymentType: "\u0625\u064A\u062C\u0627\u0631",
        referenceNumber: "TRN-9920184",
        receivedBy: "usr-acc",
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        status: "\u0645\u0639\u062A\u0645\u062F",
        createdAt: "2026-07-14T11:20:00.000Z"
      },
      {
        id: "pay-2",
        receiptNumber: "RCP-2026-0002",
        idempotencyKey: "seed-pay-2",
        contractId: "ctr-2",
        unitId: "unit-102",
        propertyId: "prop-1",
        tenantId: "ten-2",
        allocations: [{ installmentId: "inst-5", amount: 9e3 }],
        amount: 9e3,
        paymentMethod: "\u0634\u0628\u0643\u0629 \u0645\u062F\u0649",
        paymentType: "\u0625\u064A\u062C\u0627\u0631",
        referenceNumber: "POS-441022",
        receivedBy: "usr-acc",
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        status: "\u0645\u0639\u062A\u0645\u062F",
        notes: "\u0633\u062F\u0627\u062F \u062C\u0632\u0626\u064A \u0644\u0644\u062F\u0641\u0639\u0629 \u0627\u0644\u062B\u0627\u0644\u062B\u0629 - \u0627\u0644\u0645\u062A\u0628\u0642\u064A 4,500 \u0631.\u0633",
        createdAt: "2026-08-12T15:40:00.000Z"
      },
      {
        id: "pay-3",
        receiptNumber: "RCP-2026-0003",
        idempotencyKey: "seed-pay-3",
        contractId: "ctr-3",
        unitId: "unit-201",
        propertyId: "prop-2",
        tenantId: "ten-3",
        allocations: [{ installmentId: "inst-9", amount: 3e4 }],
        amount: 3e4,
        paymentMethod: "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        paymentType: "\u0625\u064A\u062C\u0627\u0631",
        referenceNumber: "TRN-7712900",
        receivedBy: "usr-acc",
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        status: "\u0645\u0639\u062A\u0645\u062F",
        createdAt: "2026-06-02T09:10:00.000Z"
      },
      {
        id: "pay-arch-1",
        receiptNumber: "RCP-2025-0084",
        idempotencyKey: "seed-pay-arch-1",
        contractId: "ctr-arch-2",
        unitId: "unit-arch-2",
        propertyId: "prop-2",
        tenantId: "ten-arch-2",
        allocations: [],
        amount: 9600,
        paymentMethod: "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        paymentType: "\u0625\u064A\u062C\u0627\u0631",
        referenceNumber: "TRN-5519002",
        receivedBy: "usr-acc",
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        status: "\u0645\u0639\u062A\u0645\u062F",
        notes: "\u062F\u0641\u0639\u0629 \u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0631\u0628\u0639 \u0627\u0644\u0623\u062E\u064A\u0631 \u0644\u0639\u0627\u0645 2025 (\u0645\u0642\u0641\u0644\u0629 \u0636\u0645\u0646 \u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0645\u0646\u062A\u0647\u064A\u0629)",
        createdAt: "2025-09-20T10:15:00.000Z",
        archivedAt: "2026-01-05T02:00:00.000Z",
        archiveReason: "\u0625\u0642\u0641\u0627\u0644 \u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 2025",
        archivedBy: "usr-acc",
        archiveMode: "\u0645\u062C\u062F\u0648\u0644",
        preArchiveStatus: "\u0645\u0639\u062A\u0645\u062F"
      },
      {
        id: "pay-arch-2",
        receiptNumber: "RCP-2026-0000",
        idempotencyKey: "seed-pay-arch-2",
        contractId: "ctr-1",
        unitId: "unit-101",
        propertyId: "prop-1",
        tenantId: "ten-1",
        allocations: [],
        amount: 24e3,
        paymentMethod: "\u0634\u064A\u0643",
        paymentType: "\u0625\u064A\u062C\u0627\u0631",
        referenceNumber: "CHK-88120",
        receivedBy: "usr-acc",
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        status: "\u0645\u0639\u0643\u0648\u0633",
        reversedByReceiptId: "REV-2026-0001",
        reversalReason: "\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639 \u0645\u0646 \u0634\u064A\u0643 \u0625\u0644\u0649 \u062D\u0648\u0627\u0644\u0629 \u0628\u0646\u0643\u064A\u0629 \u0641\u0648\u0631\u064A\u0629",
        notes: "\u0639\u064F\u0643\u0633 \u0628\u0642\u064A\u062F \u0645\u062D\u0627\u0633\u0628\u064A \u0645\u0637\u0627\u0628\u0642",
        createdAt: "2026-07-13T12:00:00.000Z",
        archivedAt: "2026-07-13T13:15:00.000Z",
        archiveReason: "\u0633\u0646\u062F \u0645\u0639\u0643\u0648\u0633 \u0645\u062D\u0627\u0633\u0628\u064A\u0627\u064B",
        archivedBy: "usr-acc",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0645\u0639\u062A\u0645\u062F"
      }
    ],
    accounts: [
      { id: "acc-1010", code: "1010", nameAr: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A / \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A", nameEn: "Operating Bank Account", type: "\u0623\u0635\u0648\u0644", balance: 215e3 },
      { id: "acc-1020", code: "1020", nameAr: "\u0627\u0644\u0635\u0646\u062F\u0648\u0642 \u0627\u0644\u0646\u0642\u062F\u064A", nameEn: "Petty Cash", type: "\u0623\u0635\u0648\u0644", balance: 12500 },
      { id: "acc-1200", code: "1200", nameAr: "\u0630\u0645\u0645 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631\u064A\u0646", nameEn: "Tenant Receivables", type: "\u0623\u0635\u0648\u0644", balance: 48e3 },
      { id: "acc-2100", code: "2100", nameAr: "\u0627\u0644\u062A\u0623\u0645\u064A\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0644\u0645\u0629", nameEn: "Security Deposits Held", type: "\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A", balance: 17e3 },
      { id: "acc-2200", code: "2200", nameAr: "\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u0643 (\u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u0643)", nameEn: "Owners Payable", type: "\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A", balance: 158400 },
      { id: "acc-2300", code: "2300", nameAr: "\u0630\u0645\u0645 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0648\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u064A\u0646", nameEn: "Vendors Payable", type: "\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A", balance: 1850 },
      { id: "acc-4100", code: "4100", nameAr: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0639\u0645\u0648\u0644\u0629 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643", nameEn: "Property Management Commission", type: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A", balance: 11250 },
      { id: "acc-4200", code: "4200", nameAr: "\u0639\u0645\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u0623\u062C\u064A\u0631 \u0648\u0627\u0644\u0633\u0639\u064A", nameEn: "Leasing & Brokerage Fees", type: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A", balance: 5550 },
      { id: "acc-5100", code: "5100", nameAr: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0648\u0627\u0644\u0625\u0635\u0644\u0627\u062D", nameEn: "Maintenance & Repairs Expense", type: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A", balance: 3400 },
      { id: "acc-5200", code: "5200", nameAr: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0648\u0627\u0644\u0645\u064A\u0627\u0647 \u0648\u0627\u0644\u062A\u0634\u063A\u064A\u0644", nameEn: "Utilities & Operations Expense", type: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A", balance: 2150 }
    ],
    journals: [
      {
        id: "jrn-1",
        entryNumber: "JRN-2026-0001",
        date: "2026-07-14",
        description: "\u062A\u062D\u0635\u064A\u0644 \u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0648\u062D\u062F\u0629 A-101 \u0628\u0645\u0648\u062C\u0628 \u0633\u0646\u062F RCP-2026-0001 \u0648\u062A\u0648\u0632\u064A\u0639 \u0639\u0645\u0648\u0644\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 5%",
        referenceType: "\u062A\u062D\u0635\u064A\u0644",
        referenceId: "pay-1",
        propertyId: "prop-1",
        ownerId: "own-1",
        createdBy: "usr-acc",
        lines: [
          { accountId: "acc-1010", accountName: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A / \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A", debit: 24e3, credit: 0 },
          { accountId: "acc-2200", accountName: "\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u0643 (\u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u0643)", debit: 0, credit: 22800 },
          { accountId: "acc-4100", accountName: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0639\u0645\u0648\u0644\u0629 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643", debit: 0, credit: 1200 }
        ]
      },
      {
        id: "jrn-2",
        entryNumber: "JRN-2026-0002",
        date: "2026-08-12",
        description: "\u062A\u062D\u0635\u064A\u0644 \u062F\u0641\u0639\u0629 \u062C\u0632\u0626\u064A\u0629 \u0644\u0644\u0648\u062D\u062F\u0629 A-102 \u0628\u0645\u0648\u062C\u0628 \u0633\u0646\u062F RCP-2026-0002",
        referenceType: "\u062A\u062D\u0635\u064A\u0644",
        referenceId: "pay-2",
        propertyId: "prop-1",
        ownerId: "own-1",
        createdBy: "usr-acc",
        lines: [
          { accountId: "acc-1010", accountName: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A / \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A", debit: 9e3, credit: 0 },
          { accountId: "acc-2200", accountName: "\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u0643 (\u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u0643)", debit: 0, credit: 8550 },
          { accountId: "acc-4100", accountName: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0639\u0645\u0648\u0644\u0629 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643", debit: 0, credit: 450 }
        ]
      }
    ],
    expenses: [
      {
        id: "exp-1",
        expenseNumber: "EXP-2026-0001",
        date: "2026-10-28",
        category: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644",
        subCategory: "\u0643\u0647\u0631\u0628\u0627\u0621 \u0645\u0634\u0627\u0639\u0627\u062A",
        propertyId: "prop-1",
        invoiceNumber: "INV-SEC-88120",
        amount: 1450,
        vatAmount: 189.13,
        netAmount: 1260.87,
        paymentMethod: "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        paidFromAccount: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A (SNB)",
        paymentStatus: "\u0645\u062F\u0641\u0648\u0639 \u0628\u0627\u0644\u0643\u0627\u0645\u0644",
        paidAmount: 1450,
        remainingAmount: 0,
        bearer: "\u0627\u0644\u0645\u0627\u0644\u0643",
        approvalStatus: "\u0645\u0639\u062A\u0645\u062F",
        approvedBySupervisor: "usr-sup",
        approvedByManager: "usr-gm",
        zatcaQrVerified: true,
        createdBy: "usr-sup",
        notes: "\u0641\u0627\u062A\u0648\u0631\u0629 \u0643\u0647\u0631\u0628\u0627\u0621 \u0627\u0644\u0645\u0645\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0635\u0639\u062F \u0627\u0644\u0634\u0647\u0631\u064A\u0629 \u0644\u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646",
        createdAt: "2026-10-28T09:30:00.000Z"
      },
      {
        id: "exp-2",
        expenseNumber: "EXP-2026-0002",
        date: "2026-11-12",
        category: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        subCategory: "\u062A\u0643\u064A\u064A\u0641 \u0648\u062A\u0628\u0631\u064A\u062F",
        propertyId: "prop-1",
        unitId: "unit-104",
        vendorId: "vnd-1",
        ticketId: "tkt-1",
        invoiceNumber: "INV-NAS-4410",
        amount: 1850,
        vatAmount: 241.3,
        netAmount: 1608.7,
        paymentMethod: "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        paidFromAccount: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A (SNB)",
        paymentStatus: "\u0644\u0645 \u064A\u064F\u062F\u0641\u0639",
        paidAmount: 0,
        remainingAmount: 1850,
        dueDate: "2026-11-20",
        bearer: "\u0627\u0644\u0645\u0627\u0644\u0643",
        approvalStatus: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u062F\u064A\u0631",
        approvedBySupervisor: "usr-sup",
        approvedByDeptManager: "usr-mm",
        zatcaQrVerified: true,
        createdBy: "usr-tech",
        notes: "\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0645\u0643\u064A\u0641 \u0633\u0628\u0644\u064A\u062A \u0627\u0644\u0635\u0627\u0644\u0629 - \u062A\u0645\u062A \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0634\u0631\u0641 \u0648\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u062F\u064A\u0631",
        createdAt: "2026-11-12T14:20:00.000Z"
      },
      {
        id: "exp-3",
        expenseNumber: "EXP-2026-0003",
        date: "2026-11-13",
        category: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644",
        subCategory: "\u0646\u0638\u0627\u0641\u0629 \u0639\u0627\u0645\u0629",
        propertyId: "prop-2",
        unitId: "unit-203",
        vendorId: "vnd-3",
        invoiceNumber: "INV-ISH-902",
        amount: 420,
        vatAmount: 54.78,
        netAmount: 365.22,
        paymentMethod: "\u0646\u0642\u062F\u064A",
        paidFromAccount: "\u0627\u0644\u0635\u0646\u062F\u0648\u0642 \u0627\u0644\u0646\u0642\u062F\u064A",
        paymentStatus: "\u0644\u0645 \u064A\u064F\u062F\u0641\u0639",
        paidAmount: 0,
        remainingAmount: 420,
        dueDate: "2026-11-18",
        bearer: "\u0627\u0644\u0645\u0627\u0644\u0643",
        approvalStatus: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0634\u0631\u0641",
        createdBy: "usr-lease",
        notes: "\u062A\u0646\u0638\u064A\u0641 \u0634\u0627\u0645\u0644 \u0648\u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0645\u0643\u062A\u0628 M-405 \u0628\u0639\u062F \u0627\u0644\u0625\u062E\u0644\u0627\u0621",
        createdAt: "2026-11-13T11:00:00.000Z"
      }
    ],
    supplierInvoices: [
      {
        id: "sinv-1",
        invoiceCode: "SINV-2026-001",
        supplierInvoiceNumber: "NAS-2026-4410",
        invoiceDate: "2026-11-12",
        receivedDate: "2026-11-12",
        dueDate: "2026-11-25",
        vendorId: "vnd-1",
        propertyId: "prop-1",
        unitId: "unit-104",
        ticketId: "tkt-1",
        items: [
          { id: "si-1", description: "\u062A\u0648\u0631\u064A\u062F \u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0633\u0628\u0644\u064A\u062A 24,000 \u0648\u062D\u062F\u0629 \u0623\u0635\u0644\u064A", quantity: 1, unitPrice: 1300, total: 1300 },
          { id: "si-2", description: "\u0623\u062C\u0648\u0631 \u0641\u0643 \u0648\u062A\u0631\u0643\u064A\u0628 \u0648\u062A\u0639\u0628\u0626\u0629 \u0641\u0631\u064A\u0648\u0646 410A", quantity: 1, unitPrice: 308.7, total: 308.7 }
        ],
        subtotal: 1608.7,
        vatAmount: 241.3,
        totalAmount: 1850,
        paidAmount: 0,
        remainingAmount: 1850,
        currency: "SAR",
        status: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F",
        zatcaQrVerified: true,
        zatcaQrData: "ZATCA|310884422100003|2026-11-12|1850.00|241.30",
        notes: "\u0636\u0645\u0627\u0646 12 \u0634\u0647\u0631\u0627\u064B \u0639\u0644\u0649 \u0627\u0644\u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0648\u0627\u0644\u062A\u0631\u0643\u064A\u0628",
        createdBy: "usr-mm",
        createdAt: "2026-11-12T14:25:00.000Z"
      },
      {
        id: "sinv-2",
        invoiceCode: "SINV-2026-002",
        supplierInvoiceNumber: "RKZ-2026-1182",
        invoiceDate: "2026-11-05",
        receivedDate: "2026-11-06",
        dueDate: "2026-11-12",
        vendorId: "vnd-2",
        propertyId: "prop-2",
        items: [
          { id: "si-3", description: "\u0635\u064A\u0627\u0646\u0629 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0648\u062A\u063A\u064A\u064A\u0631 \u0642\u0648\u0627\u0637\u0639 \u0627\u0644\u0645\u0645\u0631\u0627\u062A", quantity: 2, unitPrice: 950, total: 1900 },
          { id: "si-4", description: "\u0641\u062D\u0635 \u0645\u0636\u062E\u0627\u062A \u0627\u0644\u0645\u064A\u0627\u0647 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629", quantity: 1, unitPrice: 600, total: 600 }
        ],
        subtotal: 2500,
        vatAmount: 375,
        totalAmount: 2875,
        paidAmount: 1500,
        remainingAmount: 1375,
        currency: "SAR",
        status: "\u0645\u062A\u0623\u062E\u0631\u0629",
        zatcaQrVerified: true,
        zatcaQrData: "ZATCA|310772233400003|2026-11-05|2875.00|375.00",
        notes: "\u0633\u064F\u062F\u062F\u062A \u062F\u0641\u0639\u0629 \u0623\u0648\u0644\u0649 1,500 \u0631.\u0633 \u0648\u0645\u062A\u0628\u0642\u064A 1,375 \u0631.\u0633",
        createdBy: "usr-acc",
        approvedBy: "usr-gm",
        createdAt: "2026-11-06T09:15:00.000Z"
      }
    ],
    recurringExpenses: [
      {
        id: "rexp-1",
        title: "\u0643\u0647\u0631\u0628\u0627\u0621 \u0627\u0644\u0645\u0634\u0627\u0639\u0627\u062A \u0648\u0627\u0644\u0645\u0635\u0627\u0639\u062F \u0627\u0644\u0634\u0647\u0631\u064A\u0629",
        category: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644",
        subCategory: "\u0643\u0647\u0631\u0628\u0627\u0621 \u0645\u0634\u0627\u0639\u0627\u062A",
        propertyId: "prop-1",
        estimatedAmount: 1450,
        currency: "SAR",
        bearer: "\u0627\u0644\u0645\u0627\u0644\u0643",
        frequency: "\u0634\u0647\u0631\u064A",
        dayOfMonth: 28,
        enabled: true,
        lastGeneratedMonth: "2026-10",
        createdBy: "usr-acc",
        createdAt: "2026-01-01T08:00:00.000Z"
      },
      {
        id: "rexp-2",
        title: "\u0639\u0642\u062F \u0627\u0644\u0646\u0638\u0627\u0641\u0629 \u0627\u0644\u062F\u0648\u0631\u064A\u0629 \u0644\u0644\u0645\u0645\u0631\u0627\u062A \u0648\u0627\u0644\u0648\u0627\u062C\u0647\u0629",
        category: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644",
        subCategory: "\u0646\u0638\u0627\u0641\u0629 \u0639\u0627\u0645\u0629",
        propertyId: "prop-2",
        vendorId: "vnd-3",
        estimatedAmount: 1800,
        currency: "SAR",
        bearer: "\u0627\u0644\u0645\u0627\u0644\u0643",
        frequency: "\u0634\u0647\u0631\u064A",
        dayOfMonth: 5,
        enabled: true,
        lastGeneratedMonth: "2026-10",
        createdBy: "usr-sup",
        createdAt: "2026-02-01T08:00:00.000Z"
      }
    ],
    propertyBudgets: [
      {
        id: "pbdg-1",
        propertyId: "prop-1",
        month: "2026-11",
        monthlyLimitSar: 5e3,
        alertThresholdPercent: 80,
        blockAt100Percent: false,
        updatedBy: "usr-gm",
        updatedAt: "2026-11-01T08:00:00.000Z"
      },
      {
        id: "pbdg-2",
        propertyId: "prop-2",
        month: "2026-11",
        monthlyLimitSar: 8e3,
        alertThresholdPercent: 80,
        blockAt100Percent: false,
        updatedBy: "usr-gm",
        updatedAt: "2026-11-01T08:00:00.000Z"
      }
    ],
    assets: [
      {
        id: "ast-1",
        propertyId: "prop-1",
        unitId: "unit-104",
        name: "\u0645\u0643\u064A\u0641 \u0633\u0628\u0644\u064A\u062A \u062C\u0631\u064A 24 \u0623\u0644\u0641 \u0648\u062D\u062F\u0629 - \u0627\u0644\u0635\u0627\u0644\u0629",
        category: "\u062A\u0643\u064A\u064A\u0641 \u0648\u062A\u0628\u0631\u064A\u062F",
        serialNumber: "GREE-24K-882910",
        brand: "Gree",
        purchaseDate: "2025-02-15",
        warrantyExpiry: "2027-02-15",
        condition: "\u064A\u062D\u062A\u0627\u062C \u0635\u064A\u0627\u0646\u0629"
      },
      {
        id: "ast-2",
        propertyId: "prop-1",
        unitId: "unit-101",
        name: "\u0633\u062E\u0627\u0646 \u0645\u064A\u0627\u0647 \u062E\u0632\u0641 \u0633\u0639\u0648\u062F\u064A 80 \u0644\u062A\u0631",
        category: "\u0633\u0628\u0627\u0643\u0629",
        serialNumber: "SH-80L-119283",
        brand: "\u0627\u0644\u062E\u0632\u0641 \u0627\u0644\u0633\u0639\u0648\u062F\u064A",
        purchaseDate: "2025-06-10",
        warrantyExpiry: "2028-06-10",
        condition: "\u0645\u0645\u062A\u0627\u0632"
      }
    ],
    tickets: [
      {
        id: "tkt-1",
        ticketNumber: "MNT-2026-001",
        propertyId: "prop-1",
        unitId: "unit-104",
        source: "\u0627\u0644\u0645\u0634\u0631\u0641",
        category: "\u062A\u0643\u064A\u064A\u0641 \u0648\u062A\u0628\u0631\u064A\u062F",
        priority: "\u0639\u0627\u062C\u0644",
        title: "\u062A\u0648\u0642\u0641 \u0627\u0644\u062A\u0628\u0631\u064A\u062F \u0641\u064A \u0645\u0643\u064A\u0641 \u0627\u0644\u0635\u0627\u0644\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        description: "\u0627\u0644\u0645\u0643\u064A\u0641 \u064A\u0639\u0645\u0644 \u0645\u0631\u0648\u062D\u0629 \u0641\u0642\u0637 \u0645\u0639 \u0635\u0648\u062A \u0637\u0642\u0637\u0642\u0629 \u0645\u0646 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629.",
        assignedTo: "usr-tech",
        vendorId: "vnd-1",
        scheduledDate: "2026-11-14",
        diagnosis: "\u062A\u0644\u0641 \u0641\u064A \u0636\u0627\u063A\u0637 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629 \u0648\u064A\u062D\u062A\u0627\u062C \u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u062C\u062F\u064A\u062F \u0645\u0634\u0645\u0648\u0644 \u0628\u0639\u0631\u0636 \u0627\u0644\u0633\u0639\u0631",
        estimatedCost: 1850,
        actualCost: 1850,
        status: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u0643\u0644\u0641\u0629",
        assetId: "ast-1",
        linkedExpenseId: "exp-2",
        linkedTaskId: "tsk-1",
        createdBy: "usr-sup",
        createdAt: "2026-11-11T09:00:00.000Z",
        updatedAt: "2026-11-12T14:20:00.000Z"
      },
      {
        id: "tkt-2",
        ticketNumber: "MNT-2026-002",
        propertyId: "prop-1",
        unitId: "unit-102",
        tenantId: "ten-2",
        source: "\u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631",
        category: "\u0633\u0628\u0627\u0643\u0629",
        priority: "\u0645\u0631\u062A\u0641\u0639",
        title: "\u062A\u0633\u0631\u0628 \u0645\u064A\u0627\u0647 \u0623\u0633\u0641\u0644 \u0645\u063A\u0633\u0644\u0629 \u0627\u0644\u0645\u0637\u0628\u062E",
        description: "\u0623\u0628\u0644\u063A \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u0639\u0646 \u062A\u0633\u0631\u0628 \u0645\u064A\u0627\u0647 \u062E\u0641\u064A\u0641 \u0639\u0646\u062F \u0641\u062A\u062D \u062E\u0644\u0627\u0637 \u0627\u0644\u0645\u0637\u0628\u062E.",
        assignedTo: "usr-tech",
        scheduledDate: "2026-11-15",
        estimatedCost: 280,
        actualCost: 0,
        status: "\u062A\u0645 \u0627\u0644\u0625\u0633\u0646\u0627\u062F",
        linkedTaskId: "tsk-2",
        createdBy: "usr-sup",
        createdAt: "2026-11-13T16:15:00.000Z",
        updatedAt: "2026-11-13T17:00:00.000Z"
      },
      {
        id: "tkt-arch-1",
        ticketNumber: "MNT-2026-000",
        propertyId: "prop-1",
        unitId: "unit-101",
        tenantId: "ten-1",
        source: "\u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631",
        category: "\u0643\u0647\u0631\u0628\u0627\u0621",
        priority: "\u0645\u062A\u0648\u0633\u0637",
        title: "\u062A\u0628\u062F\u064A\u0644 \u0642\u0627\u0637\u0639 \u0643\u0647\u0631\u0628\u0627\u0621 \u0627\u0644\u0645\u0637\u0628\u062E \u0627\u0644\u0631\u0626\u064A\u0633\u064A 32 \u0623\u0645\u0628\u064A\u0631",
        description: "\u0641\u0635\u0644 \u0645\u062A\u0643\u0631\u0631 \u0644\u0644\u0642\u0627\u0637\u0639 \u0639\u0646\u062F \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0641\u0631\u0646 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A.",
        assignedTo: "usr-tech",
        vendorId: "vnd-2",
        scheduledDate: "2026-08-05",
        diagnosis: "\u0636\u0639\u0641 \u0646\u0642\u0627\u0637 \u0627\u0644\u062A\u0644\u0627\u0645\u0633 \u0641\u064A \u0627\u0644\u0642\u0627\u0637\u0639 \u0627\u0644\u0642\u062F\u064A\u0645 \u0648\u062A\u0645 \u0627\u0633\u062A\u0628\u062F\u0627\u0644\u0647 \u0628\u0642\u0627\u0637\u0639 \u0634\u0646\u0627\u064A\u062F\u0631 \u0623\u0635\u0644\u064A",
        estimatedCost: 300,
        actualCost: 260,
        status: "\u0645\u063A\u0644\u0642",
        rating: 5,
        beforeNote: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u062A\u0638\u0647\u0631 \u0633\u062E\u0648\u0646\u0629 \u0641\u064A \u0627\u0644\u0642\u0627\u0637\u0639 \u0631\u0642\u0645 4",
        afterNote: "\u062A\u0645 \u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0648\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0623\u062D\u0645\u0627\u0644 \u0628\u0646\u062C\u0627\u062D \u062E\u0644\u0627\u0644 45 \u062F\u0642\u064A\u0642\u0629",
        createdBy: "usr-sup",
        createdAt: "2026-08-04T10:00:00.000Z",
        updatedAt: "2026-08-05T12:15:00.000Z",
        archivedAt: "2026-08-06T09:00:00.000Z",
        archiveReason: "\u0628\u0644\u0627\u063A \u0645\u0646\u062C\u0632 \u0648\u0645\u063A\u0644\u0642 \u0628\u062A\u0642\u064A\u064A\u0645 5/5",
        archivedBy: "usr-sup",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630"
      }
    ],
    tasks: [
      {
        id: "tsk-1",
        title: "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0639\u062A\u0645\u0627\u062F \u0648\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0634\u0642\u0629 B-204",
        description: "\u0631\u0641\u0639 \u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0639\u0631\u0636 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0645\u0646 \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u062B\u0645 \u062A\u0648\u062B\u064A\u0642 \u0635\u0648\u0631 \u0642\u0628\u0644 \u0648\u0628\u0639\u062F",
        type: "\u0635\u064A\u0627\u0646\u0629",
        propertyId: "prop-1",
        unitId: "unit-104",
        assignedTo: "usr-tech",
        createdBy: "usr-sup",
        dueDate: "2026-11-15",
        priority: "\u0639\u0627\u062C\u0644",
        status: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629",
        checklist: [
          { text: "\u0641\u062D\u0635 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629 \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0639\u0637\u0644", done: true },
          { text: "\u0625\u0635\u062F\u0627\u0631 \u0639\u0631\u0636 \u0633\u0639\u0631 \u0648\u0631\u0641\u0639 \u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0635\u064A\u0627\u0646\u0629", done: true },
          { text: "\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0648\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u062A\u0631\u0643\u064A\u0628", done: false }
        ],
        comments: [
          {
            id: "cmt-1",
            authorName: "\u0639\u0645\u0631 \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A",
            text: "\u062A\u0645 \u0641\u062D\u0635 \u0627\u0644\u062C\u0647\u0627\u0632 \u0648\u0627\u0644\u062C\u0647\u0627\u0632 \u062A\u062D\u062A \u0627\u0644\u0636\u0645\u0627\u0646 \u0627\u0644\u062C\u0632\u0626\u064A\u060C \u062A\u0645 \u0631\u0641\u0639 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0644\u0644\u0645\u0634\u0631\u0641.",
            createdAt: "2026-11-12T14:25:00.000Z"
          }
        ],
        linkedTicketId: "tkt-1",
        createdAt: "2026-11-11T09:10:00.000Z"
      },
      {
        id: "tsk-2",
        title: "\u0645\u0639\u0627\u0644\u062C\u0629 \u062A\u0633\u0631\u0628 \u0645\u063A\u0633\u0644\u0629 \u0634\u0642\u0629 A-102",
        description: "\u0632\u064A\u0627\u0631\u0629 \u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u0648\u062A\u0628\u062F\u064A\u0644 \u0644\u064A \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u062C\u0644\u062F.",
        type: "\u0635\u064A\u0627\u0646\u0629",
        propertyId: "prop-1",
        unitId: "unit-102",
        assignedTo: "usr-tech",
        createdBy: "usr-sup",
        dueDate: "2026-11-15",
        priority: "\u0645\u0631\u062A\u0641\u0639",
        status: "\u0645\u0633\u0646\u062F\u0629",
        checklist: [
          { text: "\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u0644\u062A\u0623\u0643\u064A\u062F \u0645\u0648\u0639\u062F \u0627\u0644\u062F\u062E\u0648\u0644", done: true },
          { text: "\u0625\u0635\u0644\u0627\u062D \u0627\u0644\u062A\u0633\u0631\u0628 \u0648\u062A\u0635\u0648\u064A\u0631 \u0627\u0644\u0646\u062A\u064A\u062C\u0629", done: false }
        ],
        comments: [],
        linkedTicketId: "tkt-2",
        createdAt: "2026-11-13T17:00:00.000Z"
      },
      {
        id: "tsk-3",
        title: "\u0645\u062A\u0627\u0628\u0639\u0629 \u062A\u062D\u0635\u064A\u0644 \u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0627\u062A \u0644\u0644\u0648\u062D\u062F\u0629 A-102 \u0648\u062A\u062C\u062F\u064A\u062F \u0639\u0642\u062F S-01",
        description: "\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u0637\u0627\u0631\u0642 \u0627\u0644\u0634\u0647\u0631\u064A \u0644\u0633\u062F\u0627\u062F 18,000 \u0631.\u0633 \u0627\u0644\u0645\u062A\u0628\u0642\u064A\u0629\u060C \u0648\u062A\u062C\u0647\u064A\u0632 \u0639\u0631\u0636 \u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0645\u0639\u0631\u0636 \u0627\u0644\u062A\u062C\u0627\u0631\u064A.",
        type: "\u062A\u062D\u0635\u064A\u0644 \u0625\u064A\u062C\u0627\u0631",
        propertyId: "prop-1",
        unitId: "unit-102",
        assignedTo: "usr-acc",
        createdBy: "usr-gm",
        dueDate: "2026-11-14",
        priority: "\u0639\u0627\u062C\u0644",
        status: "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630",
        checklist: [
          { text: "\u0625\u0631\u0633\u0627\u0644 \u062A\u0630\u0643\u064A\u0631 \u0633\u062F\u0627\u062F \u0631\u0633\u0645\u064A \u0639\u0628\u0631 \u0627\u0644\u0642\u0648\u0627\u0644\u0628", done: true },
          { text: "\u062A\u062D\u0635\u064A\u0644 \u0627\u0644\u062F\u0641\u0639\u0629 \u0648\u0625\u0635\u062F\u0627\u0631 \u0633\u0646\u062F \u0627\u0644\u0642\u0628\u0636", done: false }
        ],
        comments: [],
        createdAt: "2026-11-13T08:00:00.000Z"
      },
      {
        id: "tsk-4",
        title: "\u062A\u0648\u062B\u064A\u0642 \u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 \u0644\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0645\u062D\u062C\u0648\u0632 M-302",
        description: "\u0627\u0644\u0639\u0645\u064A\u0644 \u064A\u0627\u0633\u0631 \u0627\u0644\u0645\u0646\u0635\u0648\u0631 \u0645\u0631\u0628\u0648\u0637 \u0628\u0627\u0644\u0648\u062D\u062F\u0629 \u0625\u062F\u0627\u0631\u064A\u0627\u064B - \u064A\u062C\u0628 \u0627\u0633\u062A\u0643\u0645\u0627\u0644 \u0627\u0644\u062A\u0648\u062B\u064A\u0642 \u0641\u064A \u0625\u064A\u062C\u0627\u0631 \u0642\u0628\u0644 \u0627\u0644\u062A\u0641\u0639\u064A\u0644.",
        type: "\u062A\u062C\u062F\u064A\u062F \u0639\u0642\u062F",
        propertyId: "prop-2",
        unitId: "unit-202",
        assignedTo: "usr-lease",
        createdBy: "usr-lease",
        dueDate: "2026-11-16",
        priority: "\u0645\u062A\u0648\u0633\u0637",
        status: "\u062C\u062F\u064A\u062F\u0629",
        checklist: [
          { text: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0647\u0648\u064A\u0629 \u0648\u0627\u0644\u0633\u062C\u0644", done: true },
          { text: "\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0639\u0642\u062F \u0641\u064A \u0625\u064A\u062C\u0627\u0631 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0631\u0633\u0645\u064A", done: false }
        ],
        comments: [],
        createdAt: "2026-11-14T08:30:00.000Z"
      },
      {
        id: "tsk-arch-1",
        title: "\u0641\u062D\u0635 \u0648\u0645\u0639\u0627\u064A\u0646\u0629 \u0625\u062E\u0644\u0627\u0621 \u0627\u0644\u0627\u0633\u062A\u0648\u062F\u064A\u0648 R-401",
        description: "\u062C\u0631\u062F \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D \u0648\u0627\u0644\u0631\u064A\u0645\u0648\u062A\u0627\u062A \u0648\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0639\u062F\u0627\u062F\u0627\u062A \u0642\u0628\u0644 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0623\u0633\u064A\u0633",
        type: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0625\u062E\u0644\u0627\u0621",
        propertyId: "prop-1",
        unitId: "unit-arch-1",
        assignedTo: "usr-sup",
        createdBy: "usr-lease",
        dueDate: "2026-09-15",
        priority: "\u0645\u062A\u0648\u0633\u0637",
        status: "\u0645\u0643\u062A\u0645\u0644\u0629",
        checklist: [
          { text: "\u0627\u0633\u062A\u0644\u0627\u0645 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D \u0648\u0627\u0644\u0631\u064A\u0645\u0648\u062A\u0627\u062A", done: true },
          { text: "\u062A\u0648\u062B\u064A\u0642 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0648\u0627\u0644\u0645\u064A\u0627\u0647", done: true }
        ],
        comments: [],
        createdAt: "2026-09-14T09:00:00.000Z",
        archivedAt: "2026-09-16T02:00:00.000Z",
        archiveReason: "\u0645\u0647\u0645\u0629 \u0645\u0646\u062C\u0632\u0629 \u0648\u0645\u0624\u0631\u0634\u0641\u0629",
        archivedBy: "usr-sup",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0645\u0643\u062A\u0645\u0644\u0629"
      }
    ],
    communications: [
      {
        id: "com-1",
        targetType: "\u0645\u0633\u062A\u0623\u062C\u0631",
        targetId: "ten-2",
        targetName: "\u0637\u0627\u0631\u0642 \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A",
        channel: "\u0631\u0633\u0627\u0644\u0629 \u0646\u0635\u064A\u0629 / \u0648\u0627\u062A\u0633\u0627\u0628",
        templateUsed: "\u0637\u0644\u0628 \u0633\u062F\u0627\u062F \u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0627\u062A",
        language: "ar",
        summary: "\u062A\u0630\u0643\u064A\u0631 \u0628\u0633\u062F\u0627\u062F \u0627\u0644\u0645\u062A\u0628\u0642\u064A \u0645\u0646 \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u062B\u0627\u0644\u062B (4,500 \u0631.\u0633) \u0648\u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0631\u0627\u0628\u0639 \u0627\u0644\u0645\u0633\u062A\u062D\u0642 (13,500 \u0631.\u0633).",
        sentBy: "usr-acc",
        createdAt: "2026-11-13T10:30:00.000Z"
      },
      {
        id: "com-2",
        targetType: "\u0645\u0633\u062A\u0623\u062C\u0631",
        targetId: "ten-3",
        targetName: "\u0645\u0624\u0633\u0633\u0629 \u0645\u0630\u0627\u0642 \u0627\u0644\u0628\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629",
        channel: "\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
        templateUsed: "\u062A\u0630\u0643\u064A\u0631 \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0648\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0639\u0642\u062F",
        language: "ar",
        summary: "\u0625\u0634\u0639\u0627\u0631 \u0628\u0642\u0631\u0628 \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0639\u0642\u062F EJ-1048112233 \u0628\u062A\u0627\u0631\u064A\u062E 2026-11-30 \u0648\u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0627\u0644\u062F\u0641\u0639\u0629 \u0627\u0644\u0631\u0627\u0628\u0639\u0629.",
        sentBy: "usr-lease",
        createdAt: "2026-11-14T09:00:00.000Z"
      }
    ],
    documents: [
      {
        id: "doc-1",
        title: "\u0635\u0643 \u0645\u0644\u0643\u064A\u0629 \u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0627\u0644\u0633\u0643\u0646\u064A",
        category: "\u0635\u0643\u0648\u0643",
        fileName: "deed-410109034821.pdf",
        fileType: "PDF",
        fileSizeKb: 1420,
        relatedType: "\u0639\u0642\u0627\u0631",
        relatedId: "prop-1",
        version: 1,
        uploadedBy: "usr-gm",
        ocrStatus: "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0622\u0644\u064A\u0627\u064B",
        ocrExtracted: {
          docType: "\u0635\u0643 \u0645\u0644\u0643\u064A\u0629",
          propertyNameAr: "\u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0627\u0644\u0633\u0643\u0646\u064A",
          deedNumber: "410109034821",
          city: "\u0627\u0644\u0631\u064A\u0627\u0636",
          district: "\u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646",
          rawText: "\u0635\u0643 \u0645\u0644\u0643\u064A\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0631\u0642\u0645 410109034821 - \u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0631\u064A\u0627\u0636 - \u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 - \u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0627\u0644\u0633\u0643\u0646\u064A",
          confidenceNote: "\u062A\u0645\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629 \u0645\u0639 \u0633\u062C\u0644 \u0627\u0644\u0635\u0643\u0648\u0643"
        },
        accessLog: [
          {
            id: "dacc-1",
            userId: "usr-gm",
            userName: "\u0633\u0639\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
            deviceName: "MacBook Pro \xB7 \u0645\u0643\u062A\u0628 \u0627\u0644\u0625\u062F\u0627\u0631\u0629",
            action: "\u0645\u0639\u0627\u064A\u0646\u0629",
            accessedAt: "2026-11-10T09:15:00.000Z"
          }
        ],
        createdAt: "2025-01-10T09:00:00.000Z"
      },
      {
        id: "doc-2",
        title: "\u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u0648\u062D\u062F - \u0628\u0646\u062F\u0631 \u0627\u0644\u063A\u0627\u0645\u062F\u064A (A-101)",
        category: "\u0639\u0642\u0648\u062F \u0625\u064A\u062C\u0627\u0631",
        fileName: "ejar-EJ-1049283711.pdf",
        fileType: "PDF",
        fileSizeKb: 890,
        relatedType: "\u0639\u0642\u062F",
        relatedId: "ctr-1",
        expiryDate: "2027-01-14",
        version: 1,
        uploadedBy: "usr-lease",
        ocrStatus: "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0622\u0644\u064A\u0627\u064B",
        ocrExtracted: {
          docType: "\u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631",
          tenantNameAr: "\u0628\u0646\u062F\u0631 \u0628\u0646 \u0645\u062D\u0645\u062F \u0627\u0644\u063A\u0627\u0645\u062F\u064A",
          nationalIdOrIqama: "1088442211",
          ejarNumber: "EJ-1049283711",
          unitNumber: "A-101",
          startDate: "2026-01-15",
          endDate: "2027-01-14",
          annualRent: 48e3,
          currency: "SAR",
          rawText: "\u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 \u0645\u0648\u062D\u062F \u0631\u0642\u0645 EJ-1049283711 - \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631: \u0628\u0646\u062F\u0631 \u0628\u0646 \u0645\u062D\u0645\u062F \u0627\u0644\u063A\u0627\u0645\u062F\u064A - \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0633\u0646\u0648\u064A: 48,000 \u0631.\u0633"
        },
        accessLog: [],
        createdAt: "2026-01-14T10:15:00.000Z"
      },
      {
        id: "doc-3",
        title: "\u0641\u0627\u062A\u0648\u0631\u0629 \u0635\u064A\u0627\u0646\u0629 \u0645\u0643\u064A\u0641 B-204 - \u0645\u0624\u0633\u0633\u0629 \u0646\u0633\u064A\u0645",
        category: "\u0641\u0648\u0627\u062A\u064A\u0631",
        fileName: "INV-NAS-4410.pdf",
        fileType: "PDF",
        fileSizeKb: 315,
        relatedType: "\u0645\u0635\u0631\u0648\u0641",
        relatedId: "exp-2",
        version: 1,
        uploadedBy: "usr-tech",
        ocrStatus: "\u0644\u0645 \u064A\u064F\u062D\u0644\u0644",
        accessLog: [],
        createdAt: "2026-11-12T14:20:00.000Z"
      },
      {
        id: "doc-4",
        title: "\u0635\u0648\u0631\u0629 \u0647\u0648\u064A\u0629 \u0648\u0637\u0646\u064A\u0629 - \u0637\u0627\u0631\u0642 \u0627\u0644\u0634\u0647\u0631\u064A (A-102)",
        category: "\u0647\u0648\u064A\u0627\u062A \u0648\u0625\u0642\u0627\u0645\u0627\u062A",
        fileName: "id-1077331199.jpg",
        fileType: "JPG",
        fileSizeKb: 420,
        relatedType: "\u0645\u0633\u062A\u0623\u062C\u0631",
        relatedId: "ten-2",
        expiryDate: "2026-12-05",
        version: 1,
        uploadedBy: "usr-lease",
        ocrStatus: "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0622\u0644\u064A\u0627\u064B",
        ocrExtracted: {
          docType: "\u0647\u0648\u064A\u0629 / \u0625\u0642\u0627\u0645\u0629",
          tenantNameAr: "\u0637\u0627\u0631\u0642 \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A",
          nationalIdOrIqama: "1077331199",
          nationality: "\u0633\u0639\u0648\u062F\u064A",
          expiryDate: "2026-12-05",
          rawText: "\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0647\u0648\u064A\u0629 \u0627\u0644\u0648\u0637\u0646\u064A\u0629 - \u0627\u0644\u0627\u0633\u0645: \u0637\u0627\u0631\u0642 \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A - \u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629: 1077331199 - \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621: 2026-12-05"
        },
        accessLog: [],
        createdAt: "2026-02-01T09:10:00.000Z"
      },
      {
        id: "doc-arch-1",
        title: "\u0647\u0648\u064A\u0629 \u0648\u0637\u0646\u064A\u0629 \u0645\u0646\u062A\u0647\u064A\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 - \u062E\u0627\u0644\u062F \u0627\u0644\u0639\u0644\u064A\u0627\u0646 (R-401)",
        category: "\u0647\u0648\u064A\u0627\u062A \u0648\u0625\u0642\u0627\u0645\u0627\u062A",
        fileName: "id-1055667788-expired.pdf",
        fileType: "PDF",
        fileSizeKb: 380,
        relatedType: "\u0645\u0633\u062A\u0623\u062C\u0631",
        relatedId: "ten-arch-1",
        expiryDate: "2026-06-30",
        version: 1,
        uploadedBy: "usr-lease",
        ocrStatus: "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0622\u0644\u064A\u0627\u064B",
        ocrExtracted: {
          docType: "\u0647\u0648\u064A\u0629 / \u0625\u0642\u0627\u0645\u0629",
          tenantNameAr: "\u062E\u0627\u0644\u062F \u0628\u0646 \u0633\u0639\u0648\u062F \u0627\u0644\u0639\u0644\u064A\u0627\u0646",
          nationalIdOrIqama: "1055667788",
          nationality: "\u0633\u0639\u0648\u062F\u064A",
          expiryDate: "2026-06-30",
          rawText: "\u0647\u0648\u064A\u0629 \u0648\u0637\u0646\u064A\u0629 - \u062E\u0627\u0644\u062F \u0628\u0646 \u0633\u0639\u0648\u062F \u0627\u0644\u0639\u0644\u064A\u0627\u0646 - \u0627\u0646\u062A\u0647\u062A \u0641\u064A 2026-06-30"
        },
        accessLog: [],
        createdAt: "2025-09-10T09:40:00.000Z",
        archivedAt: "2026-07-01T02:00:00.000Z",
        archiveReason: "\u0627\u0646\u062A\u0647\u0627\u0621 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u062B\u064A\u0642\u0629 (\u0645\u0634\u0641\u0631\u0629 \u0644\u0644\u0623\u063A\u0631\u0627\u0636 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A\u0629)",
        archivedBy: "usr-gm",
        archiveMode: "\u0645\u062C\u062F\u0648\u0644",
        preArchiveStatus: "\u0646\u0634\u0637"
      },
      {
        id: "doc-arch-2",
        title: "\u0646\u0633\u062E\u0629 \u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 2025 - \u0645\u0624\u0633\u0633\u0629 \u0623\u0641\u0642 \u0627\u0644\u0631\u064A\u0627\u0636 (M-108)",
        category: "\u0639\u0642\u0648\u062F \u0625\u064A\u062C\u0627\u0631",
        fileName: "ejar-EJ-1046552211.pdf",
        fileType: "PDF",
        fileSizeKb: 910,
        relatedType: "\u0639\u0642\u062F",
        relatedId: "ctr-arch-2",
        expiryDate: "2025-12-19",
        version: 1,
        uploadedBy: "usr-lease",
        ocrStatus: "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0622\u0644\u064A\u0627\u064B",
        ocrExtracted: {
          docType: "\u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631",
          tenantNameAr: "\u0645\u0624\u0633\u0633\u0629 \u0623\u0641\u0642 \u0627\u0644\u0631\u064A\u0627\u0636 \u0644\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A",
          ejarNumber: "EJ-1046552211",
          unitNumber: "M-108",
          annualRent: 38400,
          rawText: "\u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 \u0645\u0648\u062D\u062F EJ-1046552211 - \u0627\u0646\u062A\u0647\u0649 \u0641\u064A 2025-12-19"
        },
        accessLog: [],
        createdAt: "2024-12-15T10:00:00.000Z",
        archivedAt: "2025-12-21T02:00:00.000Z",
        archiveReason: "\u0648\u062B\u064A\u0642\u0629 \u0639\u0642\u062F \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629",
        archivedBy: "usr-lease",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0646\u0634\u0637"
      }
    ],
    purchaseOrders: [
      {
        id: "po-1",
        poNumber: "PO-2026-001",
        title: "\u062A\u0648\u0631\u064A\u062F \u0648\u062A\u0631\u0643\u064A\u0628 \u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0645\u0643\u064A\u0641 \u0633\u0628\u0644\u064A\u062A 24 \u0623\u0644\u0641 \u0648\u062D\u062F\u0629 - \u0634\u0642\u0629 B-204",
        propertyId: "prop-1",
        unitId: "unit-104",
        ticketId: "tkt-1",
        category: "\u062A\u0643\u064A\u064A\u0641 \u0648\u062A\u0628\u0631\u064A\u062F",
        status: "\u0645\u0642\u0627\u0631\u0646\u0629 \u0639\u0631\u0648\u0636",
        quotes: [
          {
            vendorId: "vnd-1",
            vendorName: "\u0645\u0624\u0633\u0633\u0629 \u0646\u0633\u064A\u0645 \u0627\u0644\u062A\u0643\u064A\u064A\u0641 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629",
            amount: 1850,
            deliveryDays: 2,
            warrantyMonths: 12,
            notes: "\u0634\u0627\u0645\u0644 \u0627\u0644\u0641\u0631\u064A\u0648\u0646 \u0648\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0636\u063A\u0637"
          },
          {
            vendorId: "vnd-2",
            vendorName: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0631\u0648\u0627\u062F \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0641\u0646\u064A\u0629",
            amount: 2150,
            deliveryDays: 3,
            warrantyMonths: 12,
            notes: "\u062A\u0648\u0635\u064A\u0644 \u0648\u062A\u0631\u0643\u064A\u0628 \u062E\u0644\u0627\u0644 72 \u0633\u0627\u0639\u0629"
          }
        ],
        selectedVendorId: "vnd-1",
        approvedAmount: 1850,
        currency: "SAR",
        createdBy: "usr-sup",
        createdAt: "2026-11-12T10:00:00.000Z"
      },
      {
        id: "po-2",
        poNumber: "PO-2026-002",
        title: "\u062A\u062C\u0647\u064A\u0632 \u0648\u062A\u0644\u0645\u064A\u0639 \u0645\u062F\u0627\u062E\u0644 \u0627\u0644\u062F\u0648\u0631 \u0627\u0644\u0623\u0631\u0636\u064A \u0648\u062A\u0631\u0643\u064A\u0628 \u0625\u0636\u0627\u0621\u0629 LED - \u0628\u0631\u062C \u0627\u0644\u0645\u0644\u0642\u0627",
        propertyId: "prop-2",
        category: "\u0643\u0647\u0631\u0628\u0627\u0621 \u0648\u0625\u0636\u0627\u0621\u0629",
        status: "\u0623\u0645\u0631 \u0634\u0631\u0627\u0621",
        quotes: [
          {
            vendorId: "vnd-2",
            vendorName: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0631\u0648\u0627\u062F \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0641\u0646\u064A\u0629",
            amount: 3400,
            deliveryDays: 4,
            warrantyMonths: 24,
            notes: "\u0625\u0636\u0627\u0621\u0629 \u0645\u0648\u0641\u0631\u0629 \u0644\u0644\u0637\u0627\u0642\u0629 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u062C\u0648\u062F\u0629"
          }
        ],
        selectedVendorId: "vnd-2",
        approvedAmount: 3400,
        currency: "SAR",
        createdBy: "usr-sup",
        approvedBy: "usr-gm",
        createdAt: "2026-11-08T11:30:00.000Z"
      }
    ],
    decisions: [
      {
        id: "dec-1",
        decisionNumber: "DEC-2026-014",
        title: "\u0627\u0639\u062A\u0645\u0627\u062F \u0633\u064A\u0627\u0633\u0629 \u062D\u0633\u0645 \u0627\u0644\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0645\u0628\u0643\u0631 5% \u0644\u0644\u0645\u0644\u062A\u0632\u0645\u064A\u0646 \u0628\u0627\u0644\u0633\u062F\u0627\u062F",
        category: "\u0639\u0642\u0648\u062F",
        summary: "\u064A\u064F\u0645\u0646\u062D \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631\u0648\u0646 \u0627\u0644\u0645\u0644\u062A\u0632\u0645\u0648\u0646 \u0628\u0633\u062F\u0627\u062F \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u062F\u0648\u0646 \u062A\u0623\u062E\u064A\u0631 \u062E\u0635\u0645 5% \u0639\u0646\u062F \u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0639\u0642\u062F \u0642\u0628\u0644 \u0627\u0646\u062A\u0647\u0627\u0626\u0647 \u0628\u0640 30 \u064A\u0648\u0645\u0627\u064B.",
        effectiveDate: "2026-11-01",
        issuedBy: "usr-gm",
        issuedByName: "\u0633\u0639\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        status: "\u0646\u0627\u0641\u0630",
        createdAt: "2026-11-01T09:00:00.000Z"
      },
      {
        id: "dec-2",
        decisionNumber: "DEC-2026-015",
        title: "\u0625\u0644\u0632\u0627\u0645 \u0631\u0641\u0639 \u0639\u0631\u0636\u064A \u0633\u0639\u0631 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0641\u0648\u0642 1,500 \u0631.\u0633",
        category: "\u0645\u0627\u0644\u064A",
        summary: "\u0644\u0627 \u064A\u064F\u0639\u062A\u0645\u062F \u0623\u064A \u0645\u0635\u0631\u0648\u0641 \u0623\u0648 \u0623\u0645\u0631 \u0634\u0631\u0627\u0621 \u0635\u064A\u0627\u0646\u0629 \u062A\u062A\u062C\u0627\u0648\u0632 \u0642\u064A\u0645\u062A\u0647 1,500 \u0631.\u0633 \u062F\u0648\u0646 \u0625\u0631\u0641\u0627\u0642 \u0639\u0631\u0636\u064A \u0623\u0633\u0639\u0627\u0631 \u0645\u0642\u0627\u0631\u0646\u064A\u0646.",
        effectiveDate: "2026-11-10",
        issuedBy: "usr-gm",
        issuedByName: "\u0633\u0639\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        status: "\u0646\u0627\u0641\u0630",
        createdAt: "2026-11-10T12:00:00.000Z"
      }
    ],
    notifications: [
      {
        id: "not-1",
        titleAr: "\u0645\u0635\u0631\u0648\u0641 \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
        titleEn: "Expense awaiting GM approval",
        messageAr: "\u0641\u0627\u062A\u0648\u0631\u0629 \u0635\u064A\u0627\u0646\u0629 \u0634\u0642\u0629 B-204 \u0628\u0645\u0628\u0644\u063A 1,850 \u0631.\u0633 \u062A\u0645\u062A \u0645\u0631\u0627\u062C\u0639\u062A\u0647\u0627 \u0645\u0646 \u0627\u0644\u0645\u0634\u0631\u0641 \u0648\u062A\u0646\u062A\u0638\u0631 \u0627\u0639\u062A\u0645\u0627\u062F\u0643.",
        messageEn: "Maintenance invoice for Unit B-204 (1,850 SAR) approved by supervisor and awaiting GM sign-off.",
        category: "\u0645\u0627\u0644\u064A\u0629",
        targetRoles: ["gm", "accountant"],
        relatedView: "accounting",
        isReadBy: [],
        createdAt: "2026-11-12T14:22:00.000Z"
      },
      {
        id: "not-2",
        titleAr: "\u0639\u0642\u062F \u062A\u062C\u0627\u0631\u064A \u064A\u0642\u062A\u0631\u0628 \u0645\u0646 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 (16 \u064A\u0648\u0645\u0627\u064B)",
        titleEn: "Commercial lease expiring in 16 days",
        messageAr: "\u0639\u0642\u062F \u0627\u0644\u0645\u0639\u0631\u0636 S-01 (\u0645\u0624\u0633\u0633\u0629 \u0645\u0630\u0627\u0642 \u0627\u0644\u0628\u0646) \u064A\u0646\u062A\u0647\u064A \u0641\u064A 2026-11-30 \u0645\u0639 \u062F\u0641\u0639\u0629 \u0645\u0633\u062A\u062D\u0642\u0629 \u0627\u0644\u064A\u0648\u0645.",
        messageEn: "Lease for Showroom S-01 expires on 2026-11-30 with installment due today.",
        category: "\u062A\u0634\u063A\u064A\u0644\u064A\u0629",
        targetRoles: ["gm", "leasing", "supervisor", "accountant"],
        relatedView: "leasing",
        isReadBy: [],
        createdAt: "2026-11-14T08:00:00.000Z"
      }
    ],
    reminderRules: [
      {
        id: "rem-1",
        nameAr: "\u062A\u0630\u0643\u064A\u0631 \u0645\u0628\u0643\u0631 \u0642\u0628\u0644 \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0628\u0640 7 \u0623\u064A\u0627\u0645",
        nameEn: "7-Day Advance Rent Reminder",
        enabled: true,
        daysBeforeDue: 7,
        channels: ["\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", "\u0648\u0627\u062A\u0633\u0627\u0628"],
        templateAr: "\u0645\u0631\u062D\u0628\u0627\u064B {tenant}\u060C \u0646\u0648\u062F \u062A\u0630\u0643\u064A\u0631\u0643\u0645 \u0628\u0627\u0642\u062A\u0631\u0627\u0628 \u0645\u0648\u0639\u062F \u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0627\u0644\u0642\u0633\u0637 \u0631\u0642\u0645 {installment} \u0644\u0639\u0642\u062F {contract} (\u0627\u0644\u0648\u062D\u062F\u0629 {unit}) \u0628\u0642\u064A\u0645\u0629 {amount} \u0628\u062A\u0627\u0631\u064A\u062E {dueDate}.",
        templateEn: "Hello {tenant}, your rent installment #{installment} for contract {contract} (Unit {unit}) of {amount} is due on {dueDate}.",
        lastRunAt: "2026-11-14T08:00:00.000Z",
        createdBy: "usr-lease",
        createdAt: "2026-10-01T09:00:00.000Z"
      },
      {
        id: "rem-2",
        nameAr: "\u062A\u0646\u0628\u064A\u0647 \u064A\u0648\u0645 \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0648\u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0627\u062A \u0639\u0628\u0631 SMS \u0648\u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628",
        nameEn: "Due Date & Overdue SMS/WhatsApp Alert",
        enabled: true,
        daysBeforeDue: 0,
        channels: ["\u0631\u0633\u0627\u0626\u0644 \u0646\u0635\u064A\u0629 SMS (\u0645\u062D\u0627\u0643\u0627\u0629)", "\u0648\u0627\u062A\u0633\u0627\u0628"],
        templateAr: "\u0639\u0632\u064A\u0632\u064A {tenant}\u060C \u0646\u0631\u062C\u0648 \u0627\u0644\u0645\u0628\u0627\u062F\u0631\u0629 \u0628\u0633\u062F\u0627\u062F \u062F\u0641\u0639\u0629 \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u0633\u062A\u062D\u0642\u0629 \u0644\u0644\u0648\u062D\u062F\u0629 {unit} \u0628\u0645\u0628\u0644\u063A {amount} (\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 {dueDate}).",
        templateEn: "Dear {tenant}, rent installment for Unit {unit} ({amount}) due on {dueDate} requires settlement.",
        lastRunAt: "2026-11-14T08:30:00.000Z",
        createdBy: "usr-acc",
        createdAt: "2026-10-15T09:00:00.000Z"
      }
    ],
    reminderLogs: [
      {
        id: "rlog-1",
        ruleId: "rem-2",
        ruleName: "\u062A\u0646\u0628\u064A\u0647 \u064A\u0648\u0645 \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0648\u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0627\u062A \u0639\u0628\u0631 SMS \u0648\u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628",
        contractId: "ctr-3",
        installmentId: "inst-10",
        tenantId: "ten-3",
        tenantName: "\u0645\u0624\u0633\u0633\u0629 \u0645\u0630\u0627\u0642 \u0627\u0644\u0628\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629",
        channel: "\u0648\u0627\u062A\u0633\u0627\u0628",
        recipient: "0502233445",
        messagePreview: "\u0639\u0632\u064A\u0632\u064A \u0645\u0624\u0633\u0633\u0629 \u0645\u0630\u0627\u0642 \u0627\u0644\u0628\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629\u060C \u0646\u0631\u062C\u0648 \u0627\u0644\u0645\u0628\u0627\u062F\u0631\u0629 \u0628\u0633\u062F\u0627\u062F \u062F\u0641\u0639\u0629 \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u0633\u062A\u062D\u0642\u0629 \u0644\u0644\u0648\u062D\u062F\u0629 S-01 \u0628\u0645\u0628\u0644\u063A 30,000 \u0631.\u0633 (\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 2026-11-14).",
        dueDate: "2026-11-14",
        amount: 3e4,
        currency: "SAR",
        status: "\u062A\u0645 \u0627\u0644\u0625\u0631\u0633\u0627\u0644 (\u0645\u062D\u0627\u0643\u0627\u0629)",
        sentAt: "2026-11-14T08:30:00.000Z"
      },
      {
        id: "rlog-2",
        ruleId: "rem-1",
        ruleName: "\u062A\u0630\u0643\u064A\u0631 \u0645\u0628\u0643\u0631 \u0642\u0628\u0644 \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0628\u0640 7 \u0623\u064A\u0627\u0645",
        contractId: "ctr-2",
        installmentId: "inst-6",
        tenantId: "ten-2",
        tenantName: "\u0637\u0627\u0631\u0642 \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A",
        channel: "\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
        recipient: "tariq.s@yahoo.com",
        messagePreview: "\u0645\u0631\u062D\u0628\u0627\u064B \u0637\u0627\u0631\u0642 \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A\u060C \u0646\u0648\u062F \u062A\u0630\u0643\u064A\u0631\u0643\u0645 \u0628\u0627\u0642\u062A\u0631\u0627\u0628 \u0645\u0648\u0639\u062F \u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0627\u0644\u0642\u0633\u0637 \u0631\u0642\u0645 4 \u0644\u0639\u0642\u062F CNT-2026-002 (\u0627\u0644\u0648\u062D\u062F\u0629 A-102) \u0628\u0642\u064A\u0645\u0629 13,500 \u0631.\u0633 \u0628\u062A\u0627\u0631\u064A\u062E 2026-11-01.",
        dueDate: "2026-11-01",
        amount: 13500,
        currency: "SAR",
        status: "\u062A\u0645 \u0627\u0644\u0625\u0631\u0633\u0627\u0644 (\u0645\u062D\u0627\u0643\u0627\u0629)",
        sentAt: "2026-11-13T10:00:00.000Z"
      }
    ],
    auditLogs: [
      {
        id: "aud-1",
        userId: "usr-tech",
        userName: "\u0639\u0645\u0631 \u0628\u0646 \u0633\u0639\u064A\u062F \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A",
        userRole: "\u0641\u0646\u064A \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A",
        deviceName: "Android Mobile \xB7 \u062C\u0648\u0627\u0644 \u0627\u0644\u0641\u0646\u064A",
        action: "\u0631\u0641\u0639 \u0641\u0627\u062A\u0648\u0631\u0629 \u0635\u064A\u0627\u0646\u0629",
        entityType: "Expense",
        entityId: "exp-2",
        summary: "\u0631\u0641\u0639 \u0641\u0627\u062A\u0648\u0631\u0629 \u0635\u064A\u0627\u0646\u0629 INV-NAS-4410 \u0628\u0645\u0628\u0644\u063A 1,850 \u0631.\u0633 \u0644\u0644\u0628\u0644\u0627\u063A MNT-2026-001",
        newValue: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0634\u0631\u0641",
        createdAt: "2026-11-12T14:20:00.000Z"
      },
      {
        id: "aud-2",
        userId: "usr-sup",
        userName: "\u0645\u0627\u062C\u062F \u0628\u0646 \u062A\u0631\u0643\u064A \u0627\u0644\u062D\u0631\u0628\u064A",
        userRole: "\u0645\u0634\u0631\u0641 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0634\u063A\u064A\u0644",
        deviceName: "Android Tablet \xB7 \u0645\u064A\u062F\u0627\u0646\u064A",
        action: "\u0627\u0639\u062A\u0645\u0627\u062F \u0645\u0631\u062D\u0644\u0629 \u0623\u0648\u0644\u0649 (\u0645\u0634\u0631\u0641)",
        entityType: "Expense",
        entityId: "exp-2",
        summary: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0635\u0631\u0648\u0641 EXP-2026-0002 \u0648\u0625\u062D\u0627\u0644\u062A\u0647 \u0644\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0644\u062A\u062C\u0627\u0648\u0632 \u062D\u062F 500 \u0631.\u0633",
        oldValue: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0634\u0631\u0641",
        newValue: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u062F\u064A\u0631",
        createdAt: "2026-11-12T14:22:00.000Z"
      },
      {
        id: "aud-3",
        userId: "usr-lease",
        userName: "\u0631\u064A\u0645 \u0628\u0646\u062A \u062E\u0627\u0644\u062F \u0627\u0644\u0639\u062A\u064A\u0628\u064A",
        userRole: "\u0645\u0633\u0624\u0648\u0644\u0629 \u0627\u0644\u062A\u0623\u062C\u064A\u0631 \u0648\u0627\u0644\u0639\u0642\u0648\u062F",
        deviceName: "iPad Pro \xB7 \u0645\u0643\u062A\u0628 \u0627\u0644\u062A\u0623\u062C\u064A\u0631",
        action: "\u0631\u0628\u0637 \u0625\u062F\u0627\u0631\u064A \u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u0628\u0648\u062D\u062F\u0629",
        entityType: "Unit",
        entityId: "unit-202",
        summary: "\u0631\u0628\u0637 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u064A\u0627\u0633\u0631 \u0627\u0644\u0645\u0646\u0635\u0648\u0631 \u0628\u0627\u0644\u0645\u0643\u062A\u0628 M-302 \u0643\u0648\u062D\u062F\u0629 \u0645\u062D\u062C\u0648\u0632\u0629 \u062F\u0648\u0646 \u0625\u0646\u0634\u0627\u0621 \u0639\u0642\u062F \u062A\u0644\u0642\u0627\u0626\u064A",
        oldValue: "\u0634\u0627\u063A\u0631\u0629",
        newValue: "\u0645\u062D\u062C\u0648\u0632\u0629",
        createdAt: "2026-11-10T11:05:00.000Z"
      }
    ],
    backups: [
      {
        id: "bkp-1",
        label: "\u0646\u0633\u062E\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0629 \u064A\u0648\u0645\u064A\u0629 \u0645\u0634\u0641\u0631\u0629 \xB7 2026-11-14",
        createdAt: "2026-11-14T03:00:00.000Z",
        createdBy: "\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u0622\u0644\u064A",
        recordCount: 48,
        sizeKb: 64
      }
    ],
    counters: {
      receipt: 3,
      contract: 3,
      ticket: 2,
      expense: 3,
      journal: 2
    },
    processedIdempotencyKeys: ["seed-pay-1", "seed-pay-2", "seed-pay-3", "seed-pay-arch-1", "seed-pay-arch-2"],
    savedArchiveFilters: [
      {
        id: "af-1",
        name: "\u0639\u0642\u0648\u062F 2025 \u0641\u0648\u0642 20,000 \u0631.\u0633",
        category: "contracts",
        year: "2025",
        minAmount: 2e4,
        timeframe: "all",
        createdBy: "usr-gm",
        createdAt: "2026-10-10T09:00:00.000Z"
      },
      {
        id: "af-2",
        name: "\u0627\u0644\u0625\u064A\u0635\u0627\u0644\u0627\u062A \u0627\u0644\u0645\u0639\u0643\u0648\u0633\u0629 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629",
        category: "receipts",
        timeframe: "this_year",
        createdBy: "usr-acc",
        createdAt: "2026-10-15T11:30:00.000Z"
      }
    ],
    archiveLastNightlyRun: "2026-11-14T02:00:00.000Z",
    archiveSeeded: true,
    securityPolicy: {
      minPasswordLength: 8,
      requireSpecialChars: true,
      passwordExpiryDays: 90,
      autoLockMinutes: 5,
      maxFailedAttempts: 5,
      require2faForManagersAndAccountants: true
    },
    loginHistory: [
      {
        id: "lgn-1",
        userId: "usr-gm",
        userName: "\u0641\u0647\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0633\u0628\u064A\u0639\u064A",
        userRole: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629 / \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
        deviceName: "Windows Desktop \xB7 \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        ipAddress: "192.168.10.24",
        geoLocation: "\u0627\u0644\u0631\u064A\u0627\u0636 \xB7 \u0627\u0644\u0639\u0644\u064A\u0627",
        method: "\u0645\u0635\u0627\u062F\u0642\u0629 \u062B\u0646\u0627\u0626\u064A\u0629 (2FA)",
        success: true,
        createdAt: "2026-11-14T08:05:00.000Z"
      },
      {
        id: "lgn-2",
        userId: "usr-acc",
        userName: "\u0633\u0644\u0645\u0627\u0646 \u0628\u0646 \u0646\u0627\u0635\u0631 \u0627\u0644\u062F\u0648\u0633\u0631\u064A",
        userRole: "\u0627\u0644\u0645\u062D\u0627\u0633\u0628 \u0627\u0644\u0645\u0627\u0644\u064A",
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        ipAddress: "192.168.10.31",
        geoLocation: "\u0627\u0644\u0631\u064A\u0627\u0636 \xB7 \u0627\u0644\u0639\u0644\u064A\u0627",
        method: "\u0645\u0635\u0627\u062F\u0642\u0629 \u062B\u0646\u0627\u0626\u064A\u0629 (2FA)",
        success: true,
        createdAt: "2026-11-14T08:15:00.000Z"
      },
      {
        id: "lgn-3",
        userId: "usr-tech",
        userName: "\u0639\u0645\u0631 \u0628\u0646 \u0633\u0639\u064A\u062F \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A",
        userRole: "\u0641\u0646\u064A \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        deviceName: "Android Mobile \xB7 \u062C\u0648\u0627\u0644 \u0627\u0644\u0641\u0646\u064A",
        ipAddress: "10.42.19.88",
        geoLocation: "\u0627\u0644\u0631\u064A\u0627\u0636 \xB7 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 (\u0645\u064A\u062F\u0627\u0646\u064A)",
        method: "\u0628\u0635\u0645\u0629 / Face ID",
        success: true,
        createdAt: "2026-11-14T09:12:00.000Z"
      }
    ],
    syncConflicts: [
      {
        id: "cnf-1",
        entityType: "Unit",
        entityId: "unit-203",
        entityLabel: "\u0627\u0644\u0645\u0643\u062A\u0628 M-405 \xB7 \u0628\u0631\u062C \u0627\u0644\u0645\u0644\u0642\u0627",
        firstActorName: "\u0631\u064A\u0645 \u0627\u0644\u0639\u062A\u064A\u0628\u064A (iPad Pro)",
        secondActorName: "\u0645\u0627\u062C\u062F \u0627\u0644\u062D\u0631\u0628\u064A (Android Tablet - \u0648\u0636\u0639 \u0639\u062F\u0645 \u0627\u0644\u0627\u062A\u0635\u0627\u0644)",
        firstChangeSummary: "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u0642\u062A\u0631\u062D \u0625\u0644\u0649 62,000 \u0631.\u0633",
        secondChangeSummary: '\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u062A\u062C\u0647\u064A\u0632 \u0625\u0644\u0649 "\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u062A\u0646\u0638\u064A\u0641"',
        status: "\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0623\u062D\u062F\u062B",
        resolvedBy: "\u0641\u0647\u062F \u0627\u0644\u0633\u0628\u064A\u0639\u064A",
        resolvedAt: "2026-11-13T16:40:00.000Z",
        createdAt: "2026-11-13T16:10:00.000Z"
      }
    ],
    communicationTemplates: [
      {
        id: "tpl-pay-1",
        name: "\u062A\u0630\u0643\u064A\u0631 \u0642\u0628\u0644 \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642",
        category: "payment",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 {{tenant_name}}\u060C\n\u0646\u0648\u062F \u062A\u0630\u0643\u064A\u0631\u0643\u0645 \u0628\u0623\u0646 \u0625\u064A\u062C\u0627\u0631 \u0648\u062D\u062F\u0629 {{unit_number}} \u0641\u064A {{property_name}} \u0628\u0642\u064A\u0645\u0629 {{amount}} \u0631\u064A\u0627\u0644 \u0645\u0633\u062A\u062D\u0642 \u0628\u062A\u0627\u0631\u064A\u062E {{due_date}}.\n\u064A\u0645\u0643\u0646\u0643\u0645 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0639\u0644\u0649 \u0627\u0644\u062D\u0633\u0627\u0628:\n{{bank_name}} - {{iban}}\n\u0634\u0627\u0643\u0631\u064A\u0646 \u062A\u0639\u0627\u0648\u0646\u0643\u0645.\n\u2014 {{company_name}}",
        contentEn: "Dear {{tenant_name}}, friendly reminder that rent for {{unit_number}} at {{property_name}} ({{amount}} SAR) is due on {{due_date}}. Bank: {{bank_name}} - {{iban}}. \u2014 {{company_name}}",
        isFavorite: true,
        usageCount: 48,
        scheduleEnabled: true,
        scheduleDaysOffset: 3,
        scheduleTime: "09:00",
        allowedRoles: ["sys_owner", "gm", "accountant", "leasing"],
        createdBy: "usr-gm",
        updatedAt: "2026-11-10T09:00:00.000Z"
      },
      {
        id: "tpl-pay-2",
        name: "\u0625\u0634\u0639\u0627\u0631 \u0628\u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645",
        category: "payment",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u062F\u0641\u0639\u062A\u0643\u0645 \u0628\u0642\u064A\u0645\u0629 {{paid_amount}} \u0631\u064A\u0627\u0644 \u0628\u0646\u062C\u0627\u062D.\n\u0631\u0642\u0645 \u0627\u0644\u0625\u064A\u0635\u0627\u0644: {{receipt_number}}\n\u0627\u0644\u0648\u062D\u062F\u0629: {{unit_number}} \xB7 {{property_name}}\n\u0627\u0644\u0645\u062A\u0628\u0642\u064A: {{remaining}} \u0631\u064A\u0627\u0644.\n\u0634\u0643\u0631\u0627\u064B \u0644\u0627\u0644\u062A\u0632\u0627\u0645\u0643\u0645 \u2014 {{company_name}}",
        contentEn: "Payment of {{paid_amount}} SAR received successfully. Receipt: {{receipt_number}}. Remaining balance: {{remaining}} SAR. Thank you \u2014 {{company_name}}",
        isFavorite: true,
        usageCount: 64,
        allowedRoles: ["sys_owner", "gm", "accountant"],
        createdBy: "usr-acc",
        updatedAt: "2026-11-11T10:30:00.000Z"
      },
      {
        id: "tpl-pay-3",
        name: "\u062A\u0646\u0628\u064A\u0647 \u062A\u0623\u062E\u064A\u0631",
        category: "payment",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u0639\u0632\u064A\u0632\u064A/\u0629 {{tenant_name}}\u060C \u0646\u0623\u0633\u0641 \u0644\u0625\u0628\u0644\u0627\u063A\u0643\u0645 \u0628\u062A\u0623\u062E\u0631 \u0633\u062F\u0627\u062F \u0625\u064A\u062C\u0627\u0631 {{unit_number}} ({{property_name}}) \u0627\u0644\u0645\u0633\u062A\u062D\u0642 \u0645\u0646\u0630 {{days_overdue}} \u064A\u0648\u0645 \u0628\u0645\u0628\u0644\u063A {{amount}} \u0631\u064A\u0627\u0644. \u0646\u0631\u062C\u0648 \u0627\u0644\u0633\u062F\u0627\u062F \u0641\u064A \u0623\u0642\u0631\u0628 \u0648\u0642\u062A \u0644\u062A\u062C\u0646\u0628 \u0623\u064A \u0631\u0633\u0648\u0645 \u0625\u0636\u0627\u0641\u064A\u0629.\n\u2014 {{company_name}}",
        contentEn: "Dear {{tenant_name}}, your rent for {{unit_number}} is {{days_overdue}} days overdue ({{amount}} SAR). Please settle promptly. \u2014 {{company_name}}",
        isFavorite: true,
        usageCount: 29,
        allowedRoles: ["sys_owner", "gm", "accountant", "leasing"],
        createdBy: "usr-acc",
        updatedAt: "2026-11-12T12:00:00.000Z"
      },
      {
        id: "tpl-pay-4",
        name: "\u0625\u0634\u0639\u0627\u0631 \u062F\u0641\u0639\u0629 \u062C\u0632\u0626\u064A\u0629",
        category: "payment",
        channel: "sms",
        language: "ar",
        contentAr: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 {{paid_amount}} \u0631\u064A\u0627\u0644 \u0645\u0646 \u0625\u062C\u0645\u0627\u0644\u064A {{total_due}} \u0631\u064A\u0627\u0644 \u0644\u0648\u062D\u062F\u0629 {{unit_number}}. \u0627\u0644\u0645\u062A\u0628\u0642\u064A: {{remaining}} \u0631\u064A\u0627\u0644. \u0646\u0631\u062C\u0648 \u0633\u062F\u0627\u062F \u0627\u0644\u0645\u062A\u0628\u0642\u064A \u0642\u0628\u0644 {{new_due_date}}.",
        contentEn: "Partial payment {{paid_amount}} SAR received out of {{total_due}} SAR. Remaining {{remaining}} SAR due before {{new_due_date}}.",
        usageCount: 15,
        allowedRoles: ["sys_owner", "gm", "accountant"],
        createdBy: "usr-acc",
        updatedAt: "2026-11-08T14:00:00.000Z"
      },
      {
        id: "tpl-ctr-1",
        name: "\u062A\u0631\u062D\u064A\u0628 \u0645\u0633\u062A\u0623\u062C\u0631 \u062C\u062F\u064A\u062F",
        category: "contract",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u0623\u0647\u0644\u0627\u064B \u0628\u0643 {{tenant_name}} \u0641\u064A {{property_name}}. \u0646\u062A\u0645\u0646\u0649 \u0644\u0643 \u0625\u0642\u0627\u0645\u0629 \u0645\u0631\u064A\u062D\u0629.\n\u0631\u0642\u0645 \u0648\u062D\u062F\u062A\u0643: {{unit_number}}\n\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0642\u0627\u0631: {{manager_name}} - {{manager_phone}}\n\u2014 {{company_name}}",
        contentEn: "Welcome {{tenant_name}} to {{property_name}}! Unit: {{unit_number}}. Property Manager: {{manager_name}} ({{manager_phone}}). \u2014 {{company_name}}",
        isFavorite: true,
        usageCount: 22,
        allowedRoles: ["sys_owner", "gm", "leasing", "receptionist"],
        createdBy: "usr-lease",
        updatedAt: "2026-11-05T11:00:00.000Z"
      },
      {
        id: "tpl-ctr-2",
        name: "\u062A\u0630\u0643\u064A\u0631 \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0639\u0642\u062F",
        category: "contract",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u0639\u0632\u064A\u0632\u064A {{tenant_name}}\u060C \u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 {{unit_number}} \u0641\u064A {{property_name}} \u0633\u064A\u0646\u062A\u0647\u064A \u0641\u064A {{end_date}}. \u0646\u0631\u062C\u0648 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0644\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0639\u0642\u062F \u0623\u0648 \u062A\u0631\u062A\u064A\u0628 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0625\u062E\u0644\u0627\u0621.\n\u2014 {{company_name}}",
        contentEn: "Dear {{tenant_name}}, lease for {{unit_number}} ends on {{end_date}}. Please contact us for renewal or handover.",
        usageCount: 18,
        scheduleEnabled: true,
        scheduleDaysOffset: 30,
        scheduleTime: "10:00",
        allowedRoles: ["sys_owner", "gm", "leasing"],
        createdBy: "usr-lease",
        updatedAt: "2026-11-06T09:15:00.000Z"
      },
      {
        id: "tpl-ctr-3",
        name: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u062C\u062F\u064A\u062F",
        category: "contract",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u062A\u0645 \u062A\u062C\u062F\u064A\u062F \u0639\u0642\u062F {{unit_number}} ({{property_name}}) \u0628\u0646\u062C\u0627\u062D \u0644\u0645\u062F\u0629 {{duration}} \u0628\u0642\u064A\u0645\u0629 {{new_rent}} \u0631\u064A\u0627\u0644 \u0633\u0646\u0648\u064A\u0627\u064B. \u0634\u0643\u0631\u0627\u064B \u0644\u062B\u0642\u062A\u0643\u0645 \u2014 {{company_name}}.",
        contentEn: "Your lease for {{unit_number}} has been renewed for {{duration}} at {{new_rent}} SAR. Thank you \u2014 {{company_name}}.",
        usageCount: 11,
        allowedRoles: ["sys_owner", "gm", "leasing"],
        createdBy: "usr-lease",
        updatedAt: "2026-11-04T15:00:00.000Z"
      },
      {
        id: "tpl-ctr-4",
        name: "\u0625\u0634\u0639\u0627\u0631 \u0625\u062E\u0644\u0627\u0621",
        category: "contract",
        channel: "email",
        language: "ar",
        contentAr: "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0637\u0644\u0628 \u0627\u0644\u0625\u062E\u0644\u0627\u0621 \u0644\u0648\u062D\u062F\u0629 {{unit_number}} \u0641\u064A {{property_name}}. \u0646\u0631\u062C\u0648 \u0627\u0644\u062D\u0636\u0648\u0631 \u0641\u064A {{handover_date}} \u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0648\u062D\u062F\u0629 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D \u0645\u0639 \u0627\u0644\u0645\u0634\u0631\u0641 {{manager_name}}.",
        contentEn: "Move-out request logged for {{unit_number}}. Please attend on {{handover_date}} for unit inspection and key handover.",
        usageCount: 7,
        allowedRoles: ["sys_owner", "gm", "leasing", "supervisor"],
        createdBy: "usr-lease",
        updatedAt: "2026-11-03T12:20:00.000Z"
      },
      {
        id: "tpl-mnt-1",
        name: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0628\u0644\u0627\u063A \u0635\u064A\u0627\u0646\u0629",
        category: "maintenance",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0628\u0644\u0627\u063A\u0643\u0645 \u0631\u0642\u0645 {{ticket_id}} \u0628\u062E\u0635\u0648\u0635 {{issue_type}} \u0641\u064A {{unit_number}}.\n\u0633\u064A\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643\u0645 \u062E\u0644\u0627\u0644 {{response_time}} \u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0645\u0648\u0639\u062F.\n\u0634\u0643\u0631\u0627\u064B \u0644\u0635\u0628\u0631\u0643\u0645.\n\u2014 \u0641\u0631\u064A\u0642 \u0627\u0644\u0635\u064A\u0627\u0646\u0629\u060C {{company_name}}",
        contentEn: "Maintenance ticket {{ticket_id}} for {{issue_type}} in {{unit_number}} received. We will contact you within {{response_time}}.",
        isFavorite: true,
        usageCount: 34,
        allowedRoles: ["sys_owner", "gm", "maint_manager", "technician", "receptionist"],
        createdBy: "usr-mnt",
        updatedAt: "2026-11-09T13:00:00.000Z"
      },
      {
        id: "tpl-mnt-2",
        name: "\u0625\u0633\u0646\u0627\u062F \u0644\u0641\u0646\u064A \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        category: "maintenance",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u062A\u0645 \u0625\u0633\u0646\u0627\u062F \u0628\u0644\u0627\u063A\u0643\u0645 ({{ticket_id}}) \u0644\u0644\u0641\u0646\u064A {{technician_name}}. \u0633\u064A\u0635\u0644\u0643\u0645 \u062E\u0644\u0627\u0644 {{eta}}. \u0631\u0642\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644: {{tech_phone}}.",
        contentEn: "Ticket {{ticket_id}} assigned to technician {{technician_name}} (ETA: {{eta}}, Phone: {{tech_phone}}).",
        usageCount: 27,
        allowedRoles: ["sys_owner", "gm", "maint_manager", "technician"],
        createdBy: "usr-mnt",
        updatedAt: "2026-11-07T16:10:00.000Z"
      },
      {
        id: "tpl-mnt-3",
        name: "\u0627\u0643\u062A\u0645\u0627\u0644 \u0627\u0644\u0625\u0635\u0644\u0627\u062D",
        category: "maintenance",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u062A\u0645 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 \u0645\u0646 \u0625\u0635\u0644\u0627\u062D {{issue_type}} \u0641\u064A {{unit_number}} (\u0628\u0644\u0627\u063A {{ticket_id}}). \u0646\u0631\u062C\u0648 \u0627\u0644\u062A\u0623\u0643\u064A\u062F \u0639\u0644\u0649 \u062C\u0648\u062F\u0629 \u0627\u0644\u0639\u0645\u0644. \u0634\u0643\u0631\u0627\u064B \u0644\u0635\u0628\u0631\u0643\u0645 \u2014 {{company_name}}.",
        contentEn: "Maintenance {{issue_type}} in {{unit_number}} ({{ticket_id}}) is completed. Please confirm service quality.",
        usageCount: 25,
        allowedRoles: ["sys_owner", "gm", "maint_manager", "technician"],
        createdBy: "usr-mnt",
        updatedAt: "2026-11-09T18:00:00.000Z"
      },
      {
        id: "tpl-sup-1",
        name: "\u0637\u0644\u0628 \u0639\u0631\u0636 \u0633\u0639\u0631",
        category: "supplier",
        channel: "email",
        language: "ar",
        contentAr: "\u0627\u0644\u0633\u0627\u062F\u0629 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646\u060C \u0646\u0631\u062C\u0648 \u062A\u0632\u0648\u064A\u062F\u0646\u0627 \u0628\u0639\u0631\u0636 \u0633\u0639\u0631 \u0644\u0640 {{service_description}} \u0641\u064A {{property_name}} - {{unit_number}}. \u0646\u0631\u062C\u0648 \u0627\u0644\u0631\u062F \u062E\u0644\u0627\u0644 {{deadline}}.\n\u2014 {{company_name}}",
        contentEn: "Please provide a quotation for {{service_description}} at {{property_name}} - {{unit_number}} before {{deadline}}.",
        usageCount: 14,
        allowedRoles: ["sys_owner", "gm", "maint_manager", "accountant"],
        createdBy: "usr-mnt",
        updatedAt: "2026-11-02T11:00:00.000Z"
      },
      {
        id: "tpl-sup-2",
        name: "\u062A\u0623\u0643\u064A\u062F \u0637\u0644\u0628 \u0639\u0645\u0644",
        category: "supplier",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0637\u0644\u0628 \u0627\u0644\u0639\u0645\u0644 \u0631\u0642\u0645 {{work_order_id}}. \u0627\u0644\u0645\u0648\u0639\u062F: {{scheduled_date}} \u0627\u0644\u0633\u0627\u0639\u0629 {{scheduled_time}}. \u0627\u0644\u0645\u0648\u0642\u0639: {{location}}.",
        contentEn: "Work order {{work_order_id}} confirmed for {{scheduled_date}} at {{scheduled_time}}. Location: {{location}}.",
        usageCount: 12,
        allowedRoles: ["sys_owner", "gm", "maint_manager"],
        createdBy: "usr-mnt",
        updatedAt: "2026-11-04T10:00:00.000Z"
      },
      {
        id: "tpl-sup-3",
        name: "\u0627\u0639\u062A\u0645\u0627\u062F \u0641\u0627\u062A\u0648\u0631\u0629 \u0645\u0648\u0631\u062F",
        category: "supplier",
        channel: "email",
        language: "ar",
        contentAr: "\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0641\u0627\u062A\u0648\u0631\u062A\u0643\u0645 \u0631\u0642\u0645 {{invoice_number}} \u0628\u0642\u064A\u0645\u0629 {{amount}} \u0631\u064A\u0627\u0644. \u0633\u064A\u062A\u0645 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u062E\u0644\u0627\u0644 {{payment_days}} \u064A\u0648\u0645 \u0639\u0645\u0644.\n\u2014 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629\u060C {{company_name}}",
        contentEn: "Invoice {{invoice_number}} for {{amount}} SAR approved. Payment will be transferred within {{payment_days}} business days.",
        usageCount: 19,
        allowedRoles: ["sys_owner", "gm", "accountant"],
        createdBy: "usr-acc",
        updatedAt: "2026-11-05T14:40:00.000Z"
      },
      {
        id: "tpl-int-1",
        name: "\u0625\u0633\u0646\u0627\u062F \u0645\u0647\u0645\u0629 \u062F\u0627\u062E\u0644\u064A\u0629",
        category: "internal",
        channel: "internal",
        language: "ar",
        contentAr: "\u062A\u0645 \u0625\u0633\u0646\u0627\u062F \u0645\u0647\u0645\u0629 \u062C\u062F\u064A\u062F\u0629: {{task_title}} \u0641\u064A {{property_name}}. \u0627\u0644\u0645\u0648\u0639\u062F \u0627\u0644\u0646\u0647\u0627\u0626\u064A: {{deadline}}. \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629: {{priority}}.",
        contentEn: "New task assigned: {{task_title}} at {{property_name}}. Due: {{deadline}} ({{priority}}).",
        usageCount: 31,
        allowedRoles: ["sys_owner", "gm", "supervisor", "maint_manager"],
        createdBy: "usr-gm",
        updatedAt: "2026-11-11T08:00:00.000Z"
      },
      {
        id: "tpl-int-2",
        name: "\u062A\u0630\u0643\u064A\u0631 \u0628\u0645\u0647\u0645\u0629 \u0639\u0627\u062C\u0644\u0629",
        category: "internal",
        channel: "internal",
        language: "ar",
        contentAr: "\u062A\u0646\u0628\u064A\u0647: \u0644\u062F\u064A\u0643 \u0645\u0647\u0645\u0629 \u0633\u062A\u0646\u062A\u0647\u064A \u062E\u0644\u0627\u0644 {{hours_left}} \u0633\u0627\u0639\u0629: {{task_title}} ({{property_name}}).",
        contentEn: "Reminder: Task {{task_title}} is due in {{hours_left}} hours.",
        usageCount: 16,
        allowedRoles: ["sys_owner", "gm", "supervisor", "maint_manager"],
        createdBy: "usr-gm",
        updatedAt: "2026-11-10T15:00:00.000Z"
      },
      {
        id: "tpl-int-3",
        name: "\u0627\u0639\u062A\u0645\u0627\u062F \u0645\u0635\u0631\u0648\u0641 \u0645\u0648\u0638\u0641",
        category: "internal",
        channel: "internal",
        language: "ar",
        contentAr: "\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0645\u0635\u0631\u0648\u0641\u0643 \u0631\u0642\u0645 {{expense_id}} \u0628\u0642\u064A\u0645\u0629 {{amount}} \u0631\u064A\u0627\u0644. \u0627\u0644\u0645\u0631\u062C\u0648 \u0631\u0641\u0639 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0623\u0635\u0644\u064A\u0629 \u0641\u064A \u0642\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A.",
        contentEn: "Expense {{expense_id}} ({{amount}} SAR) approved. Please upload the original invoice.",
        usageCount: 20,
        allowedRoles: ["sys_owner", "gm", "accountant", "supervisor"],
        createdBy: "usr-acc",
        updatedAt: "2026-11-08T17:00:00.000Z"
      },
      {
        id: "tpl-cus-1",
        name: "\u062A\u0647\u0646\u0626\u0629 \u0645\u0648\u0633\u0645\u064A\u0629 (\u0627\u0644\u0623\u0639\u064A\u0627\u062F \u0648\u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0627\u062A)",
        category: "custom",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u0639\u0632\u064A\u0632\u064A/\u0629 {{tenant_name}}\u060C \u062A\u062A\u0642\u062F\u0645 \u0623\u0633\u0631\u0629 {{company_name}} \u0628\u0623\u0635\u062F\u0642 \u0627\u0644\u062A\u0647\u0627\u0646\u064A \u0648\u0627\u0644\u062A\u0628\u0631\u064A\u0643\u0627\u062A \u0628\u0645\u0646\u0627\u0633\u0628\u0629 \u062D\u0644\u0648\u0644 \u0627\u0644\u0639\u064A\u062F \u0627\u0644\u0645\u0628\u0627\u0631\u0643\u060C \u0633\u0627\u0626\u0644\u064A\u0646 \u0627\u0644\u0644\u0647 \u0623\u0646 \u064A\u062F\u064A\u0645 \u0639\u0644\u064A\u0643\u0645 \u0627\u0644\u062E\u064A\u0631 \u0648\u0627\u0644\u0628\u0631\u0643\u0629.",
        contentEn: "Dear {{tenant_name}}, warm seasonal greetings from {{company_name}}. Wishing you happiness and prosperity.",
        isFavorite: true,
        isSeasonal: true,
        usageCount: 9,
        allowedRoles: ["sys_owner", "gm", "leasing", "receptionist"],
        createdBy: "usr-gm",
        updatedAt: "2026-11-01T12:00:00.000Z"
      }
    ],
    meterReadings: [
      {
        id: "mr-1",
        readingNumber: "MTR-2026-001",
        propertyId: "prop-1",
        unitId: "unit-101",
        meterType: "\u0643\u0647\u0631\u0628\u0627\u0621",
        meterNumber: "ELC-99011",
        previousReading: 14200,
        currentReading: 14860,
        consumption: 660,
        billAmount: 215,
        currency: "SAR",
        billingPeriod: "2026-11",
        recordedBy: "\u0641\u0647\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0633\u0628\u064A\u0639\u064A",
        notes: "\u0642\u0631\u0627\u0621\u0629 \u0634\u0647\u0631 \u0646\u0648\u0641\u0645\u0628\u0631 \u0627\u0644\u062F\u0648\u0631\u064A\u0629 - \u0639\u0645\u0627\u0631\u0629 \u0627\u0644\u0646\u062E\u064A\u0644",
        createdAt: "2026-11-10T09:30:00.000Z"
      },
      {
        id: "mr-2",
        readingNumber: "MTR-2026-002",
        propertyId: "prop-2",
        unitId: "unit-201",
        meterType: "\u0645\u064A\u0627\u0647",
        meterNumber: "WTR-44021",
        previousReading: 3180,
        currentReading: 3245,
        consumption: 65,
        billAmount: 95,
        currency: "SAR",
        billingPeriod: "2026-11",
        recordedBy: "\u0623\u062D\u0645\u062F \u0627\u0644\u0639\u0644\u064A",
        notes: "\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0633\u062A\u0647\u0644\u0627\u0643 \u0627\u0644\u0645\u064A\u0627\u0647 \u0627\u0644\u0634\u0647\u0631\u064A\u0629",
        createdAt: "2026-11-11T11:15:00.000Z"
      }
    ],
    teamSeeded: true,
    lastUpdatedAt: now
  };
}

// worker/src/cryptoWeb.ts
var encoder = new TextEncoder();
var decoder = new TextDecoder();
function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function hexToBytes(hex) {
  const clean = hex.trim();
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
function toBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
async function hashSecretWeb(secret) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return `pbkdf2$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(derived))}`;
}
async function verifySecretWeb(secret, storedHash) {
  if (!storedHash || !storedHash.startsWith("pbkdf2$")) return false;
  const parts = storedHash.split("$");
  if (parts.length !== 3) return false;
  const salt = hexToBytes(parts[1]);
  const expected = hexToBytes(parts[2]);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 1e5,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  return constantTimeEqual(new Uint8Array(derived), expected);
}
async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}
async function signTokenWeb(claims, secret) {
  const payloadB64 = toBase64Url(encoder.encode(JSON.stringify(claims)));
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  return `${payloadB64}.${toBase64Url(new Uint8Array(sig))}`;
}
async function verifyTokenWeb(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  const key = await importHmacKey(secret);
  const expectedSig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64)));
  let providedSig;
  try {
    providedSig = fromBase64Url(sigB64);
  } catch {
    return null;
  }
  if (!constantTimeEqual(expectedSig, providedSig)) return null;
  try {
    const claims = JSON.parse(decoder.decode(fromBase64Url(payloadB64)));
    if (!claims?.uid || !claims?.exp || claims.exp < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}
async function encryptBackupWeb(payload, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const aesKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoder.encode(JSON.stringify(payload))
  );
  return {
    aqarEncrypted: true,
    alg: "AES-256-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: 1e5,
    salt: bytesToHex(salt),
    iv: bytesToHex(iv),
    ciphertext: toBase64Url(new Uint8Array(encrypted))
  };
}
async function decryptBackupWeb(envelope, password) {
  const salt = hexToBytes(envelope.salt);
  const iv = hexToBytes(envelope.iv);
  const cipherBytes = fromBase64Url(envelope.ciphertext);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: envelope.iterations || 1e5,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    cipherBytes
  );
  return JSON.parse(decoder.decode(new Uint8Array(plainBuf)));
}

// worker/src/workspaceDo.ts
var SESSION_COOKIE_NAME = "aqar_session";
var SESSION_TTL_MS = 1e3 * 60 * 60 * 24 * 7;
var PUBLIC_PATHS = /* @__PURE__ */ new Set([
  "/api/health",
  "/api/auth/session",
  "/api/auth/login",
  "/api/auth/login-pin",
  "/api/auth/logout",
  "/api/public/prospect-context",
  "/api/public/leads"
]);
function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
function jsonResponse(body, status = 200, extraHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders || {}
    }
  });
}
function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  }
  return out;
}
function normalizePhone(raw) {
  return raw.replace(/[^\d]/g, "").slice(-9);
}
var AqarWorkspaceDO = class extends DurableObject {
  stateCache = null;
  initialized = false;
  sessionSecretCache = null;
  constructor(ctx, env) {
    super(ctx, env);
    this.initSchema();
  }
  initSchema() {
    const sql = this.ctx.storage.sql;
    sql.exec(`
      CREATE TABLE IF NOT EXISTS kv_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS state_snapshots (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        sync_revision INTEGER NOT NULL,
        updated_at TEXT NOT NULL,
        state_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS user_credentials (
        user_id TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        pin_hash TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        device_name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        revoked INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS operations_log (
        operation_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        method TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        status TEXT NOT NULL,
        response_json TEXT,
        processed_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS backups_store (
        id TEXT PRIMARY KEY,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }
  async ensureBootstrapped() {
    if (this.initialized && this.stateCache) return this.stateCache;
    const sql = this.ctx.storage.sql;
    const rows = sql.exec("SELECT state_json FROM state_snapshots WHERE id = 1").toArray();
    if (rows.length > 0) {
      this.stateCache = JSON.parse(rows[0].state_json);
    } else {
      const seed = createInitialSeed();
      if (!seed.entityRevisions) seed.entityRevisions = {};
      this.stateCache = seed;
      sql.exec(
        "INSERT OR REPLACE INTO state_snapshots (id, sync_revision, updated_at, state_json) VALUES (1, ?, ?, ?)",
        seed.syncRevision || 1,
        seed.lastUpdatedAt,
        JSON.stringify(seed)
      );
    }
    const existingCreds = new Set(
      sql.exec("SELECT user_id FROM user_credentials").toArray().map((r) => r.user_id)
    );
    const defaultPwHash = await hashSecretWeb("Aqar@2026");
    const defaultPinHash = await hashSecretWeb("1234");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    for (const user of this.stateCache.users) {
      if (!existingCreds.has(user.id)) {
        sql.exec(
          "INSERT INTO user_credentials (user_id, password_hash, pin_hash, updated_at) VALUES (?, ?, ?, ?)",
          user.id,
          defaultPwHash,
          defaultPinHash,
          now
        );
      }
    }
    if (this.env.AQAR_SESSION_SECRET) {
      this.sessionSecretCache = this.env.AQAR_SESSION_SECRET;
    } else {
      const secretRow = sql.exec("SELECT value FROM kv_meta WHERE key = 'session_secret'").toArray();
      if (secretRow.length > 0) {
        this.sessionSecretCache = secretRow[0].value;
      } else {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
        sql.exec("INSERT INTO kv_meta (key, value) VALUES ('session_secret', ?)", hex);
        this.sessionSecretCache = hex;
      }
    }
    this.initialized = true;
    return this.stateCache;
  }
  persistState(state) {
    state.lastUpdatedAt = (/* @__PURE__ */ new Date()).toISOString();
    state.syncRevision = (state.syncRevision || 1) + 1;
    this.stateCache = state;
    this.ctx.storage.sql.exec(
      "INSERT OR REPLACE INTO state_snapshots (id, sync_revision, updated_at, state_json) VALUES (1, ?, ?, ?)",
      state.syncRevision,
      state.lastUpdatedAt,
      JSON.stringify(state)
    );
  }
  hasPermission(state, userId, perm) {
    const user = state.users.find((u) => u.id === userId && u.active);
    if (!user) return false;
    if (user.role === "sys_owner") return true;
    return (state.rolePermissions[user.role] || []).includes(perm);
  }
  assertPermission(state, userId, perm) {
    if (!this.hasPermission(state, userId, perm)) {
      throw new Error("\u0644\u064A\u0633\u062A \u0644\u062F\u064A\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0644\u0627\u0632\u0645\u0629 \u0644\u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621");
    }
  }
  bumpRevision(state, entityType, entityId) {
    if (!state.entityRevisions) state.entityRevisions = {};
    const key = `${entityType}:${entityId}`;
    state.entityRevisions[key] = (state.entityRevisions[key] || 0) + 1;
  }
  appendAudit(state, userId, action, entityType, entityId, summary, deviceName = "Cloudflare Edge") {
    const actor = state.users.find((u) => u.id === userId);
    state.auditLogs.unshift({
      id: uid("aud"),
      userId,
      userName: actor?.nameAr || "\u0645\u0633\u062A\u062E\u062F\u0645",
      userRole: actor?.roleLabelAr || "",
      deviceName,
      action,
      entityType,
      entityId,
      summary,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (state.auditLogs.length > 500) {
      state.auditLogs.length = 500;
    }
  }
  getStateForUser(state, userId) {
    const user = state.users.find((u) => u.id === userId && u.active);
    if (!user) {
      throw new Error("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u062A\u0645 \u062A\u0639\u0637\u064A\u0644 \u062D\u0633\u0627\u0628\u0647");
    }
    const clone = JSON.parse(JSON.stringify(state));
    const perms = new Set(clone.rolePermissions[user.role] || []);
    if (user.role !== "sys_owner" && !perms.has("view_audit")) {
      clone.auditLogs = [];
    }
    if (user.role !== "sys_owner" && !perms.has("backup_restore")) {
      clone.backups = [];
    }
    if (user.role !== "sys_owner" && !perms.has("manage_users")) {
      clone.users = clone.users.map(
        (u) => u.id === user.id ? u : {
          ...u,
          email: "",
          phone: ""
        }
      );
    }
    if (user.role === "owner" && user.ownerId) {
      const ownerId = user.ownerId;
      clone.properties = clone.properties.filter((p) => p.ownerShares.some((s) => s.ownerId === ownerId));
      const propIds = new Set(clone.properties.map((p) => p.id));
      clone.units = clone.units.filter((u) => propIds.has(u.propertyId));
      clone.contracts = clone.contracts.filter((c) => propIds.has(c.propertyId));
      const contractIds = new Set(clone.contracts.map((c) => c.id));
      const tenantIds = new Set(clone.contracts.map((c) => c.tenantId));
      clone.tenants = clone.tenants.filter((t) => tenantIds.has(t.id));
      clone.installments = clone.installments.filter((i) => contractIds.has(i.contractId));
      clone.payments = clone.payments.filter((p) => propIds.has(p.propertyId));
      clone.expenses = clone.expenses.filter((e) => propIds.has(e.propertyId));
      clone.tickets = clone.tickets.filter((t) => propIds.has(t.propertyId));
      clone.documents = clone.documents.filter(
        (d) => d.relatedType === "\u0639\u0642\u0627\u0631" && propIds.has(d.relatedId) || d.relatedType === "\u0639\u0642\u062F" && contractIds.has(d.relatedId)
      );
      clone.leads = [];
      clone.auditLogs = [];
      clone.backups = [];
    } else if (user.allowedPropertyIds && user.allowedPropertyIds.length > 0 && user.role !== "sys_owner" && user.role !== "gm") {
      const allowed = new Set(user.allowedPropertyIds);
      clone.properties = clone.properties.filter((p) => allowed.has(p.id));
      clone.units = clone.units.filter((u) => allowed.has(u.propertyId));
      clone.contracts = clone.contracts.filter((c) => allowed.has(c.propertyId));
      const contractIds = new Set(clone.contracts.map((c) => c.id));
      clone.installments = clone.installments.filter((i) => contractIds.has(i.contractId));
      clone.payments = clone.payments.filter((p) => allowed.has(p.propertyId));
      clone.expenses = clone.expenses.filter((e) => allowed.has(e.propertyId));
      clone.tickets = clone.tickets.filter((t) => allowed.has(t.propertyId));
      clone.leads = clone.leads.filter((l) => !l.propertyId || allowed.has(l.propertyId));
    }
    return clone;
  }
  extractToken(req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      return authHeader.slice(7).trim();
    }
    const cookies = parseCookies(req.headers.get("cookie"));
    return cookies[SESSION_COOKIE_NAME] || null;
  }
  async resolveActor(req, state, overrideToken) {
    const rawToken = overrideToken || this.extractToken(req);
    if (!rawToken || !this.sessionSecretCache) return null;
    const claims = await verifyTokenWeb(rawToken, this.sessionSecretCache);
    if (!claims) return null;
    const sessionRow = this.ctx.storage.sql.exec(
      "SELECT user_id, expires_at, revoked FROM sessions WHERE token_id = ?",
      claims.sid
    ).toArray()[0];
    if (!sessionRow || sessionRow.revoked !== 0 || sessionRow.user_id !== claims.uid) {
      return null;
    }
    if (new Date(sessionRow.expires_at).getTime() <= Date.now()) {
      return null;
    }
    const user = state.users.find((u) => u.id === claims.uid && u.active);
    if (!user) return null;
    const rawDevice = req.headers.get("x-device-name");
    let deviceName = claims.deviceName || "Cloudflare Web";
    if (rawDevice) {
      try {
        deviceName = decodeURIComponent(rawDevice);
      } catch {
        deviceName = rawDevice;
      }
    }
    return {
      userId: user.id,
      role: user.role,
      sessionId: claims.sid,
      rawToken,
      deviceName
    };
  }
  async issueSession(user, deviceName) {
    const now = Date.now();
    const exp = now + SESSION_TTL_MS;
    const expiresAt = new Date(exp).toISOString();
    const sid = `ses-${crypto.randomUUID().slice(0, 12)}`;
    const token = await signTokenWeb(
      { sid, uid: user.id, role: user.role, deviceName, iat: now, exp },
      this.sessionSecretCache
    );
    this.ctx.storage.sql.exec(
      "INSERT INTO sessions (token_id, user_id, device_name, created_at, expires_at, revoked) VALUES (?, ?, ?, ?, ?, 0)",
      sid,
      user.id,
      deviceName,
      new Date(now).toISOString(),
      expiresAt
    );
    const cookieHeader = `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1e3)}`;
    return { token, cookieHeader };
  }
  getPresenceList(state) {
    const out = [];
    for (const ws of this.ctx.getWebSockets()) {
      const meta = ws.deserializeAttachment();
      if (!meta || !meta.authenticated) continue;
      const u = state.users.find((x) => x.id === meta.userId);
      if (u) {
        out.push({
          sessionId: meta.sessionId,
          userId: u.id,
          nameAr: u.nameAr,
          roleLabelAr: u.roleLabelAr,
          deviceName: meta.deviceName || u.deviceName,
          connectedAt: meta.connectedAt
        });
      }
    }
    return out;
  }
  broadcastStateChange(state, actorUserId, summary) {
    const presence = this.getPresenceList(state);
    for (const ws of this.ctx.getWebSockets()) {
      const meta = ws.deserializeAttachment();
      if (!meta || !meta.authenticated) continue;
      try {
        ws.send(
          JSON.stringify({
            type: "state:updated",
            actorUserId,
            summary,
            presence,
            state: this.getStateForUser(state, meta.userId)
          })
        );
      } catch {
      }
    }
  }
  async handleMutation(state, actor, method, pathname, body) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const { userId, deviceName } = actor;
    if (method === "PATCH" && pathname === "/api/settings") {
      state.settings = { ...state.settings, ...body };
      this.bumpRevision(state, "settings", "company");
      this.appendAudit(state, userId, "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A", "\u0625\u0639\u062F\u0627\u062F\u0627\u062A", "company", "\u062A\u062D\u062F\u064A\u062B \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0646\u0634\u0623\u0629", deviceName);
      this.persistState(state);
      return { settings: state.settings, state: this.getStateForUser(state, userId) };
    }
    if (method === "POST" && pathname === "/api/properties") {
      this.assertPermission(state, userId, "manage_properties");
      const prop = {
        id: uid("prop"),
        code: String(body.code || `PR-${state.properties.length + 101}`),
        nameAr: String(body.nameAr || "\u0639\u0642\u0627\u0631 \u062C\u062F\u064A\u062F"),
        nameEn: String(body.nameEn || body.nameAr || "New Property"),
        city: String(body.city || state.settings.city || "\u0627\u0644\u0631\u064A\u0627\u0636"),
        district: String(body.district || "\u0627\u0644\u0639\u0644\u064A\u0627"),
        street: String(body.street || ""),
        nationalAddress: String(body.nationalAddress || ""),
        type: body.type || "\u0633\u0643\u0646\u064A",
        deedNumber: String(body.deedNumber || ""),
        status: body.status || "\u0646\u0634\u0637",
        buildingsCount: Number(body.buildingsCount || 1),
        floorsCount: Number(body.floorsCount || 1),
        managementFeePercent: Number(body.managementFeePercent ?? state.settings.defaultManagementFeePercent ?? 5),
        ownershipMode: body.ownershipMode || "\u0625\u062F\u0627\u0631\u0629 \u0644\u0644\u063A\u064A\u0631",
        ownerShares: Array.isArray(body.ownerShares) ? body.ownerShares : [{ ownerId: state.owners[0]?.id || "own-1", sharePercent: 100 }],
        electricityMeterMain: String(body.electricityMeterMain || ""),
        waterMeterMain: String(body.waterMeterMain || ""),
        caretakerName: String(body.caretakerName || ""),
        caretakerPhone: String(body.caretakerPhone || ""),
        createdAt: now
      };
      state.properties.unshift(prop);
      this.bumpRevision(state, "properties", prop.id);
      this.appendAudit(state, userId, "\u0625\u0636\u0627\u0641\u0629 \u0639\u0642\u0627\u0631", "\u0639\u0642\u0627\u0631", prop.id, `\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0639\u0642\u0627\u0631 ${prop.nameAr}`, deviceName);
      this.persistState(state);
      return { property: prop, state: this.getStateForUser(state, userId) };
    }
    if (method === "POST" && pathname === "/api/units") {
      this.assertPermission(state, userId, "manage_properties");
      const monthly = Number(body.suggestedMonthlyRent || Math.round(Number(body.suggestedAnnualRent || 3e4) / 12));
      const unit = {
        id: uid("unit"),
        propertyId: String(body.propertyId || state.properties[0]?.id || ""),
        buildingName: String(body.buildingName || "\u0627\u0644\u0645\u0628\u0646\u0649 \u0627\u0644\u0631\u0626\u064A\u0633\u064A"),
        floor: Number(body.floor || 1),
        unitNumber: String(body.unitNumber || `${state.units.length + 101}`),
        unitType: body.unitType || "\u0634\u0642\u0629",
        areaSqm: Number(body.areaSqm || 120),
        rooms: Number(body.rooms || 3),
        bathrooms: Number(body.bathrooms || 2),
        furnished: Boolean(body.furnished),
        acCount: Number(body.acCount || 2),
        electricityMeter: String(body.electricityMeter || ""),
        waterMeter: String(body.waterMeter || ""),
        keyCount: Number(body.keyCount || 2),
        acRemoteCount: Number(body.acRemoteCount || 2),
        suggestedMonthlyRent: monthly,
        suggestedAnnualRent: Number(body.suggestedAnnualRent || monthly * 12),
        officeFee: Number(body.officeFee || 0),
        status: body.status || "\u0634\u0627\u063A\u0631\u0629"
      };
      state.units.push(unit);
      this.bumpRevision(state, "units", unit.id);
      this.persistState(state);
      return { unit, state: this.getStateForUser(state, userId) };
    }
    const unitStatusMatch = /^\/api\/units\/([^/]+)\/status$/.exec(pathname);
    if (method === "PATCH" && unitStatusMatch) {
      this.assertPermission(state, userId, "manage_properties");
      const unit = state.units.find((u) => u.id === unitStatusMatch[1]);
      if (!unit) throw new Error("\u0627\u0644\u0648\u062D\u062F\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
      unit.status = body.status;
      this.bumpRevision(state, "units", unit.id);
      this.persistState(state);
      return { unit, state: this.getStateForUser(state, userId) };
    }
    if (method === "POST" && pathname === "/api/tenants") {
      this.assertPermission(state, userId, "manage_tenants");
      const tenant = {
        id: uid("ten"),
        nameAr: String(body.nameAr || "\u0645\u0633\u062A\u0623\u062C\u0631 \u062C\u062F\u064A\u062F"),
        nameEn: String(body.nameEn || body.nameAr || "Tenant"),
        nationalIdOrIqama: String(body.nationalIdOrIqama || body.nationalId || ""),
        nationality: String(body.nationality || "\u0633\u0639\u0648\u062F\u064A"),
        phone: String(body.phone || ""),
        email: String(body.email || ""),
        tenantType: body.tenantType || "\u0641\u0631\u062F",
        classification: body.classification || "\u0646\u0634\u0637",
        rating: Number(body.rating ?? 5),
        notes: String(body.notes || ""),
        createdAt: now
      };
      state.tenants.unshift(tenant);
      this.bumpRevision(state, "tenants", tenant.id);
      this.persistState(state);
      return { tenant, state: this.getStateForUser(state, userId) };
    }
    const tenantMatch = /^\/api\/tenants\/([^/]+)$/.exec(pathname);
    if (method === "PATCH" && tenantMatch) {
      this.assertPermission(state, userId, "manage_tenants");
      const tenant = state.tenants.find((t) => t.id === tenantMatch[1]);
      if (!tenant) throw new Error("\u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      Object.assign(tenant, body);
      this.bumpRevision(state, "tenants", tenant.id);
      this.persistState(state);
      return { tenant, state: this.getStateForUser(state, userId) };
    }
    if (method === "DELETE" && tenantMatch) {
      this.assertPermission(state, userId, "manage_tenants");
      state.tenants = state.tenants.filter((t) => t.id !== tenantMatch[1]);
      this.bumpRevision(state, "tenants", tenantMatch[1]);
      this.persistState(state);
      return { ok: true, state: this.getStateForUser(state, userId) };
    }
    if (method === "POST" && pathname === "/api/contracts") {
      this.assertPermission(state, userId, "manage_contracts");
      const unitId = String(body.unitId || "");
      const contract = {
        id: uid("con"),
        internalNumber: String(body.internalNumber || `CNT-${state.contracts.length + 1001}`),
        ejarNumber: String(body.ejarNumber || ""),
        ejarStatus: body.ejarStatus || "\u063A\u064A\u0631 \u0645\u0648\u062B\u0642",
        lifecycleStatus: "\u0646\u0634\u0637",
        propertyId: String(body.propertyId || state.properties[0]?.id || ""),
        unitId,
        tenantId: String(body.tenantId || state.tenants[0]?.id || ""),
        startDate: String(body.startDate || now.slice(0, 10)),
        endDate: String(body.endDate || now.slice(0, 10)),
        annualRent: Number(body.annualRent || 3e4),
        paymentFrequency: body.paymentFrequency || "\u0634\u0647\u0631\u064A",
        installmentsCount: Number(body.installmentsCount || 12),
        securityDeposit: Number(body.securityDeposit || 2e3),
        officeFee: Number(body.officeFee || 0),
        managementCommissionPercent: Number(body.managementCommissionPercent ?? state.settings.defaultManagementFeePercent ?? 5),
        includedServices: String(body.includedServices || ""),
        version: 1,
        createdBy: userId,
        createdAt: now
      };
      state.contracts.unshift(contract);
      const unit = state.units.find((u) => u.id === unitId);
      if (unit) {
        unit.status = "\u0645\u0624\u062C\u0631\u0629";
        this.bumpRevision(state, "units", unit.id);
      }
      this.bumpRevision(state, "contracts", contract.id);
      this.persistState(state);
      return { contract, state: this.getStateForUser(state, userId) };
    }
    if (method === "POST" && pathname === "/api/payments") {
      this.assertPermission(state, userId, "collect_payments");
      const amount = Number(body.amount || 0);
      if (amount <= 0) throw new Error("\u0645\u0628\u0644\u063A \u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0635\u0641\u0631");
      const idempotencyKey = String(body.idempotencyKey || uid("idem"));
      const existing = state.payments.find((p) => p.idempotencyKey === idempotencyKey);
      if (existing) {
        return { payment: existing, duplicate: true, state: this.getStateForUser(state, userId) };
      }
      const contract = state.contracts.find((c) => c.id === body.contractId);
      if (!contract) throw new Error("\u0627\u0644\u0639\u0642\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      state.counters.receipt += 1;
      const allocations = [];
      if ((body.paymentType || "\u0625\u064A\u062C\u0627\u0631") === "\u0625\u064A\u062C\u0627\u0631") {
        let rem = amount;
        const openInsts = state.installments.filter((i) => i.contractId === contract.id && i.remainingAmount > 0 && i.status !== "\u0645\u0644\u063A\u0627\u0629").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        for (const inst of openInsts) {
          if (rem <= 0) break;
          const applied = Math.min(rem, inst.remainingAmount);
          inst.paidAmount = Math.round((inst.paidAmount + applied) * 100) / 100;
          inst.remainingAmount = Math.round((inst.amount - inst.paidAmount) * 100) / 100;
          inst.status = inst.remainingAmount === 0 ? "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644" : "\u0645\u062F\u0641\u0648\u0639\u0629 \u062C\u0632\u0626\u064A\u0627\u064B";
          allocations.push({ installmentId: inst.id, amount: applied });
          rem = Math.round((rem - applied) * 100) / 100;
          this.bumpRevision(state, "installments", inst.id);
        }
      }
      const payment = {
        id: uid("pay"),
        receiptNumber: `REC-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(state.counters.receipt).padStart(4, "0")}`,
        idempotencyKey,
        contractId: contract.id,
        unitId: contract.unitId,
        propertyId: contract.propertyId,
        tenantId: contract.tenantId,
        allocations,
        amount,
        currency: body.currency || "SAR",
        paymentMethod: body.paymentMethod || "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        paymentType: body.paymentType || "\u0625\u064A\u062C\u0627\u0631",
        referenceNumber: body.referenceNumber,
        receivedBy: userId,
        deviceName,
        status: "\u0645\u0639\u062A\u0645\u062F",
        notes: body.notes,
        createdAt: now
      };
      state.payments.unshift(payment);
      this.bumpRevision(state, "payments", payment.id);
      this.appendAudit(state, userId, "\u062A\u062D\u0635\u064A\u0644 \u062F\u0641\u0639\u0629", "\u062F\u0641\u0639\u0629", payment.id, `\u0633\u0646\u062F ${payment.receiptNumber} \u0628\u0645\u0628\u0644\u063A ${amount}`, deviceName);
      this.persistState(state);
      return { payment, state: this.getStateForUser(state, userId) };
    }
    if (method === "POST" && pathname === "/api/expenses") {
      this.assertPermission(state, userId, "create_expense");
      state.counters.expense += 1;
      const expense = {
        id: uid("exp"),
        expenseNumber: `EXP-${String(state.counters.expense).padStart(4, "0")}`,
        date: String(body.date || now.slice(0, 10)),
        category: body.category || "\u0635\u064A\u0627\u0646\u0629",
        propertyId: String(body.propertyId || state.properties[0]?.id || ""),
        unitId: body.unitId ? String(body.unitId) : void 0,
        vendorId: body.vendorId ? String(body.vendorId) : void 0,
        invoiceNumber: String(body.invoiceNumber || `INV-${Date.now().toString().slice(-5)}`),
        amount: Number(body.amount || 0),
        currency: body.currency || "SAR",
        paymentMethod: body.paymentMethod || "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        bearer: body.bearer || "\u0627\u0644\u0645\u0627\u0644\u0643",
        approvalStatus: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0634\u0631\u0641",
        notes: body.notes,
        createdBy: userId,
        createdAt: now
      };
      state.expenses.unshift(expense);
      this.bumpRevision(state, "expenses", expense.id);
      this.persistState(state);
      return { expense, state: this.getStateForUser(state, userId) };
    }
    if (method === "POST" && pathname === "/api/tickets") {
      this.assertPermission(state, userId, "manage_maintenance");
      state.counters.ticket += 1;
      const ticket = {
        id: uid("tkt"),
        ticketNumber: `MNT-${String(state.counters.ticket).padStart(4, "0")}`,
        propertyId: String(body.propertyId || state.properties[0]?.id || ""),
        unitId: String(body.unitId || state.units[0]?.id || ""),
        source: body.source || "\u0627\u0644\u0645\u0634\u0631\u0641",
        category: String(body.category || "\u0623\u062E\u0631\u0649"),
        priority: body.priority || "\u0645\u062A\u0648\u0633\u0637",
        title: String(body.title || "\u0628\u0644\u0627\u063A \u0635\u064A\u0627\u0646\u0629"),
        description: String(body.description || ""),
        estimatedCost: Number(body.estimatedCost || 0),
        actualCost: 0,
        status: "\u062C\u062F\u064A\u062F",
        createdBy: userId,
        createdAt: now,
        updatedAt: now
      };
      state.tickets.unshift(ticket);
      this.bumpRevision(state, "tickets", ticket.id);
      this.persistState(state);
      return { ticket, state: this.getStateForUser(state, userId) };
    }
    const tktMatch = /^\/api\/tickets\/([^/]+)$/.exec(pathname);
    if (method === "PATCH" && tktMatch) {
      const ticket = state.tickets.find((t) => t.id === tktMatch[1]);
      if (!ticket) throw new Error("\u0628\u0644\u0627\u063A \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      Object.assign(ticket, body, { updatedAt: now });
      this.bumpRevision(state, "tickets", ticket.id);
      this.persistState(state);
      return { ticket, state: this.getStateForUser(state, userId) };
    }
    if (method === "POST" && pathname === "/api/tasks") {
      const task = {
        id: uid("tsk"),
        title: String(body.title || "\u0645\u0647\u0645\u0629 \u062C\u062F\u064A\u062F\u0629"),
        description: String(body.description || ""),
        type: String(body.type || "\u0645\u062A\u0627\u0628\u0639\u0629"),
        priority: body.priority || "\u0645\u062A\u0648\u0633\u0637",
        assignedTo: String(body.assignedTo || userId),
        createdBy: userId,
        dueDate: String(body.dueDate || now.slice(0, 10)),
        status: "\u062C\u062F\u064A\u062F\u0629",
        checklist: Array.isArray(body.checklist) ? body.checklist : [],
        comments: [],
        createdAt: now
      };
      state.tasks.unshift(task);
      this.bumpRevision(state, "tasks", task.id);
      this.persistState(state);
      return { task, state: this.getStateForUser(state, userId) };
    }
    const tskMatch = /^\/api\/tasks\/([^/]+)$/.exec(pathname);
    if (method === "PATCH" && tskMatch) {
      const task = state.tasks.find((t) => t.id === tskMatch[1]);
      if (!task) throw new Error("\u0627\u0644\u0645\u0647\u0645\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
      Object.assign(task, body);
      this.bumpRevision(state, "tasks", task.id);
      this.persistState(state);
      return { task, state: this.getStateForUser(state, userId) };
    }
    if (method === "POST" && pathname === "/api/templates") {
      const template = {
        id: uid("tpl"),
        name: String(body.name || "\u0642\u0627\u0644\u0628 \u062C\u062F\u064A\u062F"),
        category: body.category || "custom",
        channel: body.channel || "whatsapp",
        language: body.language || "ar",
        contentAr: String(body.contentAr || ""),
        contentEn: body.contentEn ? String(body.contentEn) : void 0,
        usageCount: 0,
        createdBy: userId,
        updatedAt: now
      };
      state.communicationTemplates = [template, ...state.communicationTemplates || []];
      this.bumpRevision(state, "communicationTemplates", template.id);
      this.persistState(state);
      return { template, state: this.getStateForUser(state, userId) };
    }
    if (method === "POST" && pathname === "/api/notifications/read") {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        isReadBy: n.isReadBy.includes(userId) ? n.isReadBy : [...n.isReadBy, userId]
      }));
      this.persistState(state);
      return { ok: true, state: this.getStateForUser(state, userId) };
    }
    if (method === "POST" && pathname === "/api/permissions/toggle") {
      this.assertPermission(state, userId, "manage_users");
      const role = body.role;
      const perm = body.permission;
      const current = state.rolePermissions[role] || [];
      state.rolePermissions[role] = current.includes(perm) ? current.filter((p) => p !== perm) : [...current, perm];
      this.persistState(state);
      return { rolePermissions: state.rolePermissions, state: this.getStateForUser(state, userId) };
    }
    if (method === "POST" && pathname === "/api/workspace/reset-fresh") {
      this.assertPermission(state, userId, "backup_restore");
      state.properties = [];
      state.units = [];
      state.tenants = [];
      state.leads = [];
      state.contracts = [];
      state.installments = [];
      state.payments = [];
      state.expenses = [];
      state.tickets = [];
      state.tasks = [];
      state.documents = [];
      this.persistState(state);
      return { ok: true, state: this.getStateForUser(state, userId) };
    }
    throw new Error(`\u0645\u0633\u0627\u0631 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645 \u0628\u0639\u062F \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645 \u0627\u0644\u0633\u062D\u0627\u0628\u064A: ${method} ${pathname}`);
  }
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const state = await this.ensureBootstrapped();
    if (pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket upgrade", { status: 426 });
      }
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      const actor2 = await this.resolveActor(request, state);
      const attachment = {
        sessionId: actor2?.sessionId || uid("ws"),
        userId: actor2?.userId || "",
        authenticated: Boolean(actor2),
        deviceName: actor2?.deviceName || "Web Terminal",
        connectedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.ctx.acceptWebSocket(server);
      server.serializeAttachment(attachment);
      if (attachment.authenticated && attachment.userId) {
        server.send(
          JSON.stringify({
            type: "state:init",
            state: this.getStateForUser(state, attachment.userId),
            presence: this.getPresenceList(state)
          })
        );
      }
      return new Response(null, { status: 101, webSocket: client });
    }
    if (pathname === "/api/health") {
      return jsonResponse({
        ok: true,
        runtime: "cloudflare-workers-durable-objects",
        lastUpdatedAt: state.lastUpdatedAt,
        syncRevision: state.syncRevision || 1
      });
    }
    if (pathname === "/api/auth/session" && request.method === "GET") {
      const demoLoginEnabled = this.env.AQAR_DEMO_LOGIN !== "false";
      const actor2 = await this.resolveActor(request, state);
      const companyBranding = {
        nameAr: state.settings.nameAr,
        nameEn: state.settings.nameEn,
        logoDataUrl: state.settings.logoDataUrl
      };
      const loginProfiles = demoLoginEnabled ? state.users.filter((u) => u.active).map((u) => ({
        id: u.id,
        nameAr: u.nameAr,
        nameEn: u.nameEn,
        role: u.role,
        roleLabelAr: u.roleLabelAr,
        roleLabelEn: u.roleLabelEn,
        email: u.email
      })) : [];
      if (!actor2) {
        return jsonResponse({ authenticated: false, demoLoginEnabled, loginProfiles, companyBranding });
      }
      const user = state.users.find((u) => u.id === actor2.userId);
      return jsonResponse({
        authenticated: true,
        user,
        token: actor2.rawToken,
        demoLoginEnabled,
        loginProfiles,
        companyBranding
      });
    }
    if (pathname === "/api/auth/login" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const identifier = String(body.identifier || body.email || body.userId || "").trim().toLowerCase();
      const password = String(body.password || "");
      const phoneNeedle = normalizePhone(identifier);
      const user = state.users.find(
        (u) => u.active && (u.id.toLowerCase() === identifier || u.email.toLowerCase() === identifier || phoneNeedle.length >= 6 && normalizePhone(u.phone) === phoneNeedle)
      );
      if (!user) return jsonResponse({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" }, 401);
      const cred = this.ctx.storage.sql.exec("SELECT password_hash FROM user_credentials WHERE user_id = ?", user.id).toArray()[0];
      if (!cred || !await verifySecretWeb(password, cred.password_hash)) {
        return jsonResponse({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" }, 401);
      }
      const { token, cookieHeader } = await this.issueSession(user, String(body.deviceName || "Web Terminal"));
      return jsonResponse(
        { authenticated: true, user, token, state: this.getStateForUser(state, user.id) },
        200,
        { "Set-Cookie": cookieHeader }
      );
    }
    if (pathname === "/api/auth/login-pin" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const userId = String(body.userId || "usr-sys_owner");
      const pin = String(body.pin || "").trim();
      const user = state.users.find((u) => u.id === userId && u.active);
      if (!user) return jsonResponse({ error: "\u0627\u0644\u062D\u0633\u0627\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" }, 401);
      const cred = this.ctx.storage.sql.exec("SELECT pin_hash FROM user_credentials WHERE user_id = ?", user.id).toArray()[0];
      if (!cred || !await verifySecretWeb(pin, cred.pin_hash)) {
        return jsonResponse({ error: "\u0631\u0645\u0632 PIN \u063A\u064A\u0631 \u0635\u062D\u064A\u062D" }, 401);
      }
      const { token, cookieHeader } = await this.issueSession(user, String(body.deviceName || "Web Terminal"));
      return jsonResponse(
        { authenticated: true, user, token, state: this.getStateForUser(state, user.id) },
        200,
        { "Set-Cookie": cookieHeader }
      );
    }
    if (pathname === "/api/auth/logout" && request.method === "POST") {
      const token = this.extractToken(request);
      if (token && this.sessionSecretCache) {
        const claims = await verifyTokenWeb(token, this.sessionSecretCache);
        if (claims?.sid) {
          this.ctx.storage.sql.exec("UPDATE sessions SET revoked = 1 WHERE token_id = ?", claims.sid);
        }
      }
      return jsonResponse({ ok: true }, 200, {
        "Set-Cookie": `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
      });
    }
    if (pathname === "/api/public/prospect-context" && request.method === "GET") {
      return jsonResponse({
        companyNameAr: state.settings.nameAr,
        companyNameEn: state.settings.nameEn,
        properties: state.properties.map((p) => ({ id: p.id, nameAr: p.nameAr, city: p.city, district: p.district })),
        vacantUnits: state.units.filter((u) => u.status === "\u0634\u0627\u063A\u0631\u0629" || u.status === "\u0642\u064A\u062F \u0627\u0644\u062A\u0623\u062C\u064A\u0631").map((u) => ({
          id: u.id,
          propertyId: u.propertyId,
          unitNumber: u.unitNumber,
          unitType: u.unitType,
          suggestedAnnualRent: u.suggestedAnnualRent,
          areaSqm: u.areaSqm,
          rooms: u.rooms
        }))
      });
    }
    if (pathname === "/api/public/leads" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const lead = {
        id: uid("lead"),
        nameAr: String(body.nameAr || ""),
        phone: String(body.phone || ""),
        source: String(body.source || "\u0627\u0633\u062A\u0628\u064A\u0627\u0646 \u0631\u0627\u0628\u0637 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A"),
        propertyId: String(body.propertyId || state.properties[0]?.id || ""),
        unitId: String(body.unitId || state.units[0]?.id || ""),
        offeredRent: Number(body.offeredRent || 0),
        budgetMonthly: Math.round(Number(body.offeredRent || 0) / 12),
        viewingDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        status: "\u062C\u062F\u064A\u062F",
        assignedTo: "usr-agent1",
        notes: String(body.notes || ""),
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      state.leads.unshift(lead);
      this.persistState(state);
      return jsonResponse({ lead, ok: true }, 201);
    }
    const actor = !PUBLIC_PATHS.has(pathname) && !pathname.startsWith("/api/public/lead-decision/") ? await this.resolveActor(request, state) : null;
    if (!PUBLIC_PATHS.has(pathname) && !pathname.startsWith("/api/public/lead-decision/") && !actor) {
      return jsonResponse(
        { error: "\u0627\u0646\u062A\u0647\u062A \u0627\u0644\u062C\u0644\u0633\u0629 \u0623\u0648 \u0644\u0645 \u064A\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u2014 \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629", code: "AUTH_REQUIRED" },
        401
      );
    }
    const verifiedActor = actor;
    if (pathname === "/api/state" && request.method === "GET") {
      return jsonResponse({
        state: this.getStateForUser(state, verifiedActor.userId),
        presence: this.getPresenceList(state)
      });
    }
    if (pathname === "/api/auth/credentials" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const targetUserId = String(body.targetUserId || verifiedActor.userId);
      if (targetUserId !== verifiedActor.userId) {
        this.assertPermission(state, verifiedActor.userId, "manage_users");
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const row = this.ctx.storage.sql.exec(
        "SELECT password_hash, pin_hash FROM user_credentials WHERE user_id = ?",
        targetUserId
      ).toArray()[0];
      let pwHash = row?.password_hash || await hashSecretWeb("Aqar@2026");
      let pinHash = row?.pin_hash || await hashSecretWeb("1234");
      if (body.newPassword && String(body.newPassword).length >= 6) {
        pwHash = await hashSecretWeb(String(body.newPassword));
      }
      if (body.newPin && /^\d{4,6}$/.test(String(body.newPin))) {
        pinHash = await hashSecretWeb(String(body.newPin));
      }
      this.ctx.storage.sql.exec(
        "INSERT OR REPLACE INTO user_credentials (user_id, password_hash, pin_hash, updated_at) VALUES (?, ?, ?, ?)",
        targetUserId,
        pwHash,
        pinHash,
        now
      );
      return jsonResponse({ ok: true, state: this.getStateForUser(state, verifiedActor.userId) });
    }
    if (pathname === "/api/backups" && request.method === "POST") {
      this.assertPermission(state, verifiedActor.userId, "backup_restore");
      const body = await request.json().catch(() => ({}));
      const snapshotData = JSON.parse(JSON.stringify(state));
      const encryptPassword = body.encryptPassword ? String(body.encryptPassword) : void 0;
      const encrypted = Boolean(encryptPassword && encryptPassword.trim().length > 0);
      const id = uid("bkp");
      const payloadToStore = encrypted ? await encryptBackupWeb(snapshotData, encryptPassword) : snapshotData;
      const rawPayload = JSON.stringify(payloadToStore);
      const bkpMeta = {
        id,
        label: String(body.label || `\u0646\u0633\u062E\u0629 \u0633\u062D\u0627\u0628\u064A\u0629 \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("ar-SA")}`),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        createdBy: verifiedActor.userId,
        sizeKb: Math.max(1, Math.round(rawPayload.length / 1024)),
        recordCount: state.properties.length + state.units.length + state.tenants.length + state.contracts.length + state.payments.length,
        encrypted
      };
      this.ctx.storage.sql.exec(
        "INSERT INTO backups_store (id, payload_json, created_at) VALUES (?, ?, ?)",
        id,
        rawPayload,
        bkpMeta.createdAt
      );
      state.backups.unshift(bkpMeta);
      this.persistState(state);
      return jsonResponse({ backup: bkpMeta, state: this.getStateForUser(state, verifiedActor.userId) }, 201);
    }
    const bkpPreviewMatch = /^\/api\/backups\/([^/]+)\/preview$/.exec(pathname);
    if (bkpPreviewMatch && (request.method === "POST" || request.method === "GET")) {
      this.assertPermission(state, verifiedActor.userId, "backup_restore");
      const bkpId = bkpPreviewMatch[1];
      const meta = state.backups.find((b) => b.id === bkpId);
      const row = this.ctx.storage.sql.exec("SELECT payload_json FROM backups_store WHERE id = ?", bkpId).toArray()[0];
      if (!row) {
        return jsonResponse({
          id: bkpId,
          label: meta?.label || "",
          exists: false,
          encrypted: Boolean(meta?.encrypted),
          propertiesCount: 0,
          unitsCount: 0,
          tenantsCount: 0,
          contractsCount: 0,
          paymentsCount: 0,
          templatesCount: 0
        });
      }
      const parsed = JSON.parse(row.payload_json);
      let snap;
      if ("aqarEncrypted" in parsed && parsed.aqarEncrypted) {
        const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
        const password = body.password ? String(body.password) : url.searchParams.get("password") || "";
        if (!password) {
          return jsonResponse({
            id: bkpId,
            exists: true,
            encrypted: true,
            requiresPassword: true,
            propertiesCount: 0,
            unitsCount: 0,
            tenantsCount: 0,
            contractsCount: 0,
            paymentsCount: 0,
            templatesCount: 0
          });
        }
        try {
          snap = await decryptBackupWeb(parsed, password);
        } catch {
          return jsonResponse({
            id: bkpId,
            exists: true,
            encrypted: true,
            requiresPassword: true,
            decryptionError: "\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0641\u0643 \u0627\u0644\u062A\u0634\u0641\u064A\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629",
            propertiesCount: 0,
            unitsCount: 0,
            tenantsCount: 0,
            contractsCount: 0,
            paymentsCount: 0,
            templatesCount: 0
          });
        }
      } else {
        snap = parsed;
      }
      const diffCollection = (cur = [], inc = []) => {
        const curMap = new Map(cur.map((x) => [x.id, JSON.stringify(x)]));
        let added = 0;
        let updated = 0;
        let unchanged = 0;
        for (const item of inc) {
          const ex = curMap.get(item.id);
          if (!ex) added += 1;
          else if (ex === JSON.stringify(item)) unchanged += 1;
          else updated += 1;
        }
        return { added, updated, unchanged };
      };
      const diff = {
        properties: diffCollection(state.properties, snap.properties),
        units: diffCollection(state.units, snap.units),
        tenants: diffCollection(state.tenants, snap.tenants),
        contracts: diffCollection(state.contracts, snap.contracts),
        payments: diffCollection(state.payments, snap.payments),
        expenses: diffCollection(state.expenses, snap.expenses),
        tickets: diffCollection(state.tickets, snap.tickets)
      };
      const totalChanged = Object.values(diff).reduce((s, d) => s + d.added + d.updated, 0);
      const preview = {
        id: bkpId,
        exists: true,
        encrypted: "aqarEncrypted" in parsed,
        propertiesCount: snap.properties?.length || 0,
        unitsCount: snap.units?.length || 0,
        tenantsCount: snap.tenants?.length || 0,
        contractsCount: snap.contracts?.length || 0,
        paymentsCount: snap.payments?.length || 0,
        templatesCount: snap.communicationTemplates?.length || 0,
        lastUpdatedAt: snap.lastUpdatedAt,
        diff: { ...diff, totalChanged }
      };
      return jsonResponse(preview);
    }
    const bkpRestoreMatch = /^\/api\/backups\/([^/]+)\/restore$/.exec(pathname);
    if (bkpRestoreMatch && request.method === "POST") {
      this.assertPermission(state, verifiedActor.userId, "backup_restore");
      const bkpId = bkpRestoreMatch[1];
      const body = await request.json().catch(() => ({}));
      const row = this.ctx.storage.sql.exec("SELECT payload_json FROM backups_store WHERE id = ?", bkpId).toArray()[0];
      if (!row) return jsonResponse({ error: "\u0627\u0644\u0646\u0633\u062E\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" }, 404);
      const parsed = JSON.parse(row.payload_json);
      let snap;
      if ("aqarEncrypted" in parsed && parsed.aqarEncrypted) {
        if (!body.password) return jsonResponse({ error: "\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0641\u0643 \u0627\u0644\u062A\u0634\u0641\u064A\u0631 \u0645\u0637\u0644\u0648\u0628\u0629" }, 400);
        snap = await decryptBackupWeb(parsed, String(body.password));
      } else {
        snap = parsed;
      }
      const safetyId = uid("bkp-safety");
      this.ctx.storage.sql.exec(
        "INSERT INTO backups_store (id, payload_json, created_at) VALUES (?, ?, ?)",
        safetyId,
        JSON.stringify(state),
        (/* @__PURE__ */ new Date()).toISOString()
      );
      if (body.mode === "merge") {
        const mergeById = (cur = [], inc = []) => {
          const seen = new Set(cur.map((x) => x.id));
          return [...cur, ...inc.filter((x) => !seen.has(x.id))];
        };
        state.properties = mergeById(state.properties, snap.properties);
        state.units = mergeById(state.units, snap.units);
        state.tenants = mergeById(state.tenants, snap.tenants);
        state.contracts = mergeById(state.contracts, snap.contracts);
        state.installments = mergeById(state.installments, snap.installments);
        state.payments = mergeById(state.payments, snap.payments);
        state.expenses = mergeById(state.expenses, snap.expenses);
        state.tickets = mergeById(state.tickets, snap.tickets);
        state.tasks = mergeById(state.tasks, snap.tasks);
        state.documents = mergeById(state.documents, snap.documents);
      } else {
        const preservedBackups = state.backups;
        Object.assign(state, snap);
        state.backups = preservedBackups;
      }
      this.persistState(state);
      this.broadcastStateChange(state, verifiedActor.userId, "\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0646\u0633\u062E\u0629 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629");
      return jsonResponse({ ok: true, mode: body.mode || "replace", state: this.getStateForUser(state, verifiedActor.userId) });
    }
    if (pathname === "/api/sync/batch" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const operations = Array.isArray(body.operations) ? body.operations : [];
      let uploaded = 0;
      let skippedDuplicates = 0;
      let conflictsDetected = 0;
      const newConflicts = [];
      const errors = [];
      for (const op of operations) {
        const operationId = String(op.operationId || op.idempotencyKey || op.id || "");
        if (!operationId) continue;
        const existingOp = this.ctx.storage.sql.exec("SELECT operation_id FROM operations_log WHERE operation_id = ?", operationId).toArray()[0];
        if (existingOp) {
          skippedDuplicates += 1;
          continue;
        }
        if (op.entityType && op.entityId && typeof op.baseRevision === "number") {
          const revKey = `${op.entityType}:${op.entityId}`;
          const serverRev = state.entityRevisions?.[revKey] || 0;
          if (serverRev > op.baseRevision) {
            conflictsDetected += 1;
            const conflict = {
              id: uid("cnf"),
              entityType: op.entityType,
              entityId: op.entityId,
              entityLabel: `${op.entityType}:${op.entityId}`,
              firstActorName: "\u062A\u062D\u062F\u064A\u062B \u0645\u062D\u0641\u0648\u0638 \u0639\u0644\u0649 \u0627\u0644\u062E\u0627\u062F\u0645",
              secondActorName: verifiedActor.deviceName,
              firstChangeSummary: `\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u062E\u0627\u062F\u0645 #${serverRev}`,
              secondChangeSummary: `\u0639\u0645\u0644\u064A\u0629 \u062C\u0647\u0627\u0632 \u0627\u0644\u0639\u0645\u064A\u0644 (${op.endpoint}) \u0645\u0646 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 #${op.baseRevision}`,
              status: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u062F\u064A\u0631",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            };
            if (!state.syncConflicts) state.syncConflicts = [];
            state.syncConflicts.unshift(conflict);
            newConflicts.push(conflict);
          }
        }
        try {
          const res = await this.handleMutation(state, verifiedActor, op.method || "POST", op.endpoint, op.body || {});
          uploaded += 1;
          this.ctx.storage.sql.exec(
            "INSERT INTO operations_log (operation_id, user_id, method, endpoint, status, response_json, processed_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            operationId,
            verifiedActor.userId,
            op.method || "POST",
            op.endpoint,
            "applied",
            JSON.stringify({ ok: true, id: res?.id }),
            (/* @__PURE__ */ new Date()).toISOString()
          );
        } catch (err) {
          errors.push(err.message);
        }
      }
      if (conflictsDetected > 0) this.persistState(state);
      if (uploaded > 0) {
        this.broadcastStateChange(state, verifiedActor.userId, `\u0645\u0632\u0627\u0645\u0646\u0629 ${uploaded} \u0639\u0645\u0644\u064A\u0629 \u0645\u0646 \u0627\u0644\u0639\u0645\u0644 \u062F\u0648\u0646 \u0625\u0646\u062A\u0631\u0646\u062A`);
      }
      return jsonResponse({
        success: errors.length === 0,
        uploaded,
        skippedDuplicates,
        conflictsDetected,
        newConflicts,
        errors,
        state: this.getStateForUser(state, verifiedActor.userId),
        syncedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (pathname === "/api/sync/delta" && request.method === "GET") {
      const since = url.searchParams.get("since");
      const hasChanges = !since || new Date(state.lastUpdatedAt).getTime() > new Date(since).getTime();
      return jsonResponse({
        hasChanges,
        serverRevision: state.syncRevision || 1,
        lastUpdatedAt: state.lastUpdatedAt,
        pendingConflictsCount: (state.syncConflicts || []).filter((c) => c.status === "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u062F\u064A\u0631").length,
        syncConflicts: state.syncConflicts || [],
        state: hasChanges ? this.getStateForUser(state, verifiedActor.userId) : void 0
      });
    }
    if (request.method === "POST" || request.method === "PATCH" || request.method === "DELETE") {
      try {
        const body = await request.json().catch(() => ({}));
        const result = await this.handleMutation(state, verifiedActor, request.method, pathname, body);
        this.broadcastStateChange(state, verifiedActor.userId, `\u062A\u062D\u062F\u064A\u062B ${pathname}`);
        return jsonResponse(result, request.method === "POST" ? 201 : 200);
      } catch (err) {
        return jsonResponse({ error: err.message }, 400);
      }
    }
    return jsonResponse({ error: "Not Found" }, 404);
  }
  async webSocketMessage(ws, message) {
    try {
      const text = typeof message === "string" ? message : new TextDecoder().decode(message);
      const msg = JSON.parse(text);
      if (msg.type === "session:identify") {
        const state = await this.ensureBootstrapped();
        const dummyReq = new Request("https://worker.local/ws");
        const actor = await this.resolveActor(dummyReq, state, msg.token);
        if (!actor) {
          ws.send(JSON.stringify({ type: "auth:required" }));
          return;
        }
        const meta = {
          sessionId: actor.sessionId,
          userId: actor.userId,
          authenticated: true,
          deviceName: msg.deviceName || actor.deviceName,
          connectedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        ws.serializeAttachment(meta);
        ws.send(
          JSON.stringify({
            type: "state:init",
            state: this.getStateForUser(state, actor.userId),
            presence: this.getPresenceList(state)
          })
        );
      }
    } catch {
    }
  }
  async webSocketClose(ws, code, reason) {
    try {
      ws.close(code, reason);
    } catch {
    }
  }
};

// worker/src/index.ts
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/") || url.pathname === "/ws") {
      const id = env.WORKSPACE_DO.idFromName("aqarplus-main-workspace");
      const stub = env.WORKSPACE_DO.get(id);
      return stub.fetch(request);
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  AqarWorkspaceDO,
  index_default as default
};
