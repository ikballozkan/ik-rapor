"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getUsers, setFirstLoginDone } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck, ShieldOff, Key, Crown, Sparkles, LogIn, Loader2, CheckCircle2, UserCircle2, ArrowRight, ShieldAlert
} from "lucide-react";

// ─── Rol konfigürasyonu ───────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; canEdit: boolean }> = {
  KOORDINATOR: { label: "Koordinatör",        color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200",   canEdit: false },
  IK_MUDURU:   { label: "İK Müdürü",          color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",     canEdit: false },
  IK_SEFI:     { label: "İK Şefi",            color: "text-emerald-700",bg: "bg-emerald-50 text-emerald-700", border: "border-emerald-200", canEdit: true  },
  IK_UZMANI:   { label: "İK Uzmanı",          color: "text-slate-700",  bg: "bg-slate-50",  border: "border-slate-200",    canEdit: true  },
  YONETICI:    { label: "Yönetici",           color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200",  canEdit: false },
  ADMIN:       { label: "Sistem Yöneticisi",  color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",      canEdit: true  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeUser, setActiveUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [showQuickLogin, setShowQuickLogin] = useState(false);

  // 1. Session ve kullanıcıları yükle
  useEffect(() => {
    async function initAuth() {
      const storedSession = localStorage.getItem("trizone_active_user");
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed.email === "orhan.arabaci@trizone.com") {
          localStorage.removeItem("trizone_active_user");
          setActiveUser(null);
        } else {
          setActiveUser(parsed);
        }
      }

      try {
        const dbUsers = await getUsers();
        const local = localStorage.getItem("trizone_users");
        if (local) {
          const parsed = JSON.parse(local).filter((u: any) => u.email !== "orhan.arabaci@trizone.com");
          setUsers(parsed);
          localStorage.setItem("trizone_users", JSON.stringify(parsed));
        } else {
          const initialUsers = dbUsers
            .filter((u: any) => u.email !== "orhan.arabaci@trizone.com")
            .map((u: any) => ({
              ...u,
              firstLogin: u.firstLogin !== false,
              password: u.password || "password123"
            }));
          setUsers(initialUsers);
          localStorage.setItem("trizone_users", JSON.stringify(initialUsers));
        }
      } catch (err) {
        console.error("Kullanıcılar yüklenemedi", err);
      }
      setLoading(false);
    }
    initAuth();

    const handleAuthChange = () => {
      const u = localStorage.getItem("trizone_active_user");
      setActiveUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    const currentUsers = JSON.parse(localStorage.getItem("trizone_users") || JSON.stringify(users));
    const foundUser = currentUsers.find(
      (u: any) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (!foundUser) {
      setLoginError("Girdiğiniz kullanıcı adı veya e-posta adresi kayıtlı değil.");
      setLoggingIn(false);
      return;
    }

    if (foundUser.password !== password) {
      setLoginError("Hatalı şifre. Lütfen tekrar deneyin.");
      setLoggingIn(false);
      return;
    }

    localStorage.setItem("trizone_active_user", JSON.stringify(foundUser));
    setActiveUser(foundUser);
    window.dispatchEvent(new Event("auth-changed"));

    if (foundUser.firstLogin !== false) {
      setShowWelcome(true);
      foundUser.firstLogin = false;
      const updatedUsers = currentUsers.map((u: any) => u.id === foundUser.id ? foundUser : u);
      localStorage.setItem("trizone_users", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      try {
        await setFirstLoginDone(foundUser.id);
      } catch (err) {
        console.error("First login update failed", err);
      }
    }

    setLoggingIn(false);
  }

  async function handleQuickLogin(user: any) {
    setEmail(user.email);
    setPassword(user.password || "password123");
    
    setTimeout(() => {
      const currentUsers = JSON.parse(localStorage.getItem("trizone_users") || JSON.stringify(users));
      const found = currentUsers.find((u: any) => u.id === user.id);
      if (found) {
        localStorage.setItem("trizone_active_user", JSON.stringify(found));
        setActiveUser(found);
        window.dispatchEvent(new Event("auth-changed"));

        if (found.firstLogin !== false) {
          setShowWelcome(true);
          found.firstLogin = false;
          const updatedUsers = currentUsers.map((u: any) => u.id === found.id ? found : u);
          localStorage.setItem("trizone_users", JSON.stringify(updatedUsers));
          setUsers(updatedUsers);
          setFirstLoginDone(found.id).catch(() => {});
        }
      }
    }, 100);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F1F4FA]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#7C3AED] mx-auto" />
          <p className="text-slate-500 text-sm font-medium">Sistem yükleniyor...</p>
        </div>
      </div>
    );
  }

  // İstediğiniz Tasarımdaki Giriş Sayfası
  if (!activeUser) {
    return (
      <div className="min-h-screen bg-[#F0F3F9] bg-[radial-gradient(circle_at_center,_#FFFFFF_0%,_#EBF0F9_60%,_#DFE6F5_100%)] flex flex-col items-center justify-center p-4">
        
        {/* Giriş Kartı */}
        <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(31,73,125,0.12)] border border-[#E2E8F0]/50 w-full max-w-[420px] p-10 flex flex-col space-y-8 animate-in fade-in-0 zoom-in-95 duration-300">
          
          {/* Logo Alnı */}
          <div className="flex flex-col items-center justify-center space-y-2 mt-2">
            <img src="/logo.png" alt="TRIZONE Logo" className="h-11 object-contain" />
          </div>

          {/* Başlık ve Açıklama */}
          <div className="text-center">
            <h2 className="text-[22px] font-black text-slate-800 tracking-tight">
              Sisteme Giriş
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Lütfen devam etmek için giriş yapın.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest pl-1">
                Kullanıcı Adı
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#F3F6FA] border-none text-slate-800 rounded-2xl h-12 px-5 font-semibold placeholder-slate-400 focus:bg-[#EBF0F9] focus:ring-2 focus:ring-[#8B5CF6]/50 transition-all text-sm shadow-inner"
                placeholder="ad.soyad@trizone.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest pl-1">
                Şifre
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#F3F6FA] border-none text-slate-800 rounded-2xl h-12 px-5 font-semibold placeholder-slate-400 focus:bg-[#EBF0F9] focus:ring-2 focus:ring-[#8B5CF6]/50 transition-all text-sm shadow-inner"
                placeholder="Şifreniz"
              />
            </div>

            {loginError && (
              <div className="text-red-700 text-xs font-semibold bg-red-50 border border-red-100 p-3 rounded-xl flex items-start gap-1.5 animate-in fade-in-0 duration-200">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl h-12 font-bold shadow-lg shadow-[#7C3AED]/20 active:scale-[0.98] transition-all text-sm mt-2"
            >
              {loggingIn ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </form>

          {/* Test Hesapları Bölümü */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              onClick={() => setShowQuickLogin(!showQuickLogin)}
              type="button"
              className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
            >
              {showQuickLogin ? "▲ Hızlı Giriş Paneli Kapat" : "▼ Test Hesapları ile Hızlı Giriş"}
            </button>
            
            {showQuickLogin && (
              <div className="grid grid-cols-1 gap-2 mt-4 max-h-[160px] overflow-y-auto pr-1 animate-in slide-in-from-top-2 duration-200">
                {users.map((u) => {
                  const cfg = ROLE_CONFIG[u.role] ?? { label: u.role, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" };
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleQuickLogin(u)}
                      type="button"
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200/60 hover:border-[#7C3AED] hover:bg-white text-left transition-all"
                    >
                      <div>
                        <span className="font-bold text-slate-700 text-xs block">{u.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono">Şifre: {u.password || "password123"}</span>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // Giriş Yapılmışsa, Normal Dashboard ve İlk Giriş Modalı
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      {/* ── Hoş Geldiniz Bildirim Modalı (İlk Giriş) ── */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in-0 duration-300">
          <div className="bg-gradient-to-b from-[#1F497D] to-[#132E52] rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden relative border border-white/10 p-8 text-center text-white animate-in zoom-in-95 duration-300">
            {/* Glow effects */}
            <div className="absolute -top-24 left-1/4 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 right-1/4 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Confetti / Sparkles Icon */}
            <div className="relative mx-auto w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/20 mb-6 shadow-inner animate-bounce">
              <Sparkles className="h-9 w-9 text-amber-400" />
              <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-1.5 shadow">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight mb-2">
              Sisteme Hoş Geldiniz!
            </h2>
            <p className="text-blue-200 text-xs max-w-xs mx-auto mb-6">
              Trizone İnsan Kaynakları Takip ve Raporlama Sistemine ilk girişiniz başarıyla tamamlandı.
            </p>

            {/* Detay Kartı */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10 text-left space-y-3 mb-8">
              <div className="flex justify-between items-center border-b border-white/15 pb-2.5">
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Kullanıcı</span>
                <span className="text-sm font-semibold">{activeUser.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/15 pb-2.5">
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">E-posta</span>
                <span className="text-xs font-mono text-slate-300">{activeUser.email}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/15 pb-2.5">
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Sistem Rolü</span>
                <span className="text-xs font-bold bg-white/10 px-2.5 py-1 rounded-full text-amber-300 flex items-center gap-1 border border-white/10">
                  {activeUser.role === "ADMIN" && <Crown className="h-3 w-3 text-amber-400" />}
                  {ROLE_CONFIG[activeUser.role]?.label || activeUser.role}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Veri Giriş Yetkisi</span>
                <span className="text-xs font-semibold">
                  {ROLE_CONFIG[activeUser.role]?.canEdit ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4" /> Giriş/Düzenleme Yapabilir
                    </span>
                  ) : (
                    <span className="text-slate-300 flex items-center gap-1">
                      <ShieldOff className="h-4 w-4" /> Yalnızca Görüntüleme
                    </span>
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowWelcome(false)}
              className="w-full bg-white text-[#1F497D] hover:bg-slate-100 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] text-sm"
            >
              Başlayalım
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Sidebar />
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
