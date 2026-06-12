"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const trainingData = [
  { name: "Oca", teknik: 40, isg: 24, yonetsel: 24 },
  { name: "Şub", teknik: 30, isg: 13, yonetsel: 22 },
  { name: "Mar", teknik: 20, isg: 98, yonetsel: 22 },
  { name: "Nis", teknik: 27, isg: 39, yonetsel: 20 },
  { name: "May", teknik: 18, isg: 48, yonetsel: 21 },
  { name: "Haz", teknik: 23, isg: 38, yonetsel: 25 },
];

export default function TrainingKpiPage() {
  const [techHours, setTechHours] = useState<number>(23);
  const [isgHours, setIsgHours] = useState<number>(38);
  const [mgmtHours, setMgmtHours] = useState<number>(25);

  const totalHours = techHours + isgHours + mgmtHours;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Eğitim Adam Saat</h1>
          <p className="text-sm text-slate-500">Verilen eğitim türlerine göre adam saat verilerini giriniz.</p>
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
              <CardTitle>Eğitim Saatleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Teknik Eğitim (Saat)</Label>
                <Input type="number" value={techHours} onChange={(e) => setTechHours(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>İSG Eğitimi (Saat)</Label>
                <Input type="number" value={isgHours} onChange={(e) => setIsgHours(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Yönetsel Eğitim (Saat)</Label>
                <Input type="number" value={mgmtHours} onChange={(e) => setMgmtHours(Number(e.target.value))} />
              </div>

              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
                  <span className="font-medium text-slate-700">Toplam:</span>
                  <span className="text-xl font-bold text-[#1F497D]">{totalHours} Saat</span>
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
              <CardTitle>Eğitim Dağılım Trendi</CardTitle>
              <CardDescription>Aylara göre eğitim türü kırılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trainingData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="teknik" stackId="a" fill="#1F497D" />
                    <Bar dataKey="isg" stackId="a" fill="#4472C4" />
                    <Bar dataKey="yonetsel" stackId="a" fill="#94A3B8" />
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
