"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getKpiRecord(year: number, month: number) {
  return await prisma.kpiRecord.findUnique({
    where: {
      year_month: {
        year,
        month,
      },
    },
    include: {
      turnover: true,
      absenteeism: true,
      overtime: true,
      training: true,
      accident: true,
    },
  });
}

export async function saveTurnover(year: number, month: number, data: any) {
  let record = await prisma.kpiRecord.findUnique({
    where: { year_month: { year, month } }
  });

  if (!record) {
    record = await prisma.kpiRecord.create({
      data: { year, month }
    });
  }

  const averageEmployee = (data.startCount + data.endCount) / 2;
  const turnoverRate = averageEmployee > 0 ? (data.leftCount / averageEmployee) * 100 : 0;

  await prisma.turnoverStat.upsert({
    where: { kpiRecordId: record.id },
    update: {
      startCount: data.startCount,
      endCount: data.endCount,
      leftCount: data.leftCount,
      turnoverRate: turnoverRate,
    },
    create: {
      kpiRecordId: record.id,
      startCount: data.startCount,
      endCount: data.endCount,
      leftCount: data.leftCount,
      turnoverRate: turnoverRate,
    }
  });

  revalidatePath("/kpi/turnover");
  return { success: true };
}

export async function saveAbsenteeism(year: number, month: number, data: any) {
  let record = await prisma.kpiRecord.findUnique({
    where: { year_month: { year, month } }
  });

  if (!record) {
    record = await prisma.kpiRecord.create({
      data: { year, month }
    });
  }

  await prisma.absenteeismStat.upsert({
    where: { kpiRecordId: record.id },
    update: {
      paidLeave: data.paidLeave,
      unpaidLeave: data.unpaidLeave,
      sickLeave: data.sickLeave,
      absent: data.absent,
    },
    create: {
      kpiRecordId: record.id,
      paidLeave: data.paidLeave,
      unpaidLeave: data.unpaidLeave,
      sickLeave: data.sickLeave,
      absent: data.absent,
    }
  });

  revalidatePath("/kpi/absenteeism");
  return { success: true };
}

export async function saveOvertime(year: number, month: number, data: any) {
  let record = await prisma.kpiRecord.findUnique({
    where: { year_month: { year, month } }
  });

  if (!record) {
    record = await prisma.kpiRecord.create({
      data: { year, month }
    });
  }

  await prisma.overtimeStat.upsert({
    where: { kpiRecordId: record.id },
    update: {
      shiftA: data.shiftA,
      shiftB: data.shiftB,
      shiftC: data.shiftC,
    },
    create: {
      kpiRecordId: record.id,
      shiftA: data.shiftA,
      shiftB: data.shiftB,
      shiftC: data.shiftC,
    }
  });

  revalidatePath("/kpi/overtime");
  return { success: true };
}

export async function saveTraining(year: number, month: number, data: any) {
  let record = await prisma.kpiRecord.findUnique({
    where: { year_month: { year, month } }
  });

  if (!record) {
    record = await prisma.kpiRecord.create({
      data: { year, month }
    });
  }

  await prisma.trainingStat.upsert({
    where: { kpiRecordId: record.id },
    update: {
      technicalHours: data.techHours,
      isgHours: data.isgHours,
      managementHours: data.mgmtHours,
    },
    create: {
      kpiRecordId: record.id,
      technicalHours: data.techHours,
      isgHours: data.isgHours,
      managementHours: data.mgmtHours,
    }
  });

  revalidatePath("/kpi/training");
  return { success: true };
}

export async function saveAccident(year: number, month: number, data: any) {
  let record = await prisma.kpiRecord.findUnique({
    where: { year_month: { year, month } }
  });

  if (!record) {
    record = await prisma.kpiRecord.create({
      data: { year, month }
    });
  }

  await prisma.accidentStat.upsert({
    where: { kpiRecordId: record.id },
    update: {
      totalAccidents: data.totalAccidents,
    },
    create: {
      kpiRecordId: record.id,
      totalAccidents: data.totalAccidents,
    }
  });

  revalidatePath("/kpi/accident");
  return { success: true };
}

export async function getTrendData() {
  const records = await prisma.kpiRecord.findMany({
    orderBy: [
      { year: 'asc' },
      { month: 'asc' }
    ],
    include: {
      turnover: true,
      absenteeism: true,
      overtime: true,
      training: true,
      accident: true,
    },
    take: 12
  });

  const monthNames = ["", "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

  return records.map(r => {
    // Toplam mesai hesabı
    const fazlaMesai = r.overtime ? (r.overtime.shiftA + r.overtime.shiftB + r.overtime.shiftC + r.overtime.warehouse + r.overtime.admin + r.overtime.whiteCollar) : 0;
    
    // Devamsızlık hesabı
    let devamsizlik = 0;
    if (r.absenteeism) {
      const totalHours = r.absenteeism.paidLeave + r.absenteeism.unpaidLeave + r.absenteeism.sickLeave + r.absenteeism.absent;
      const workHours = 22 * 8 * 1000;
      devamsizlik = Number(((totalHours / workHours) * 100).toFixed(2));
    }

    return {
      name: `${monthNames[r.month]} ${r.year.toString().substring(2)}`,
      sirkulasyon: r.turnover?.turnoverRate || 0,
      devamsizlik: devamsizlik,
      fazlaMesai: fazlaMesai,
      isKazasi: r.accident?.totalAccidents || 0,
      teknik: r.training?.technicalHours || 0,
      isg: r.training?.isgHours || 0,
      yonetsel: r.training?.managementHours || 0,
    };
  });
}

export async function getComparisonData(year1: number, year2: number) {
  const records = await prisma.kpiRecord.findMany({
    where: {
      OR: [
        { year: year1 },
        { year: year2 }
      ]
    },
    include: {
      turnover: true,
      absenteeism: true,
      overtime: true,
      training: true,
      accident: true,
    }
  });
  
  return records;
}

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addUser(data: { name: string, email: string, role: any }) {
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: "password123", // Default password for newly created users
      role: data.role
    }
  });
  revalidatePath("/users");
  return { success: true };
}
