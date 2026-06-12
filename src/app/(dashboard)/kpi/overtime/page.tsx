"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const trendData = [
  { name: "Oca", fazlaMesai: 120 },
  { name: "Şub", fazlaMesai: 140 },
  { name: "Mar", fazlaMesai: 90 },
  { name: "Nis", fazlaMesai: 160 },
  { name: "May", fazlaMesai: 110 },
  { name: "Haz", fazlaMesai: 130 },
];

export default function OvertimeKpiPage() {
  const [shiftA, setShiftA] = useState<number>(40);
  const [shiftB, setShiftB] = useState<number>(35);
  const [shiftC, setShiftC] = useState<number>(55);

  const totalOvertime = shiftA + shiftB + shiftC;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fazla Mesai Takibi</h1>
          <p className="text-sm text-slate-500">Vardiya ve bölümlere göre fazla mesai saatlerini giriniz.</p>
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
              <CardTitle>Vardiya Saatleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>A Vardiyası (Saat)</Label>
                <Input type="number" value={shiftA} onChange={(e) => setShiftA(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>B Vardiyası (Saat)</Label>
                <Input type="number" value={shiftB} onChange={(e) => setShiftB(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>C Vardiyası (Saat)</Label>
                <Input type="number" value={shiftC} onChange={(e) => setShiftC(Number(e.target.value))} />
              </div>

              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
                  <span className="font-medium text-slate-700">Toplam Mesai:</span>
                  <span className="text-xl font-bold text-[#F59E0B]">{totalOvertime} Saat</span>
                </div>
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
              <CardTitle>Fazla Mesai Trendi</CardTitle>
              <CardDescription>Aylara göre toplam fazla mesai saatleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorFm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="fazlaMesai" stroke="#F59E0B" fillOpacity={1} fill="url(#colorFm)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
