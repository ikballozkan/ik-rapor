"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sistem Ayarları</h1>
          <p className="text-sm text-slate-500">Uygulama genel ayarları ve sistem parametreleri.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Şirket Bilgileri</CardTitle>
            <CardDescription>Raporlarda görünecek temel bilgiler.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Şirket Adı</Label>
              <Input defaultValue="TRIZONE Endüstri" />
            </div>
            <div className="space-y-2">
              <Label>Yıllık Çalışma Saati Hedefi (Saat)</Label>
              <Input type="number" defaultValue="2250" />
            </div>
            <Button className="bg-[#1F497D]">
              <Save className="w-4 h-4 mr-2" /> Değişiklikleri Kaydet
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Görünüm ve Tercihler</CardTitle>
            <CardDescription>Sistem arayüz ayarları.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Varsayılan Tema</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                <option>Açık Tema (Light Mode)</option>
                <option>Koyu Tema (Dark Mode)</option>
                <option>Sistem Ayarı</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Varsayılan Dil</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                <option>Türkçe</option>
                <option>English</option>
              </select>
            </div>
            <Button className="bg-[#1F497D]">
              <Save className="w-4 h-4 mr-2" /> Tercihleri Kaydet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
