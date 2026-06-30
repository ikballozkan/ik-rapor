"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { saveTurnover, getTrendData } from "@/app/actions";

export default function TurnoverKpiPage() {
  const [startCount, setStartCount] = useState<number>(0);
  const [endCount, setEndCount] = useState<number>(0);
  const [leftCount, setLeftCount] = useState<number>(0);
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
    await saveTurnover(parseInt(year), parseInt(month), {
      startCount, endCount, leftCount
    });
    await loadTrendData();
    setLoading(false);
    alert("Kayıt başarıyla kaydedildi!");
  }

  // Auto calculation
  const averageEmployee = (startCount + endCount) / 2;
  const turnoverRate = averageEmployee > 0 ? ((leftCount / averageEmployee) * 100).toFixed(2) : 0;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Personel Sirkülasyon Oranı</h1>
          <p className="text-sm text-slate-500">Aylık işe giriş ve çıkış verilerini girerek sirkülasyon oranını takip edin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol Form Alanı */}
        <div className="col-span-1 md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dönem Seçimi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Yıl</Label>
                  <Select value={year} onValueChange={(val) => val && setYear(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Yıl Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ay</Label>
                  <Select value={month} onValueChange={(val) => val && setMonth(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ay Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ocak</SelectItem>
                      <SelectItem value="2">Şubat</SelectItem>
                      <SelectItem value="3">Mart</SelectItem>
                      <SelectItem value="4">Nisan</SelectItem>
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
              <CardTitle>Veri Girişi</CardTitle>
              <CardDescription>Aylık personel sayılarını girin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start">Dönem Başı Çalışan</Label>
                <Input 
                  id="start" 
                  type="number" 
                  value={startCount}
                  onChange={(e) => setStartCount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Dönem Sonu Çalışan</Label>
                <Input 
                  id="end" 
                  type="number" 
                  value={endCount}
                  onChange={(e) => setEndCount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="left">Ayrılan Kişi Sayısı</Label>
                <Input 
                  id="left" 
                  type="number" 
                  value={leftCount}
                  onChange={(e) => setLeftCount(Number(e.target.value))}
                />
              </div>

              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
                  <span className="font-medium text-slate-700">Hesaplanan Oran:</span>
                  <span className="text-xl font-bold text-[#1F497D]">%{turnoverRate}</span>
                </div>
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full mt-4 bg-[#1F497D] hover:bg-[#1F497D]/90">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Kaydet
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Grafik Alanı */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Aylık Trend Analizi</CardTitle>
              <CardDescription>Yıl içindeki sirkülasyon oranı değişimi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="sirkulasyon" 
                      stroke="#1F497D" 
                      strokeWidth={3} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
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
