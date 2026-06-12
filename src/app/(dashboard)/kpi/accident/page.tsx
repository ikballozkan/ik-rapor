"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const trendData = [
  { name: "Oca", isKazasi: 0 },
  { name: "Şub", isKazasi: 1 },
  { name: "Mar", isKazasi: 0 },
  { name: "Nis", isKazasi: 2 },
  { name: "May", isKazasi: 0 },
  { name: "Haz", isKazasi: 1 },
];

export default function AccidentKpiPage() {
  const [totalAccidents, setTotalAccidents] = useState<number>(1);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">İş Kazası Takibi</h1>
          <p className="text-sm text-slate-500">Aylık iş kazası sayılarını giriniz.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dönem Seçimi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Yıl</Label>
                  <Select defaultValue="2026">
                    <SelectTrigger><SelectValue placeholder="Yıl Seçin" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ay</Label>
                  <Select defaultValue="6">
                    <SelectTrigger><SelectValue placeholder="Ay Seçin" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Mayıs</SelectItem>
                      <SelectItem value="6">Haziran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kaza Verileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Toplam İş Kazası</Label>
                <Input type="number" value={totalAccidents} onChange={(e) => setTotalAccidents(Number(e.target.value))} />
              </div>

              <Button className="w-full mt-4 bg-[#1F497D] hover:bg-[#1F497D]/90">
                <Save className="w-4 h-4 mr-2" /> Kaydet
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>İş Kazası Trendi</CardTitle>
              <CardDescription>Aylara göre toplam iş kazası sayıları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="isKazasi" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
