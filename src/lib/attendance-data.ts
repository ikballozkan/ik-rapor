/**
 * Aylık Devam & Devamsızlık (Devamsızlık Yapmayanlar) Veri Yapısı
 */

export interface DeptAttendanceItem {
  id: string;
  departman: string;
  devamsizlikYapmayan: number;
  toplamPersonel?: number;
}

export interface MonthAttendanceRecord {
  ayNo: number; // 1..12
  ayAdi: string;
  yil: number;
  items: DeptAttendanceItem[];
  not?: string;
  isCurrentMonth?: boolean;
}

export const DEFAULT_DEPARTMENTS = [
  "ÜRETİM",
  "OPERATÖR",
  "İDARİ İŞLER",
  "ÜRETİM ŞEF",
];

export const MONTH_NAMES: { no: number; ad: string }[] = [
  { no: 1, ad: "OCAK" },
  { no: 2, ad: "ŞUBAT" },
  { no: 3, ad: "MART" },
  { no: 4, ad: "NİSAN" },
  { no: 5, ad: "MAYIS" },
  { no: 6, ad: "HAZİRAN" },
  { no: 7, ad: "TEMMUZ" },
  { no: 8, ad: "AĞUSTOS" },
  { no: 9, ad: "EYLÜL" },
  { no: 10, ad: "EKİM" },
  { no: 11, ad: "KASIM" },
  { no: 12, ad: "ARALIK" },
];

/** Başlangıç Verileri */
export const INITIAL_ATTENDANCE_DATA: Record<number, MonthAttendanceRecord> = {
  // Ağustos 2026 — Kullanıcı tarafından iletilen resmi veriler
  8: {
    ayNo: 8,
    ayAdi: "AĞUSTOS",
    yil: 2026,
    items: [
      { id: "dept-8-1", departman: "ÜRETİM", devamsizlikYapmayan: 152, toplamPersonel: 152 },
      { id: "dept-8-2", departman: "OPERATÖR", devamsizlikYapmayan: 40, toplamPersonel: 40 },
    ],
    not: "Ağustos ayı tam devam sağlayan (devamsızlık yapmayan) personel listesi.",
    isCurrentMonth: false,
  },
  // Eylül 2026 — Kullanıcı tarafından iletilen resmi veriler
  9: {
    ayNo: 9,
    ayAdi: "EYLÜL",
    yil: 2026,
    items: [
      { id: "dept-1", departman: "ÜRETİM", devamsizlikYapmayan: 161, toplamPersonel: 161 },
      { id: "dept-2", departman: "OPERATÖR", devamsizlikYapmayan: 59, toplamPersonel: 59 },
      { id: "dept-3", departman: "İDARİ İŞLER", devamsizlikYapmayan: 13, toplamPersonel: 13 },
      { id: "dept-4", departman: "ÜRETİM ŞEF", devamsizlikYapmayan: 5, toplamPersonel: 5 },
    ],
    not: "Eylül ayı tam devam sağlayan (devamsızlık yapmayan) personel listesi.",
    isCurrentMonth: false,
  },
  // Ekim 2026 — Güncel devam eden dönem
  10: {
    ayNo: 10,
    ayAdi: "EKİM",
    yil: 2026,
    items: [
      { id: "dept-1", departman: "ÜRETİM", devamsizlikYapmayan: 0, toplamPersonel: 0 },
      { id: "dept-2", departman: "OPERATÖR", devamsizlikYapmayan: 0, toplamPersonel: 0 },
      { id: "dept-3", departman: "İDARİ İŞLER", devamsizlikYapmayan: 0, toplamPersonel: 0 },
      { id: "dept-4", departman: "ÜRETİM ŞEF", devamsizlikYapmayan: 0, toplamPersonel: 0 },
    ],
    not: "Ekim 2026 devam eden ay veri girişi.",
    isCurrentMonth: true,
  },
};
