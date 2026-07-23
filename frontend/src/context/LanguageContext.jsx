import React, { createContext, useContext, useState } from "react";

const translations = {
  en: {
    dashboard: "Dashboard",
    workers: "Workers",
    attendance: "Attendance",
    statusBoard: "Status Board",
    departments: "Departments",
    reports: "Reports",
    adminPanel: "Admin Panel",
    logout: "Log Out",
    totalWorkers: "Total Workers",
    activeWorkers: "Active Workers",
    onLeave: "On Leave",
    absent: "Absent",
    overtimeWorkers: "Overtime Workers",
    newWorkers: "New Workers",
    attendanceRate: "Attendance Rate",
    recentActivity: "Recent Activity Timeline",
    searchPlaceholder: "Search by name, ID, phone...",
    addWorker: "Add Worker",
    editWorker: "Edit Worker",
    deleteWorker: "Delete Worker",
    emergencyContact: "Emergency Contact",
    role: "Role",
    language: "Language",
    theme: "Theme",
    qrScanner: "QR Code Attendance",
    faceScanner: "Face Recognition Scanner",
    notifications: "Notifications",
    todaySummary: "Today's Summary",
    exportCsv: "Export CSV",
    exportPdf: "Export PDF",
    backupDb: "Backup Database",
    restoreDb: "Restore Database",
    auditLogs: "Audit Logs",
    attendanceTrend: "Attendance Trend (Last 7 Days)",
    departmentDistribution: "Department Workers",
    statusDistribution: "Worker Status Distribution",
    overtimeStatistics: "Overtime Statistics (Hours/Month)",
  },
  es: {
    dashboard: "Tablero",
    workers: "Trabajadores",
    attendance: "Asistencia",
    statusBoard: "Tabla de Estado",
    departments: "Departamentos",
    reports: "Informes",
    adminPanel: "Panel de Admin",
    logout: "Cerrar Sesión",
    totalWorkers: "Total de Trabajadores",
    activeWorkers: "Trabajadores Activos",
    onLeave: "De Licencia",
    absent: "Ausentes",
    overtimeWorkers: "Trabajadores de Horas Extras",
    newWorkers: "Nuevos Trabajadores",
    attendanceRate: "Tasa de Asistencia",
    recentActivity: "Línea de Actividad Reciente",
    searchPlaceholder: "Buscar por nombre, ID, teléfono...",
    addWorker: "Agregar Trabajador",
    editWorker: "Editar Trabajador",
    deleteWorker: "Eliminar Trabajador",
    emergencyContact: "Contacto de Emergencia",
    role: "Rol",
    language: "Idioma",
    theme: "Tema",
    qrScanner: "Asistencia por Código QR",
    faceScanner: "Escáner de Reconocimiento Facial",
    notifications: "Notificaciones",
    todaySummary: "Resumen de Hoy",
    exportCsv: "Exportar CSV",
    exportPdf: "Exportar PDF",
    backupDb: "Copia de Seguridad",
    restoreDb: "Restaurar Base de Datos",
    auditLogs: "Registros de Auditoría",
    attendanceTrend: "Tendencia de Asistencia (Últimos 7 Días)",
    departmentDistribution: "Trabajadores por Departamento",
    statusDistribution: "Distribución de Estado",
    overtimeStatistics: "Horas Extras (Horas/Mes)",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    workers: "कर्मचारी",
    attendance: "उपस्थिति",
    statusBoard: "स्थिति बोर्ड",
    departments: "विभाग",
    reports: "रिपोर्ट",
    adminPanel: "एडमिन पैनल",
    logout: "लॉग आउट",
    totalWorkers: "कुल कर्मचारी",
    activeWorkers: "सक्रिय कर्मचारी",
    onLeave: "छुट्टी पर",
    absent: "अनुपस्थित",
    overtimeWorkers: "ओवरटाइम कर्मचारी",
    newWorkers: "नए कर्मचारी",
    attendanceRate: "उपस्थिति दर",
    recentActivity: "हाल की गतिविधि",
    searchPlaceholder: "नाम, आईडी या फोन से खोजें...",
    addWorker: "कर्मचारी जोड़ें",
    editWorker: "कर्मचारी बदलें",
    deleteWorker: "कर्मचारी हटाएं",
    emergencyContact: "आपातकालीन संपर्क",
    role: "भूमिका",
    language: "भाषा",
    theme: "थीम",
    qrScanner: "क्यूआर कोड उपस्थिति",
    faceScanner: "चेहरा पहचान स्कैनर",
    notifications: "सूचनाएं",
    todaySummary: "आज का सारांश",
    exportCsv: "CSV निर्यात करें",
    exportPdf: "PDF निर्यात करें",
    backupDb: "डेटाबेस बैकअप",
    restoreDb: "डेटाबेस पुनर्स्थापित करें",
    auditLogs: "ऑडिट लॉग्स",
    attendanceTrend: "उपस्थिति रुझान (अंतिम 7 दिन)",
    departmentDistribution: "विभाग अनुसार कर्मचारी",
    statusDistribution: "कर्मचारी स्थिति वितरण",
    overtimeStatistics: "ओवरटाइम आँकड़े (घंटे/माह)",
  },
};

const LanguageContext = createContext(undefined);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("worker_sys_lang");
    return saved === "en" || saved === "es" || saved === "hi" ? saved : "en";
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("worker_sys_lang", lang);
  };

  const t = (key) => {
    return translations[language][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
