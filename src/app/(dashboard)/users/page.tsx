"use client";

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  UserPlus, Loader2, ShieldCheck, ShieldOff, Pencil, X, Save, Crown, Key, Eye, EyeOff, CheckCircle
} from "lucide-react";
import { getUsers, addUser, updateUser } from "@/app/actions";

// ─── Rol konfigürasyonu ───────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; canEdit: boolean }> = {
  KOORDINATOR: { label: "Koordinatör",        color: "text-purple-700", bg: "bg-purple-50 border border-purple-200",  canEdit: false },
  IK_MUDURU:   { label: "İK Müdürü",          color: "text-blue-700",   bg: "bg-blue-50 border border-blue-200",      canEdit: false },
  IK_SEFI:     { label: "İK Şefi",            color: "text-emerald-700",bg: "bg-emerald-50 border border-emerald-200",canEdit: true  },
  IK_UZMANI:   { label: "İK Uzmanı",          color: "text-slate-700",  bg: "bg-slate-50 border border-slate-200",    canEdit: true  },
  YONETICI:    { label: "Yönetici",           color: "text-orange-700", bg: "bg-orange-50 border border-orange-200",  canEdit: false },
  ADMIN:       { label: "Sistem Yöneticisi",  color: "text-red-700",    bg: "bg-red-50 border border-red-200",        canEdit: true  },
};

const ROLE_KEYS = Object.keys(ROLE_CONFIG);

// ─── Düzenle Modalı ───────────────────────────────────────────────────────────
function EditModal({
  user,
  onClose,
  onSave,
}: {
  user: any;
  onClose: () => void;
  onSave: (updated: any) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState(user.password || "password123");
  const [firstLogin, setFirstLogin] = useState(user.firstLogin !== false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const cfg = ROLE_CONFIG[role];

  async function handleSave() {
    setSaving(true);
    // Simüle gecikme
    await new Promise(r => setTimeout(r, 600));
    onSave({
      ...user,
      name,
      email,
      role,
      password,
      firstLogin,
      canEdit: cfg?.canEdit ?? false,
    });
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-[#1F497D]" />
            <h2 className="font-bold text-slate-800">Kullanıcı Düzenle</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Avatar */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#1F497D] flex items-center justify-center text-white font-bold text-lg shadow">
              {name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-slate-800">{user.name}</div>
              <div className="text-xs text-slate-400">{user.email}</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ad Soyad</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">E-posta</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Giriş Şifresi</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <div>
              <Label className="text-xs font-bold text-slate-700 block">İlk Giriş Karşılaması</Label>
              <span className="text-[11px] text-slate-400">Sisteme ilk girişte karşılama bildirimi gösterilsin.</span>
            </div>
            <button
              type="button"
              onClick={() => setFirstLogin(!firstLogin)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                firstLogin ? "bg-[#1F497D]" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  firstLogin ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</Label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_KEYS.map(key => {
                const c = ROLE_CONFIG[key];
                return (
                  <button
                    key={key}
                    onClick={() => setRole(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-xs font-medium transition-all ${
                      role === key
                        ? "border-[#1F497D] bg-[#1F497D] text-white shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }`}
                  >
                    {key === "ADMIN" && <Crown className="h-3 w-3 shrink-0" />}
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Yetki önizleme */}
          <div className={`rounded-xl p-3 text-sm flex items-center gap-2 ${
            cfg?.canEdit ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"
          }`}>
            {cfg?.canEdit
              ? <ShieldCheck className="h-4 w-4 shrink-0" />
              : <ShieldOff   className="h-4 w-4 shrink-0" />}
            <span className="font-medium text-xs">
              {cfg?.canEdit ? "Veri girişi ve düzenleme yapabilir" : "Yalnızca görüntüleme yetkisi"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            İptal
          </Button>
          <Button
            className="flex-1 bg-[#1F497D] hover:bg-[#1F497D]/90"
            onClick={handleSave}
            disabled={saving || !name || !email || !password}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [activeUser, setActiveUser] = useState<any>(null);

  // Yeni kullanıcı formu
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("IK_UZMANI");
  const [saving, setSaving] = useState(false);
  const [showCreatedPassword, setShowCreatedPassword] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("trizone_active_user");
    if (session) {
      setActiveUser(JSON.parse(session));
    }
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const data = await getUsers();
    
    // Sync with LocalStorage to keep simulation alive
    const local = localStorage.getItem("trizone_users");
    if (local) {
      const parsed = JSON.parse(local).filter((u: any) => u.email !== "orhan.arabaci@trizone.com");
      setUsers(parsed);
      localStorage.setItem("trizone_users", JSON.stringify(parsed));
    } else {
      // Set default firstLogin status for existing mock users
      const initialUsers = data
        .filter((u: any) => u.email !== "orhan.arabaci@trizone.com")
        .map((u: any) => ({
          ...u,
          firstLogin: u.firstLogin !== false, // Default to true if undefined
          password: u.password || "password123"
        }));
      setUsers(initialUsers);
      localStorage.setItem("trizone_users", JSON.stringify(initialUsers));
    }
    setLoading(false);
  }

  async function handleAddUser() {
    if (!name || !email) return;
    setSaving(true);
    
    const plainPassword = password.trim() || Math.random().toString(36).slice(-8);
    
    // Server action
    await addUser({
      name,
      email,
      role,
      password: plainPassword
    });

    // Client-side simulation persistence
    const newUser = {
      id: "user-" + Date.now(),
      name,
      email,
      role,
      password: plainPassword,
      firstLogin: true,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    localStorage.setItem("trizone_users", JSON.stringify(updatedUsers));

    // Show feedback
    setShowCreatedPassword(plainPassword);
    
    // Reset form
    setName("");
    setEmail("");
    setPassword("");
    setRole("IK_UZMANI");
    setSaving(false);
  }

  async function handleSaveEdit(updated: any) {
    // Server action
    await updateUser(updated.id, {
      name: updated.name,
      email: updated.email,
      role: updated.role,
      password: updated.password,
      firstLogin: updated.firstLogin,
    });

    // Client-side simulation persistence
    const updatedUsers = users.map(u => u.id === updated.id ? updated : u);
    setUsers(updatedUsers);
    localStorage.setItem("trizone_users", JSON.stringify(updatedUsers));
    setEditingUser(null);
  }

  const getRoleCfg = (key: string) =>
    ROLE_CONFIG[key] ?? { label: key, color: "text-slate-600", bg: "bg-slate-100", canEdit: false };

  const totalUsers = users.length;
  const editableUsers = users.filter(u => ROLE_CONFIG[u.role]?.canEdit).length;
  const viewOnly = totalUsers - editableUsers;

  if (!activeUser) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1F497D]" />
      </div>
    );
  }

  if (activeUser.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 animate-in fade-in-0 duration-300 bg-white rounded-3xl border border-slate-150 p-8 shadow-sm max-w-lg mx-auto mt-10">
        <div className="p-4 bg-red-50 text-red-600 rounded-full border border-red-100">
          <ShieldOff className="h-12 w-12" />
        </div>
        <div className="max-w-md">
          <h1 className="text-xl font-bold text-slate-800">Yetkisiz Erişim</h1>
          <p className="text-sm text-slate-500 mt-2">
            Kullanıcı Yönetimi sayfasına yalnızca <strong>Sistem Yöneticisi</strong> yetkisine sahip kullanıcılar erişebilir.
          </p>
        </div>
        <Button onClick={() => window.location.href = "/"} className="bg-[#1F497D] hover:bg-[#1F497D]/90 rounded-xl px-6 font-bold h-11">
          Dashboard'a Dön
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* ── Düzenle Modalı ── */}
      {editingUser && (
        <EditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Şifre Gösterim Alert/Banner */}
      {showCreatedPassword && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-start justify-between shadow-sm animate-in fade-in-0 duration-300">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Kullanıcı Başarıyla Oluşturuldu!</p>
              <p className="text-xs text-emerald-700 mt-1">
                Kullanıcı giriş şifresi: <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-sm font-bold text-slate-800 select-all">{showCreatedPassword}</span> (Lütfen bu şifreyi kullanıcıya iletin)
              </p>
            </div>
          </div>
          <button onClick={() => setShowCreatedPassword(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kullanıcı Yönetimi</h1>
          <p className="text-sm text-slate-500">Sisteme erişimi olan kullanıcıları, şifreleri ve karşılama ayarlarını yönetin.</p>
        </div>

        {/* Özet kartlar */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-[#1F497D]">
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-slate-800">{totalUsers}</div>
              <div className="text-sm text-slate-500 mt-1">Toplam Kullanıcı</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-emerald-600">{editableUsers}</div>
              <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Veri Girişi Yetkili
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-slate-400">
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-slate-600">{viewOnly}</div>
              <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                <ShieldOff className="h-3.5 w-3.5 text-slate-400" /> Sadece Görüntüleme
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kullanıcı Tablosu */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Aktif Kullanıcılar</CardTitle>
              <CardDescription>Tüm sistemde kayıtlı kullanıcılar, unvanları ve güvenlik bilgileri</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-slate-400 w-8 h-8" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Şifre</TableHead>
                      <TableHead>Unvan / Rol</TableHead>
                      <TableHead className="text-center">İlk Karşılama</TableHead>
                      <TableHead className="text-center">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => {
                      const cfg = getRoleCfg(u.role);
                      const canEdit = u.canEdit !== undefined ? u.canEdit : cfg.canEdit;
                      const isAdmin = u.role === "ADMIN";
                      const isFirstLoginPending = u.firstLogin !== false;
                      
                      return (
                        <TableRow key={u.id} className="hover:bg-slate-50 group">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              {/* Avatar */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                                isAdmin ? "bg-gradient-to-br from-red-500 to-red-700 shadow-sm" : "bg-[#1F497D]"
                              }`}>
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800 text-sm flex items-center gap-1">
                                  {u.name}
                                  {isAdmin && <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-500 text-xs">{u.email}</TableCell>
                          <TableCell>
                            <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                              {u.password || "password123"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {isFirstLoginPending ? (
                              <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Bekliyor
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                                Gösterildi
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={() => setEditingUser(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#1F497D] border border-[#1F497D]/20 bg-[#1F497D]/5 hover:bg-[#1F497D] hover:text-white transition-all duration-150 opacity-0 group-hover:opacity-100"
                            >
                              <Pencil className="h-3 w-3" />
                              Düzenle
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                          Kayıtlı kullanıcı bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Yeni Kullanıcı Formu */}
          <Card className="col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Yeni Kullanıcı Ekle</CardTitle>
              <CardDescription>Sisteme yeni bir kullanıcı kaydı oluşturun.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Ad Soyad</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Ahmet Yılmaz" />
              </div>
              <div className="space-y-1.5">
                <Label>E-posta</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ahmet@trizone.com" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center justify-between">
                  <span>Şifre</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Boş bırakılırsa otomatik üretilir)</span>
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Şifre belirleyin..."
                  />
                  <Key className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Rol</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_KEYS.map(key => {
                    const c = ROLE_CONFIG[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setRole(key)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-left text-xs font-medium transition-all ${
                          role === key
                            ? "border-[#1F497D] bg-[#1F497D] text-white shadow-sm"
                            : "border-slate-200 text-slate-600 bg-white hover:border-slate-300"
                        }`}
                      >
                        {key === "ADMIN" && <Crown className="h-3 w-3 shrink-0" />}
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Yetki önizleme */}
              {role && ROLE_CONFIG[role] && (
                <div className={`rounded-xl p-3 text-sm flex items-center gap-2 ${
                  ROLE_CONFIG[role].canEdit ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"
                }`}>
                  {ROLE_CONFIG[role].canEdit
                    ? <ShieldCheck className="h-4 w-4 shrink-0" />
                    : <ShieldOff   className="h-4 w-4 shrink-0" />}
                  <span className="font-medium text-xs">
                    {ROLE_CONFIG[role].canEdit ? "Veri girişi ve düzenleme yapabilir" : "Yalnızca görüntüleme yetkisi"}
                  </span>
                </div>
              )}

              <Button
                onClick={handleAddUser}
                disabled={saving || !name || !email}
                className="w-full bg-[#1F497D] hover:bg-[#1F497D]/90"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Kullanıcı Oluştur
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
