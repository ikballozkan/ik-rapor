/**
 * Personel Bilgi Takip Verileri
 * Kaynak: personel bilgi takip.xlsx
 * Güncelleme: 2026
 */

export interface PersonnelRecord {
  /** Ay henüz tamamlanmamışsa true */
  isCurrentMonth?: boolean;
  no: number;
  ay: string;
  ayIndex: number; // 1=Ocak, 2=Şubat, ...
  toplamPersonel: number;
  girisaSayisi: number;
  ayniAyCikisSayisi: number;
  toplamCikisSayisi: number;
  erkek: number;
  kadin: number;
}

export const PERSONNEL_DATA: PersonnelRecord[] = [
  {
    no: 1,
    ay: "OCAK",
    ayIndex: 1,
    toplamPersonel: 551,
    girisaSayisi: 174,
    ayniAyCikisSayisi: 43,
    toplamCikisSayisi: 89,
    erkek: 390,
    kadin: 161,
  },
  {
    no: 2,
    ay: "ŞUBAT",
    ayIndex: 2,
    toplamPersonel: 577,
    girisaSayisi: 115,
    ayniAyCikisSayisi: 28,
    toplamCikisSayisi: 75,
    erkek: 431,
    kadin: 146,
  },
  {
    no: 3,
    ay: "MART",
    ayIndex: 3,
    toplamPersonel: 559,
    girisaSayisi: 57,
    ayniAyCikisSayisi: 17,
    toplamCikisSayisi: 99,
    erkek: 418,
    kadin: 141,
  },
  {
    no: 4,
    ay: "NİSAN",
    ayIndex: 4,
    toplamPersonel: 493,
    girisaSayisi: 33,
    ayniAyCikisSayisi: 10,
    toplamCikisSayisi: 93,
    erkek: 350,
    kadin: 143,
  },
  {
    no: 5,
    ay: "MAYIS",
    ayIndex: 5,
    toplamPersonel: 461,
    girisaSayisi: 61,
    ayniAyCikisSayisi: 20,
    toplamCikisSayisi: 72,
    erkek: 303,
    kadin: 158,
  },
  {
    no: 6,
    ay: "HAZİRAN",
    ayIndex: 6,
    toplamPersonel: 354,
    girisaSayisi: 42,
    ayniAyCikisSayisi: 13,
    toplamCikisSayisi: 77,
    erkek: 214,
    kadin: 140,
    isCurrentMonth: true,
  },
];

/** En son veri (en güncel ay) */
export const LATEST_PERSONNEL = PERSONNEL_DATA[PERSONNEL_DATA.length - 1];

/** Önceki ay verisi (değişim hesabı için) */
export const PREV_PERSONNEL =
  PERSONNEL_DATA.length > 1
    ? PERSONNEL_DATA[PERSONNEL_DATA.length - 2]
    : PERSONNEL_DATA[0];

/** Cinsiyet dağılımı (son ay) */
export function getGenderData() {
  return [
    { name: "Erkek", value: LATEST_PERSONNEL.erkek },
    { name: "Kadın", value: LATEST_PERSONNEL.kadin },
  ];
}

/** Aylık trend verisi (tüm aylar) */
export function getPersonnelTrendData() {
  return PERSONNEL_DATA.map((r) => ({
    name: r.ay.charAt(0) + r.ay.slice(1).toLowerCase().slice(0, 2),
    toplamPersonel: r.toplamPersonel,
    giris: r.girisaSayisi,
    cikis: r.ayniAyCikisSayisi,
    erkek: r.erkek,
    kadin: r.kadin,
  }));
}

/** Yüzde değişim hesabı */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}
