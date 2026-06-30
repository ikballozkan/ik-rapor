/**
 * usePersonnelData — localStorage override'larını PERSONNEL_DATA ile birleştirir.
 * Tüm dashboard sayfaları bu hook'u kullanır; Veri Güncelle'de yapılan değişiklikler
 * anında yansır.
 */
"use client";

import { useState, useEffect } from "react";
import { PERSONNEL_DATA, PersonnelRecord, percentChange } from "./personnel-data";

const STORAGE_KEY = "trizone_personel_overrides";

function loadOverrides(): Record<number, Partial<PersonnelRecord>> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function buildMerged(overrides: Record<number, Partial<PersonnelRecord>>): PersonnelRecord[] {
  return PERSONNEL_DATA.map((r) => ({ ...r, ...(overrides[r.no] ?? {}) }));
}

export function usePersonnelData() {
  const [overrides, setOverrides] = useState<Record<number, Partial<PersonnelRecord>>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOverrides(loadOverrides());
    setReady(true);

    // Veri Güncelle sayfasından gelen event'i dinle
    const handler = () => setOverrides(loadOverrides());
    window.addEventListener("personel-data-updated", handler);
    // storage event: farklı sekmede yapılan değişiklikleri de yakala
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("personel-data-updated", handler);
      window.removeEventListener("storage", handler);
    };
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

  return { allData, latest, prev, changes, personnelTrend, genderData, ready };
}
