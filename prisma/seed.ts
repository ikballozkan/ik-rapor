import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Veritabanı sanal verilerle dolduruluyor...');

  const years = [2024, 2025, 2026];
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  for (const year of years) {
    for (const month of months) {
      // 2026 için sadece 6. aya kadar veri girelim (şimdiki zaman gibi)
      if (year === 2026 && month > 6) continue;

      // KPI Record
      const record = await prisma.kpiRecord.upsert({
        where: {
          year_month: {
            year,
            month
          }
        },
        update: {},
        create: {
          year,
          month
        }
      });

      // Turnover Stat (Personel Sirkülasyon)
      const startCount = 1000 + Math.floor(Math.random() * 50) - 25;
      const leftCount = Math.floor(Math.random() * 20) + 5;
      const endCount = startCount - leftCount + Math.floor(Math.random() * 25);
      const avgEmp = (startCount + endCount) / 2;
      const turnoverRate = (leftCount / avgEmp) * 100;

      await prisma.turnoverStat.upsert({
        where: { kpiRecordId: record.id },
        update: {},
        create: {
          kpiRecordId: record.id,
          startCount,
          endCount,
          leftCount,
          turnoverRate
        }
      });

      // Absenteeism Stat (Devamsızlık)
      await prisma.absenteeismStat.upsert({
        where: { kpiRecordId: record.id },
        update: {},
        create: {
          kpiRecordId: record.id,
          paidLeave: Math.floor(Math.random() * 200) + 100,
          unpaidLeave: Math.floor(Math.random() * 100) + 20,
          sickLeave: Math.floor(Math.random() * 150) + 50,
          absent: Math.floor(Math.random() * 50) + 5,
        }
      });

      // Overtime Stat (Fazla Mesai)
      await prisma.overtimeStat.upsert({
        where: { kpiRecordId: record.id },
        update: {},
        create: {
          kpiRecordId: record.id,
          shiftA: Math.floor(Math.random() * 100) + 20,
          shiftB: Math.floor(Math.random() * 80) + 10,
          shiftC: Math.floor(Math.random() * 120) + 30,
        }
      });

      // Training Stat (Eğitim)
      await prisma.trainingStat.upsert({
        where: { kpiRecordId: record.id },
        update: {},
        create: {
          kpiRecordId: record.id,
          technicalHours: Math.floor(Math.random() * 50) + 10,
          isgHours: Math.floor(Math.random() * 80) + 20,
          managementHours: Math.floor(Math.random() * 40) + 10,
        }
      });

      // Accident Stat (İş Kazası)
      await prisma.accidentStat.upsert({
        where: { kpiRecordId: record.id },
        update: {},
        create: {
          kpiRecordId: record.id,
          totalAccidents: Math.floor(Math.random() * 3), // 0, 1, veya 2 kaza
        }
      });
    }
  }

  // Örnek Kullanıcılar ekleyelim
  const roles: Role[] = [Role.IK_UZMANI, Role.IK_MUDURU, Role.YONETICI, Role.ADMIN];
  const names = ["Ayşe Demir", "Burak Yılmaz", "Ceren Kaya", "Deniz Şahin"];
  
  for (let i = 0; i < names.length; i++) {
    await prisma.user.upsert({
      where: { email: `user${i+1}@trizone.com` },
      update: {},
      create: {
        name: names[i],
        email: `user${i+1}@trizone.com`,
        password: "password123",
        role: roles[i],
      }
    });
  }

  console.log('Sanal veriler başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
