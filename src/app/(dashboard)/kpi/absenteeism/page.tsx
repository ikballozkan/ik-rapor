"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { saveAbsenteeism, getTrendData } from "@/app/actions";

export default function AbsenteeismKpiPage() {
  const [paidLeave, setPaidLeave] = useState<number>(0);
  const [unpaidLeave, setUnpaidLeave] = useState<number>(0);
  const [sickLeave, setSickLeave] = useState<number>(0);
  const [absent, setAbsent] = useState<number>(0);
  const [year, setYear] = useState<string>("2026");
  const [month, setMonth] = useState<string>("6");
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrendData();
  }, []);

  async function loadTrendData() {
    const data = await getTrendData();
    setTrendData(data);
  }

  async function handleSave() {
    setLoading(true);
    await saveAbsenteeism(parseInt(year), parseInt(month), {
      paidLeave, unpaidLeave, sickLeave, absent
    });
    await loadTrendData();
    setLoading(false);
    alert("Devamsızlık verileri başarıyla kaydedildi!");
  }

  const totalAbsenteeismHours = paidLeave + unpaidLeave + sickLeave + absent;
  // Varsayımsal çalışma saati üzerinden oran hesaplaması örneği (Örn: 22 gün * 8 saat * 1000 çalışan)
  const totalWorkHours = 22 * 8 * 1000;
  const absenteeismRate = ((totalAbsenteeismHours / totalWorkHours) * 100).toFixed(2);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Devamsızlık Oranı</h1>
          <p className="text-sm text-slate-500">Aylık izin ve devamsızlık saatlerini girerek devamsızlık oranını hesaplayın.</p>
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
                  <Select value={year} onValueChange={(val) => val && setYear(val)}>
                    <SelectTrigger><SelectValue placeholder="Yıl Seçin" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ay</Label>
                  <Select value={month} onValueChange={(val) => val && setMonth(val)}>
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
              <CardTitle>Saat Girişleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Ücretli İzin (Saat)</Label>
                <Input type="number" value={paidLeave} onChange={(e) => setPaidLeave(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Ücretsiz İzin (Saat)</Label>
                <Input type="number" value={unpaidLeave} onChange={(e) => setUnpaidLeave(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Rapor (Saat)</Label>
                <Input type="number" value={sickLeave} onChange={(e) => setSickLeave(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Devamsızlık (Saat)</Label>
                <Input type="number" value={absent} onChange={(e) => setAbsent(Number(e.target.value))} />
              </div>

              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
                  <span className="font-medium text-slate-700">Oran:</span>
                  <span className="text-xl font-bold text-[#4472C4]">%{absenteeismRate}</span>
                </div>
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full mt-4 bg-[#1F497D] hover:bg-[#1F497D]/90">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Kaydet
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Devamsızlık Trendi</CardTitle>
              <CardDescription>Aylara göre devamsızlık oranlarındaki değişim</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="devamsizlik" stroke="#4472C4" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
