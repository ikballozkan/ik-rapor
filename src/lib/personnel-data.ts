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
  /** Bu ay işe alınanlardan aynı ay içinde çıkanlar */
  ayniAyCikisSayisi: number;
  toplamCikisSayisi: number;
  erkek: number;
  kadin: number;
  // ── Ayrıntılı giriş/çıkış kırılımı (opsiyonel) ──
  girisErkek?: number;
  girisKadin?: number;
  /** Tüm çıkışlar (ay dışından gelenler dahil) */
  toplamAyCikis?: number;
  cikisErkek?: number;
  cikisKadin?: number;
  /** Bu ay alınanlardan aynı ay çıkan erkek */
  ayniAyCikisErkek?: number;
  /** Bu ay alınanlardan aynı ay çıkan kadın */
  ayniAyCikisKadin?: number;
  /** Geçen ay devreden erkek personel */
  gecenAySonuErkek?: number;
  /** Geçen ay devreden kadın personel */
  gecenAySonuKadin?: number;
  // ── Özel gruplar ──
  ozurluGecenAyErkek?: number;
  ozurluGecenAyKadin?: number;
  ozurluGirisErkek?: number;
  ozurluGirisKadin?: number;
  ozurluCikisErkek?: number;
  ozurluCikisKadin?: number;
  ozurluAySonuErkek?: number;
  ozurluAySonuKadin?: number;
  eskiHukumluGecenAyErkek?: number;
  eskiHukumluGecenAyKadin?: number;
  eskiHukumluGirisErkek?: number;
  eskiHukumluGirisKadin?: number;
  eskiHukumluCikisErkek?: number;
  eskiHukumluCikisKadin?: number;
  eskiHukumluAySonuErkek?: number;
  eskiHukumluAySonuKadin?: number;
  // ── Departman kırılımı (opsiyonel) ──
  departman?: {
    operator?: number;   // Operatör
    uretim?: number;     // Üretim
    idariIsler?: number; // İdari İşler
    uretimSef?: number;  // Üretim Şef
    [key: string]: number | undefined;
  };
}

export const PERSONNEL_DATA: PersonnelRecord[] = [
  {
    no: 1,
    ay: "OCAK",
    ayIndex: 1,
    toplamPersonel: 551,
    girisaSayisi: 174,
    ayniAyCikisSayisi: 43,
    toplamAyCikis: 89,       // Ocak toplam çıkış
    toplamCikisSayisi: 89,   // YTD
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
    toplamAyCikis: 75,        // Şubat toplam çıkış
    toplamCikisSayisi: 164,   // YTD (89+75)
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
    toplamAyCikis: 99,        // Mart toplam çıkış
    toplamCikisSayisi: 263,   // YTD (164+99)
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
    toplamAyCikis: 93,        // Nisan toplam çıkış
    toplamCikisSayisi: 356,   // YTD (263+93)
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
    toplamAyCikis: 72,        // Mayıs toplam çıkış
    toplamCikisSayisi: 428,   // YTD (356+72)
    erkek: 303,
    kadin: 158,
  },
  {
    no: 6,
    ay: "HAZİRAN",
    ayIndex: 6,
    // Kaynak: Haziran 2026 SGK personel hareket tablosu
    toplamPersonel: 338,
    girisaSayisi: 41,
    ayniAyCikisSayisi: 78,
    toplamAyCikis: 78,        // Haziran toplam çıkış
    toplamCikisSayisi: 506,   // YTD (428+78)
    erkek: 198,
    kadin: 140,
    girisErkek: 19,
    girisKadin: 22,
    cikisErkek: 49,
    cikisKadin: 29,
    gecenAySonuErkek: 228,
    gecenAySonuKadin: 147,
    ozurluGecenAyErkek: 10,
    ozurluGecenAyKadin: 5,
    ozurluGirisErkek: 0,
    ozurluGirisKadin: 0,
    ozurluCikisErkek: 0,
    ozurluCikisKadin: 0,
    ozurluAySonuErkek: 10,
    ozurluAySonuKadin: 5,
    eskiHukumluGecenAyErkek: 0,
    eskiHukumluGecenAyKadin: 0,
    eskiHukumluGirisErkek: 0,
    eskiHukumluGirisKadin: 0,
    eskiHukumluCikisErkek: 0,
    eskiHukumluCikisKadin: 0,
    eskiHukumluAySonuErkek: 0,
    eskiHukumluAySonuKadin: 0,
  },
  {
    no: 7,
    ay: "TEMMUZ",
    ayIndex: 7,
    toplamPersonel: 349,
    girisaSayisi: 38,
    /** Temmuz'da alınan 30E+8K'dan 6E+2K aynı ay çıktı */
    ayniAyCikisSayisi: 8,   // aynı ayda alınıp çıkan (6E+2K)
    toplamAyCikis: 41,      // toplam çıkış
    toplamCikisSayisi: 118, // YTD (77 + 41)
    erkek: 216,
    kadin: 133,
    girisErkek: 30,
    girisKadin: 8,
    cikisErkek: 26,
    cikisKadin: 15,
    ayniAyCikisErkek: 6,
    ayniAyCikisKadin: 2,
  },
  {
    no: 8,
    ay: "AĞUSTOS",
    ayIndex: 8,
    // Kaynak: Ağustos 2026 SGK personel hareket tablosu
    toplamPersonel: 332,
    girisaSayisi: 48,
    ayniAyCikisSayisi: 41,  // ay içinde ayrılanlar (toplam)
    toplamAyCikis: 41,
    toplamCikisSayisi: 41,
    erkek: 201,
    kadin: 131,
    girisErkek: 36,
    girisKadin: 12,
    cikisErkek: 26,
    cikisKadin: 15,
    // Departman kırılımı (Devam / Devamsızlık takibi)
    departman: {
      uretim: 152,
      operator: 40,
    },
  },
  {
    no: 9,
    ay: "EYLÜL",
    ayIndex: 9,
    // Kaynak: Eylül 2026 SGK personel hareket tablosu
    toplamPersonel: 392,
    girisaSayisi: 135,
    ayniAyCikisSayisi: 75,  // ay içinde ayrılanlar (toplam)
    toplamAyCikis: 75,
    toplamCikisSayisi: 75,
    erkek: 254,
    kadin: 138,
    girisErkek: 97,
    girisKadin: 38,
    cikisErkek: 44,
    cikisKadin: 31,
    // Departman kırılımı
    departman: {
      operator: 59,
      uretim: 161,
      idariIsler: 13,
      uretimSef: 5,
    },
  },
  {
    no: 10,
    ay: "EKİM",
    ayIndex: 10,
    // Kaynak: Ekim 2026 — Devam eden ay (Başlangıç: Eylül sonu 254E + 138K = 392)
    toplamPersonel: 392,
    girisaSayisi: 0,
    ayniAyCikisSayisi: 0,
    toplamAyCikis: 0,
    toplamCikisSayisi: 0,
    erkek: 254,
    kadin: 138,
    girisErkek: 0,
    girisKadin: 0,
    cikisErkek: 0,
    cikisKadin: 0,
    gecenAySonuErkek: 254,
    gecenAySonuKadin: 138,
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

/**
 * Aylık Personel Devir Oranı (Turnover) hesaplama
 * Formül: Çıkan / ((Dönem Başı + Dönem Sonu) / 2) × 100
 * Dönem başı = önceki ayın toplam personeli
 * Dönem sonu = bu ayın toplam personeli
 * Çıkan      = bu aydaki toplam çıkış (toplamAyCikis ?? ayniAyCikisSayisi)
 */
export interface TurnoverRow {
  ay: string;
  ayIndex: number;
  donemBasi: number;
  donemSonu: number;
  ortCalisan: number;
  cikan: number;
  turnoverOrani: number; // yüzde (ör: 11.6)
}

export function getTurnoverData(data: PersonnelRecord[]): TurnoverRow[] {
  const rows: TurnoverRow[] = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const donemBasi = prev.toplamPersonel;
    const donemSonu = curr.toplamPersonel;
    const ortCalisan = (donemBasi + donemSonu) / 2;
    const cikan = curr.toplamAyCikis ?? curr.ayniAyCikisSayisi;
    const turnoverOrani = ortCalisan > 0
      ? Number(((cikan / ortCalisan) * 100).toFixed(2))
      : 0;
    rows.push({
      ay: curr.ay,
      ayIndex: curr.ayIndex,
      donemBasi,
      donemSonu,
      ortCalisan: Number(ortCalisan.toFixed(1)),
      cikan,
      turnoverOrani,
    });
  }
  return rows;
}
