"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart2,
  FileText,
  GitCompare,
  Users,
  Settings,
  UserCheck,
  ClipboardEdit,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Aktif Personel", href: "/personel", icon: UserCheck },
  { name: "KPI Yönetimi", href: "/kpi", icon: BarChart2 },
  { name: "Raporlar", href: "/reports", icon: FileText },
  { name: "Karşılaştırmalar", href: "/comparisons", icon: GitCompare },
  { name: "Veri Güncelle", href: "/veri-guncelle", icon: ClipboardEdit, editOnly: false },
  { name: "Kullanıcı Yönetimi", href: "/users", icon: Users },
  { name: "Sistem Ayarları", href: "/settings", icon: Settings },
];

import { useState, useEffect } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [activeUser, setActiveUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("trizone_active_user");
    if (u) {
      setActiveUser(JSON.parse(u));
    }
    const handleAuthChange = () => {
      const updated = localStorage.getItem("trizone_active_user");
      setActiveUser(updated ? JSON.parse(updated) : null);
    };
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  const isAdmin = activeUser?.role === "ADMIN";

  const filteredNavigation = navigation.filter(item => {
    if (item.href === "/users") {
      return isAdmin;
    }
    return true;
  });

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800 text-white">
      <div className="flex h-24 shrink-0 items-center justify-center p-4 bg-white border-b border-slate-200">
        <img src="/logo.png" alt="TRIZONE Logo" className="w-full h-full object-contain" />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-3">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-[#1F497D] text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white",
                    "mr-3 h-5 w-5 flex-shrink-0"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
