import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Activity, Clock, BookOpen, AlertTriangle } from "lucide-react";

const kpiModules = [
  {
    title: "Personel Sirkülasyon Oranı",
    description: "Aylık sirkülasyon hesaplama ve trend analizi.",
    icon: Users,
    href: "/kpi/turnover",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    title: "Devamsızlık Oranı",
    description: "Bölüm bazlı devamsızlık ve mazeret kayıtları.",
    icon: Activity,
    href: "/kpi/absenteeism",
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    title: "Fazla Mesai",
    description: "Vardiya ve bölüm bazlı mesai takibi.",
    icon: Clock,
    href: "/kpi/overtime",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    title: "Eğitim Adam Saat",
    description: "İSG, Teknik ve Yönetsel eğitim analizleri.",
    icon: BookOpen,
    href: "/kpi/training",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    title: "İş Kazaları",
    description: "Kaza sayıları ve risk analizleri.",
    icon: AlertTriangle,
    href: "/kpi/accident",
    color: "text-rose-500",
    bgColor: "bg-rose-50",
  },
];

export default function KpiIndexPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">KPI Yönetimi</h1>
          <p className="text-sm text-slate-500">Veri girişi yapmak veya detaylı raporları incelemek için bir KPI modülü seçin.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {kpiModules.map((module) => (
          <Link key={module.title} href={module.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-slate-200">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${module.bgColor}`}>
                    <module.icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">{module.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
