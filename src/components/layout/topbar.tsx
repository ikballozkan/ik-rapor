"use client";

import { useState, useEffect } from "react";
import { Bell, Search, LogOut, User, Crown, Key } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  KOORDINATOR: "Koordinatör",
  IK_MUDURU: "İK Müdürü",
  IK_SEFI: "İK Şefi",
  IK_UZMANI: "İK Uzmanı",
  YONETICI: "Yönetici",
  ADMIN: "Sistem Yöneticisi",
};

export function Topbar() {
  const [activeUser, setActiveUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Oturum bilgisini çek
    const u = localStorage.getItem("trizone_active_user");
    if (u) {
      setActiveUser(JSON.parse(u));
    }

    // Oturum değişikliklerini dinle
    const handleAuthChange = () => {
      const updated = localStorage.getItem("trizone_active_user");
      setActiveUser(updated ? JSON.parse(updated) : null);
    };
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  function handleLogout() {
    localStorage.removeItem("trizone_active_user");
    setActiveUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    setShowDropdown(false);
  }

  const userInitial = activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : "?";
  const isAdmin = activeUser?.role === "ADMIN";

  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm border-b border-slate-200">
      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1">
          <form className="flex w-full md:ml-0" action="#" method="GET">
            <label htmlFor="search-field" className="sr-only">
              Ara
            </label>
            <div className="relative w-full text-slate-400 focus-within:text-slate-600">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                id="search-field"
                className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-slate-900 placeholder-slate-500 focus:border-transparent focus:placeholder-slate-400 focus:outline-none focus:ring-0 sm:text-sm"
                placeholder="Arama yap..."
                type="search"
                name="search"
              />
            </div>
          </form>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          <button
            type="button"
            className="rounded-full bg-white p-1 text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1F497D] focus:ring-offset-2"
          >
            <span className="sr-only">Bildirimleri görüntüle</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Profil Dropdown */}
          {activeUser && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 max-w-xs rounded-full bg-slate-50 px-3 py-1.5 border border-slate-200 text-sm focus:outline-none hover:bg-slate-100 transition-colors"
                id="user-menu-button"
                aria-expanded={showDropdown}
                aria-haspopup="true"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                  isAdmin ? "bg-gradient-to-br from-red-500 to-red-700" : "bg-[#1F497D]"
                }`}>
                  {userInitial}
                </div>
                <div className="hidden md:block text-left">
                  <span className="block text-xs font-bold text-slate-700 leading-none">{activeUser.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{ROLE_LABELS[activeUser.role] || activeUser.role}</span>
                </div>
              </button>

              {showDropdown && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
                  
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white py-1.5 shadow-xl border border-slate-100 z-40 animate-in fade-in-0 slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Giriş yapılan hesap</p>
                      <p className="text-sm font-bold text-slate-800 truncate flex items-center gap-1.5">
                        {activeUser.name}
                        {isAdmin && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{activeUser.email}</p>
                    </div>

                    <div className="p-1">
                      <div className="px-3 py-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Hesap Ayarları</div>
                      <div className="px-3 py-1.5 text-xs text-slate-600 flex items-center gap-2 bg-slate-50 rounded-lg m-1 border border-slate-150">
                        <Key className="h-3.5 w-3.5 text-slate-400" />
                        <span>Şifreniz: <strong className="font-mono bg-white px-1 py-0.5 rounded border">{activeUser.password || "password123"}</strong></span>
                      </div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors mt-1"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
