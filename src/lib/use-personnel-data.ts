/**
 * usePersonnelData — Firebase override'larını PERSONNEL_DATA ile birleştirir.
 * Tüm dashboard sayfaları bu hook'u kullanır.
 */
"use client";

import { useState, useEffect } from "react";
import { PERSONNEL_DATA, PersonnelRecord, percentChange } from "./personnel-data";
import { getPersonnelOverrides } from "@/app/actions";

function buildMerged(overrides: Record<number, Partial<PersonnelRecord>>): PersonnelRecord[] {
  return PERSONNEL_DATA.map((r) => ({ ...r, ...(overrides[r.no] ?? {}) }));
}

export function usePersonnelData() {
  const [overrides, setOverrides] = useState<Record<number, Partial<PersonnelRecord>>>({});
  const [ready, setReady] = useState(false);

  async function fetchOverrides() {
    try {
      const data = await getPersonnelOverrides();
      setOverrides(data);
    } catch {
      // Firebase yoksa boş bırak, statik veri kullanılır
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    fetchOverrides();

    // Veri Güncelle sayfasından kaydet event'i gelince yenile
    const handler = () => fetchOverrides();
    window.addEventListener("personel-data-updated", handler);
    return () => window.removeEventListener("personel-data-updated", handler);
  }, []);

  const allData = buildMerged(overrides);
  const latest = allData[allData.length - 1];
  const prev = allData.length > 1 ? allData[allData.length - 2] : allData[0];

  const changes = {
    toplam: percentChange(latest.toplamPersonel, prev.toplamPersonel),
    giris:  percentChange(latest.girisaSayisi,   prev.girisaSayisi),
    cikis:  percentChange(latest.ayniAyCikisSayisi, prev.ayniAyCikisSayisi),
  };

  const personnelTrend = allData
    .filter((r) => r.toplamPersonel > 0)
    .map((r) => ({
      name: r.ay.charAt(0) + r.ay.slice(1).toLowerCase().substring(0, 2),
      Toplam: r.toplamPersonel,
      Erkek:  r.erkek,
      Kadın:  r.kadin,
      Giriş:  r.girisaSayisi,
      Çıkış:  r.ayniAyCikisSayisi,
      current: r.isCurrentMonth,
    }));

  const genderData = [
    { name: "Erkek", value: latest.erkek },
    { name: "Kadın", value: latest.kadin },
  ];

  return { allData, latest, prev, changes, personnelTrend, genderData, ready, refetch: fetchOverrides };
}
