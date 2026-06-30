/**
 * Geçmiş IK Rapor Verileri — 2025
 * Kaynak: İK RAPORLAMA.xlsx
 */

// ─── Tipler ──────────────────────────────────────────────────────────────────

export interface MonthlyKpiRow {
  ay: string;
  ayIndex: number;
  yil: number;
}

export interface SirkulasyonRow extends MonthlyKpiRow {
  oran: number; // ondalık (0.05 = %5)
}

export interface DevamsizlikRow extends MonthlyKpiRow {
  oran: number;
}

export interface FazlaMesaiRow extends MonthlyKpiRow {
  oran: number;
}

export interface IsKazasiRow extends MonthlyKpiRow {
  adet: number;
}

export interface EgitimRow {
  donem: string;
  kisiSayisi: number;
  toplamAdamSaat: number;
  donemselEgitimSaati: number;
}

export interface IcTerfiRow {
  donem: string;
  adet: number;
  calisanSayisi: number;
  oran: number;
}

export interface GorusmeIsAlimRow {
  ay: string;
  gorusmeyCagrilan: number;
  gorusulen: number;
  iseAlinan: number;
}

export interface CinsiyetRow {
  cinsiyet: string;
  kisiSayisi: number;
  oran: number;
}

export interface YasOrtalamaRow {
  donem: string;
  toplamYas: number;
  calisanSayisi: number;
  ortalama: number;
}

export interface EgitimDurumuRow {
  tahsil: string;
  kisiSayisi: number;
  oran: number;
}

export interface DirekEndirektRow {
  ay: string;
  direkOrani: number;
  endirektOrani: number;
}

export interface ServisRow extends MonthlyKpiRow {
  dolulukOrani: number;
}

// ─── 2025 Personel Sirkülasyon Oranı ─────────────────────────────────────────
const AYLAR = ["OCAK","ŞUBAT","MART","NİSAN","MAYIS","HAZİRAN","TEMMUZ","AĞUSTOS","EYLÜL","EKİM","KASIM","ARALIK"];

const SIRKULASYON_2025_RAW = [0.0546, 0.0532, 0.085, 0.0596, 0.0561, 0.046, 0.3275, 0.119, 0.1502, 0.0747, 0.1476, 0.1308];
export const SIRKULASYON_2025: SirkulasyonRow[] = SIRKULASYON_2025_RAW.map((oran, i) => ({
  ay: AYLAR[i], ayIndex: i + 1, yil: 2025, oran,
}));
export const SIRKULASYON_2025_ORT = 0.1041;

// ─── 2025 Devamsızlık Oranı ───────────────────────────────────────────────────
const DEVAMSIZLIK_2025_RAW = [0.0196, 0.0161, 0.0187, 0.0264, 0.1024, 0.2118, 0.1351, 0.0642, 0.1079, 0.065, 0.069, 0.0338];
export const DEVAMSIZLIK_2025: DevamsizlikRow[] = DEVAMSIZLIK_2025_RAW.map((oran, i) => ({
  ay: AYLAR[i], ayIndex: i + 1, yil: 2025, oran,
}));
export const DEVAMSIZLIK_2025_ORT = 0.0725;

// ─── 2025 Fazla Mesai Oranı ───────────────────────────────────────────────────
const FAZLAMEMI_2025_RAW = [0.0226, 0.0292, 0.037, 0.0632, 0.053, 0.0485, 0.0167, 0.0445, 0.0188, 0.0141, 0.0349, 0.0145];
export const FAZLAMESAI_2025: FazlaMesaiRow[] = FAZLAMEMI_2025_RAW.map((oran, i) => ({
  ay: AYLAR[i], ayIndex: i + 1, yil: 2025, oran,
}));
export const FAZLAMESAI_2025_ORT = 0.0331;

// ─── 2025 İş Kazası ───────────────────────────────────────────────────────────
const ISKAZA_2025_RAW = [0.34, 0.32, 0.34, 0.32, 0.34, 0, 0, 0, 0, 0, 0, 0];
export const ISKAZA_2025: IsKazasiRow[] = ISKAZA_2025_RAW.map((adet, i) => ({
  ay: AYLAR[i], ayIndex: i + 1, yil: 2025, adet,
}));
export const ISKAZA_2025_ORT = 0.138;

// ─── 2025 Eğitim Adam Saat ───────────────────────────────────────────────────
export const EGITIM_2025: EgitimRow[] = [
  { donem: "2025/1.Çeyrek", kisiSayisi: 600, toplamAdamSaat: 0.533, donemselEgitimSaati: 320 },
  { donem: "2025/2.Çeyrek", kisiSayisi: 586, toplamAdamSaat: 1.604, donemselEgitimSaati: 940 },
  { donem: "2025/3.Çeyrek", kisiSayisi: 321, toplamAdamSaat: 0.773, donemselEgitimSaati: 248 },
  { donem: "2025/4.Çeyrek", kisiSayisi: 357, toplamAdamSaat: 0.899, donemselEgitimSaati: 321 },
];
export const EGITIM_2025_TOPLAM_SAAT = 320 + 940 + 248 + 321; // 1829

// ─── 2025 İç Terfi ───────────────────────────────────────────────────────────
export const IC_TERFI_2025: IcTerfiRow[] = [
  { donem: "2025/1.Çeyrek", adet: 34, calisanSayisi: 600, oran: 0.0567 },
  { donem: "2025/2.Çeyrek", adet: 11, calisanSayisi: 586, oran: 0.0188 },
  { donem: "2025/3.Çeyrek", adet:  2, calisanSayisi: 386, oran: 0.0052 },
  { donem: "2025/4.Çeyrek", adet:  5, calisanSayisi: 357, oran: 0.0140 },
];
export const IC_TERFI_2025_TOPLAM = 52;

// ─── 2025 Görüşme & İşe Alım ─────────────────────────────────────────────────
export const GORUSME_ISEALIM_2025: GorusmeIsAlimRow[] = [
  { ay: "Ocak",    gorusmeyCagrilan: 60, gorusulen: 55, iseAlinan: 36 },
  { ay: "Şubat",   gorusmeyCagrilan: 45, gorusulen: 40, iseAlinan: 35 },
  { ay: "Mart",    gorusmeyCagrilan: 15, gorusulen:  9, iseAlinan:  5 },
  { ay: "Nisan",   gorusmeyCagrilan: 80, gorusulen: 55, iseAlinan: 35 },
  { ay: "Mayıs",   gorusmeyCagrilan: 30, gorusulen: 25, iseAlinan: 17 },
  { ay: "Haziran", gorusmeyCagrilan: 40, gorusulen: 35, iseAlinan: 23 },
  { ay: "Temmuz",  gorusmeyCagrilan: 11, gorusulen: 11, iseAlinan:  8 },
  { ay: "Ağustos", gorusmeyCagrilan: 23, gorusulen: 20, iseAlinan: 11 },
  { ay: "Eylül",   gorusmeyCagrilan: 67, gorusulen: 59, iseAlinan: 45 },
  { ay: "Ekim",    gorusmeyCagrilan: 50, gorusulen: 40, iseAlinan: 30 },
];

// ─── Cinsiyet Dağılımı (2025 Snapshot) ───────────────────────────────────────
export const CINSIYET_2025: CinsiyetRow[] = [
  { cinsiyet: "Erkek", kisiSayisi: 361, oran: 0.7293 },
  { cinsiyet: "Kadın", kisiSayisi: 134, oran: 0.2707 },
];

// ─── Kurum Yaş Ortalaması ────────────────────────────────────────────────────
export const YAS_ORTALAMA_2025: YasOrtalamaRow[] = [
  { donem: "Nisan 25",   toplamYas: 15100,    calisanSayisi: 591, ortalama: 25.55 },
  { donem: "Mayıs 25",   toplamYas: 16170,    calisanSayisi: 608, ortalama: 26.60 },
  { donem: "Haziran 25", toplamYas: 16250,    calisanSayisi: 586, ortalama: 27.73 },
  { donem: "Temmuz 25",  toplamYas: 10445,    calisanSayisi: 335, ortalama: 31.18 },
  { donem: "Ağustos 25", toplamYas: 11497,    calisanSayisi: 378, ortalama: 30.42 },
  { donem: "Eylül 25",   toplamYas: 11101.5,  calisanSayisi: 386, ortalama: 28.76 },
  { donem: "Ekim 25",    toplamYas: 12287.6,  calisanSayisi: 348, ortalama: 35.31 },
  { donem: "Kasım 25",   toplamYas: 11168.5,  calisanSayisi: 359, ortalama: 31.11 },
  { donem: "Aralık 25",  toplamYas: 10968.4,  calisanSayisi: 428, ortalama: 25.63 },
];

// ─── Eğitim Durumu ────────────────────────────────────────────────────────────
export const EGITIM_DURUMU_2025: EgitimDurumuRow[] = [
  { tahsil: "İlkokul",             kisiSayisi: 62,  oran: 0.1449 },
  { tahsil: "Ortaokul",            kisiSayisi: 73,  oran: 0.1706 },
  { tahsil: "Lise",                kisiSayisi: 208, oran: 0.4860 },
  { tahsil: "Meslek Yüksek Okulu", kisiSayisi: 35,  oran: 0.0818 },
  { tahsil: "Üniversite",          kisiSayisi: 50,  oran: 0.1168 },
];

// ─── Direk / Endirekt Personel ────────────────────────────────────────────────
export const DIREK_ENDIREKT_2025: DirekEndirektRow[] = [
  { ay: "Oca", direkOrani: 93.34, endirektOrani:  6.66 },
  { ay: "Şub", direkOrani: 93.30, endirektOrani:  6.70 },
  { ay: "Mar", direkOrani: 92.90, endirektOrani:  7.10 },
  { ay: "Nis", direkOrani: 90.96, endirektOrani:  9.03 },
  { ay: "May", direkOrani: 90.78, endirektOrani:  9.03 },
  { ay: "Haz", direkOrani: 89.76, endirektOrani: 10.23 },
  { ay: "Tem", direkOrani: 87.16, endirektOrani: 12.83 },
  { ay: "Ağu", direkOrani: 85.71, endirektOrani: 14.50 },
  { ay: "Eyl", direkOrani: 88.08, endirektOrani: 11.91 },
  { ay: "Eki", direkOrani: 94.47, endirektOrani:  5.52 },
  { ay: "Kas", direkOrani: 92.40, endirektOrani:  4.52 },
  { ay: "Ara", direkOrani: 93.62, endirektOrani:  4.90 },
];

// ─── Servis Doluluk Oranı ────────────────────────────────────────────────────
const SERVIS_2025_RAW = [0.6132, 0.6154, 0.613, 0.6216, 0.604, 0.598, 0.6423, 0.8873, 0.8988, 0.0084, 0.0088, 0.0091];
export const SERVIS_2025: ServisRow[] = SERVIS_2025_RAW.map((dolulukOrani, i) => ({
  ay: AYLAR[i], ayIndex: i + 1, yil: 2025, dolulukOrani,
}));

// ─── Özet (rapor sayfası için) ───────────────────────────────────────────────
export const HISTORICAL_SUMMARY_2025 = {
  yil: 2025,
  sirkulasyonOrt: `%${(SIRKULASYON_2025_ORT * 100).toFixed(1)}`,
  devamsizlikOrt: `%${(DEVAMSIZLIK_2025_ORT * 100).toFixed(1)}`,
  fazlaMesaiOrt:  `%${(FAZLAMESAI_2025_ORT * 100).toFixed(1)}`,
  isKazasiOrt:    ISKAZA_2025_ORT.toFixed(2),
  toplamEgitimSaati: EGITIM_2025_TOPLAM_SAAT,
  icTerfiToplam: IC_TERFI_2025_TOPLAM,
  erkekOrani: `%${(CINSIYET_2025[0].oran * 100).toFixed(1)}`,
  kadinOrani:  `%${(CINSIYET_2025[1].oran * 100).toFixed(1)}`,
};
