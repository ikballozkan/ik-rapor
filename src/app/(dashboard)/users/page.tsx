"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Loader2 } from "lucide-react";
import { getUsers, addUser } from "@/app/actions";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("IK_UZMANI");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  }

  async function handleAddUser() {
    if (!name || !email) return;
    setSaving(true);
    await addUser({ name, email, role });
    await loadUsers();
    setName("");
    setEmail("");
    setRole("IK_UZMANI");
    setSaving(false);
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kullanıcı Yönetimi</h1>
          <p className="text-sm text-slate-500">Sisteme erişimi olan kullanıcıları ve yetkilerini yönetin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Aktif Kullanıcılar</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400 w-8 h-8" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">
                          {u.role.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString("tr-TR")}</TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500 py-8">Kayıtlı kullanıcı bulunamadı.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Yeni Kullanıcı Ekle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn: Ahmet Yılmaz" />
            </div>
            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmet@trizone.com" />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IK_UZMANI">İK Uzmanı</SelectItem>
                  <SelectItem value="IK_MUDURU">İK Müdürü</SelectItem>
                  <SelectItem value="YONETICI">Yönetici</SelectItem>
                  <SelectItem value="ADMIN">Sistem Yöneticisi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddUser} disabled={saving} className="w-full bg-[#1F497D]">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Kullanıcı Oluştur
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
