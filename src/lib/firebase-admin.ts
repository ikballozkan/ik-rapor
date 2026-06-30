import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const isConfigured = !!process.env.FIREBASE_PROJECT_ID;

if (isConfigured) {
  const firebaseAdminConfig = {
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  };

  // Singleton pattern — Next.js hot reload'da birden fazla init'i önler
  if (!getApps().length) {
    initializeApp(firebaseAdminConfig);
  }
}

// ─── Test (Mock) Veritabanı ────────────────────────────────────────────────
// Gerçek kullanıcılar (Firebase bağlantısı olmadığında kullanılır)
const MOCK_USERS = [
  {
    id: "user-002",
    name: "Burcu Gökdemir",
    email: "burcu.gokdemir@trizone.com",
    role: "IK_MUDURU",
    canEdit: false,
    title: "İK Müdürü",
    password: "password123",
    createdAt: new Date("2026-06-14"),
  },
  {
    id: "user-003",
    name: "Havanur Şenocak",
    email: "havanur.senocak@trizone.com",
    role: "IK_SEFI",
    canEdit: true,
    title: "İK Şefi",
    password: "password123",
    createdAt: new Date("2026-06-14"),
  },
  {
    id: "user-004",
    name: "İkbalnur Özkan",
    email: "ikbalnur.ozkan@trizone.com",
    role: "ADMIN",
    canEdit: true,
    title: "Sistem Yöneticisi / İK Uzmanı",
    password: "password123",
    createdAt: new Date("2026-06-14"),
  },
  {
    id: "user-005",
    name: "Merve Kotan",
    email: "merve.kotan@trizone.com",
    role: "IK_UZMANI",
    canEdit: true,
    title: "İK Uzmanı",
    password: "password123",
    createdAt: new Date("2026-06-14"),
  },
];

const createQueryMock = (collectionName?: string): any => ({
  orderBy: () => createQueryMock(collectionName),
  limit: () => createQueryMock(collectionName),
  where: () => createQueryMock(collectionName),
  get: async () => {
    // Kullanıcı koleksiyonu için gerçek mock verisi döndür
    if (collectionName === "users") {
      return {
        docs: MOCK_USERS.map((u) => ({
          id: u.id,
          data: () => ({ ...u }),
        })),
      };
    }
    return {
      docs: [
        {
          id: "mock-doc-1",
          data: () => ({
            year: 2024,
            month: 1,
            turnover: { turnoverRate: 5 },
            absenteeism: { paidLeave: 5, absent: 10 },
            overtime: { shiftA: 5 },
            training: { technicalHours: 20 },
            accident: { totalAccidents: 1 },
          }),
        },
        {
          id: "mock-doc-2",
          data: () => ({
            year: 2024,
            month: 2,
            turnover: { turnoverRate: 4 },
            absenteeism: { paidLeave: 3, absent: 8 },
            overtime: { shiftA: 4 },
            training: { technicalHours: 15 },
            accident: { totalAccidents: 0 },
          }),
        },
      ],
    };
  },
  doc: (id?: string) => ({
    get: async () => ({
      exists: true,
      id: id || "mock-id",
      data: () => ({
        year: 2024,
        month: 1,
        turnover: { turnoverRate: 5 },
        absenteeism: { absent: 10 },
        overtime: { shiftA: 5 },
        training: { technicalHours: 20 },
        accident: { totalAccidents: 1 },
      }),
    }),
    set: async () => ({}),
  }),
  add: async () => ({}),
});

const mockDb = {
  collection: (name: string) => createQueryMock(name),
};

export const db = isConfigured ? getFirestore() : mockDb as any;
