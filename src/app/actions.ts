"use server";

import { db } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";

// ─── Yardımcı: Dönem ID üret ───────────────────────────────────────────────
function periodId(year: number, month: number) {
  return `${year}_${month}`;
}

// ─── KPI Record al ─────────────────────────────────────────────────────────
export async function getKpiRecord(year: number, month: number) {
  const docRef = db.collection("kpiRecords").doc(periodId(year, month));
  const snap = await docRef.get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}

// ─── Sirkülasyon Kaydet ────────────────────────────────────────────────────
export async function saveTurnover(year: number, month: number, data: any) {
  const averageEmployee = (data.startCount + data.endCount) / 2;
  const turnoverRate =
    averageEmployee > 0 ? (data.leftCount / averageEmployee) * 100 : 0;

  await db
    .collection("kpiRecords")
    .doc(periodId(year, month))
    .set(
      {
        year,
        month,
        updatedAt: FieldValue.serverTimestamp(),
        turnover: {
          startCount: data.startCount,
          endCount: data.endCount,
          leftCount: data.leftCount,
          turnoverRate: Number(turnoverRate.toFixed(2)),
        },
      },
      { merge: true }
    );

  revalidatePath("/kpi/turnover");
  return { success: true };
}

// ─── Devamsızlık Kaydet ────────────────────────────────────────────────────
export async function saveAbsenteeism(year: number, month: number, data: any) {
  await db
    .collection("kpiRecords")
    .doc(periodId(year, month))
    .set(
      {
        year,
        month,
        updatedAt: FieldValue.serverTimestamp(),
        absenteeism: {
          paidLeave: data.paidLeave,
          unpaidLeave: data.unpaidLeave,
          sickLeave: data.sickLeave,
          absent: data.absent,
          shiftA: data.shiftA ?? 0,
          shiftB: data.shiftB ?? 0,
          shiftC: data.shiftC ?? 0,
          warehouse: data.warehouse ?? 0,
          whiteCollar: data.whiteCollar ?? 0,
        },
      },
      { merge: true }
    );

  revalidatePath("/kpi/absenteeism");
  return { success: true };
}

// ─── Fazla Mesai Kaydet ────────────────────────────────────────────────────
export async function saveOvertime(year: number, month: number, data: any) {
  await db
    .collection("kpiRecords")
    .doc(periodId(year, month))
    .set(
      {
        year,
        month,
        updatedAt: FieldValue.serverTimestamp(),
        overtime: {
          shiftA: data.shiftA ?? 0,
          shiftB: data.shiftB ?? 0,
          shiftC: data.shiftC ?? 0,
          warehouse: data.warehouse ?? 0,
          admin: data.admin ?? 0,
          whiteCollar: data.whiteCollar ?? 0,
        },
      },
      { merge: true }
    );

  revalidatePath("/kpi/overtime");
  return { success: true };
}

// ─── Eğitim Kaydet ─────────────────────────────────────────────────────────
export async function saveTraining(year: number, month: number, data: any) {
  await db
    .collection("kpiRecords")
    .doc(periodId(year, month))
    .set(
      {
        year,
        month,
        updatedAt: FieldValue.serverTimestamp(),
        training: {
          technicalCount: data.technicalCount ?? 0,
          technicalHours: data.techHours ?? 0,
          isgCount: data.isgCount ?? 0,
          isgHours: data.isgHours ?? 0,
          managementCount: data.managementCount ?? 0,
          managementHours: data.mgmtHours ?? 0,
        },
      },
      { merge: true }
    );

  revalidatePath("/kpi/training");
  return { success: true };
}

// ─── İş Kazası Kaydet ─────────────────────────────────────────────────────
export async function saveAccident(year: number, month: number, data: any) {
  await db
    .collection("kpiRecords")
    .doc(periodId(year, month))
    .set(
      {
        year,
        month,
        updatedAt: FieldValue.serverTimestamp(),
        accident: {
          totalAccidents: data.totalAccidents ?? 0,
          operator: data.operator ?? 0,
          capak: data.capak ?? 0,
          aksesuar: data.aksesuar ?? 0,
          paketleme: data.paketleme ?? 0,
          depo: data.depo ?? 0,
          idariIsler: data.idariIsler ?? 0,
          beyazYaka: data.beyazYaka ?? 0,
        },
      },
      { merge: true }
    );

  revalidatePath("/kpi/accident");
  return { success: true };
}

// ─── Trend Verisi ──────────────────────────────────────────────────────────
export async function getTrendData() {
  const snap = await db
    .collection("kpiRecords")
    .orderBy("year", "asc")
    .orderBy("month", "asc")
    .limit(12)
    .get();

  const monthNames = [
    "",
    "Oca","Şub","Mar","Nis","May","Haz",
    "Tem","Ağu","Eyl","Eki","Kas","Ara",
  ];

  return snap.docs.map((doc: any) => {
    const r = doc.data();

    const fazlaMesai = r.overtime
      ? (r.overtime.shiftA ?? 0) +
        (r.overtime.shiftB ?? 0) +
        (r.overtime.shiftC ?? 0) +
        (r.overtime.warehouse ?? 0) +
        (r.overtime.admin ?? 0) +
        (r.overtime.whiteCollar ?? 0)
      : 0;

    let devamsizlik = 0;
    if (r.absenteeism) {
      const total =
        (r.absenteeism.paidLeave ?? 0) +
        (r.absenteeism.unpaidLeave ?? 0) +
        (r.absenteeism.sickLeave ?? 0) +
        (r.absenteeism.absent ?? 0);
      devamsizlik = Number(((total / (22 * 8 * 1000)) * 100).toFixed(2));
    }

    return {
      name: `${monthNames[r.month]} ${String(r.year).substring(2)}`,
      sirkulasyon: r.turnover?.turnoverRate ?? 0,
      devamsizlik,
      fazlaMesai,
      isKazasi: r.accident?.totalAccidents ?? 0,
      teknik: r.training?.technicalHours ?? 0,
      isg: r.training?.isgHours ?? 0,
      yonetsel: r.training?.managementHours ?? 0,
    };
  });
}

// ─── Karşılaştırma Verisi ──────────────────────────────────────────────────
export async function getComparisonData(year1: number, year2: number) {
  const snap1 = await db
    .collection("kpiRecords")
    .where("year", "==", year1)
    .get();
  const snap2 = await db
    .collection("kpiRecords")
    .where("year", "==", year2)
    .get();

  const records = [
    ...snap1.docs.map((d: any) => ({ id: d.id, ...d.data() })),
    ...snap2.docs.map((d: any) => ({ id: d.id, ...d.data() })),
  ];

  return records;
}

// ─── Personel Bilgi Takip (Excel Verisi) ──────────────────────────────────
export async function getPersonnelSummary() {
  const {
    PERSONNEL_DATA,
    LATEST_PERSONNEL,
    PREV_PERSONNEL,
    getGenderData,
    getPersonnelTrendData,
    percentChange,
  } = await import("@/lib/personnel-data");

  return {
    latest: LATEST_PERSONNEL,
    previous: PREV_PERSONNEL,
    all: PERSONNEL_DATA,
    genderData: getGenderData(),
    trendData: getPersonnelTrendData(),
    changes: {
      toplamPersonel: percentChange(
        LATEST_PERSONNEL.toplamPersonel,
        PREV_PERSONNEL.toplamPersonel
      ),
      giris: percentChange(
        LATEST_PERSONNEL.girisaSayisi,
        PREV_PERSONNEL.girisaSayisi
      ),
      cikis: percentChange(
        LATEST_PERSONNEL.ayniAyCikisSayisi,
        PREV_PERSONNEL.ayniAyCikisSayisi
      ),
    },
  };
}

// ─── Kullanıcılar ──────────────────────────────────────────────────────────
export async function getUsers() {
  const snap = await db
    .collection("users")
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
  }));
}

export async function addUser(data: {
  name: string;
  email: string;
  role: string;
  password?: string;
}) {
  await db.collection("users").add({
    name: data.name,
    email: data.email,
    password: data.password || "password123",
    role: data.role,
    firstLogin: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath("/users");
  return { success: true };
}

export async function updateUser(
  id: string,
  data: {
    name: string;
    email: string;
    role: string;
    password?: string;
    firstLogin?: boolean;
  }
) {
  const updateData: any = {
    name: data.name,
    email: data.email,
    role: data.role,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (data.password !== undefined) {
    updateData.password = data.password;
  }
  if (data.firstLogin !== undefined) {
    updateData.firstLogin = data.firstLogin;
  }

  await db.collection("users").doc(id).set(updateData, { merge: true });

  revalidatePath("/users");
  return { success: true };
}

export async function setFirstLoginDone(id: string) {
  await db.collection("users").doc(id).set(
    {
      firstLogin: false,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  revalidatePath("/users");
  return { success: true };
}
