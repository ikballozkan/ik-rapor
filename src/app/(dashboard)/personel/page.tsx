"use client";

import { useMemo } from "react";
import {
  PERSONNEL_DATA,
  LATEST_PERSONNEL,
  PREV_PERSONNEL,
  percentChange,
} from "@/lib/personnel-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  TrendingDown,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CalendarClock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const GENDER_COLORS = ["#1F497D", "#4472C4"];

// Özel etiket bileşeni pasta grafik için
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
  name,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={14}
      fontWeight="bold"
    >
      {value}
    </text>
  );
};

export default function PersonelPage() {
  const current = LATEST_PERSONNEL; // Haziran (isCurrentMonth: true)
  const previous = PREV_PERSONNEL;  // Mayıs

  const genderData = [
    { name: "Erkek", value: current.erkek },
    { name: "Kadın", value: current.kadin },
  ];

  const erkekOran = ((current.erkek / current.toplamPersonel) * 100).toFixed(1);
  const kadinOran = ((current.kadin / current.toplamPersonel) * 100).toFixed(1);

  const toplamChange = percentChange(current.toplamPersonel, previous.toplamPersonel);
  const erkekChange = percentChange(current.erkek, previous.erkek);
  const kadinChange = percentChange(current.kadin, previous.kadin);

  // Tüm aylara ait cinsiyet verileri (trend için)
  const allGenderTrend = PERSONNEL_DATA.filter((r) => r.toplamPersonel > 0).map((r) => ({
    name: r.ay.charAt(0) + r.ay.slice(1).toLowerCase().substring(0, 2),
    Erkek: r.erkek,
    Kadın: r.kadin,
    Toplam: r.toplamPersonel,
    current: r.isCurrentMonth,
  }));

  return (
    <div className="flex flex-col space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Aktif Personel Durumu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Güncel dönem bilgileri
          </p>
        </div>
        {/* Devam eden ay rozeti */}
        {current.isCurrentMonth && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-2">
            <CalendarClock className="h-4 w-4" />
            <span className="text-sm font-medium">
              {current.ay} 2026 — Ay Devam Ediyor
            </span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
          </div>
        )}
      </div>

      {/* Ana KPI Kartları */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Toplam Aktif */}
        <Card className="border-l-4 border-l-[#1F497D]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Toplam Aktif Personel
            </CardTitle>
            <Users className="h-5 w-5 text-[#1F497D]" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">
              {current.toplamPersonel.toLocaleString("tr-TR")}
            </div>
            <div className="flex items-center mt-2 gap-1">
              {toplamChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  toplamChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {toplamChange > 0 ? "+" : ""}
                {toplamChange}%
              </span>
              <span className="text-sm text-slate-400">
                ({previous.ay} ayına göre)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Erkek */}
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Erkek Personel
            </CardTitle>
            <div className="h-5 w-5 rounded-full bg-[#1F497D] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">E</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#1F497D]">
              {current.erkek}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                {erkekChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    erkekChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {erkekChange > 0 ? "+" : ""}
                  {erkekChange}%
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-500">
                %{erkekOran}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1F497D] rounded-full transition-all duration-700"
                style={{ width: `${erkekOran}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kadın */}
        <Card className="border-l-4 border-l-[#4472C4]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Kadın Personel
            </CardTitle>
            <div className="h-5 w-5 rounded-full bg-[#4472C4] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">K</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#4472C4]">
              {current.kadin}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                {kadinChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    kadinChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {kadinChange > 0 ? "+" : ""}
                  {kadinChange}%
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-500">
                %{kadinOran}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4472C4] rounded-full transition-all duration-700"
                style={{ width: `${kadinOran}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafikler */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pasta Grafik */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#1F497D]" />
              Cinsiyet Dağılımı
              {current.isCurrentMonth && (
                <span className="text-xs font-normal bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-2">
                  Güncel
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={115}
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {genderData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value} kişi (%${((Number(value) / current.toplamPersonel) * 100).toFixed(1)})`,
                      name,
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    formatter={(value) => (
                      <span className="text-sm text-slate-700">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Özet satır */}
            <div className="flex divide-x divide-slate-100 mt-2 pt-3 border-t border-slate-100">
              <div className="flex-1 text-center px-4">
                <div className="text-2xl font-bold text-[#1F497D]">{current.erkek}</div>
                <div className="text-xs text-slate-500 mt-0.5">Erkek (%{erkekOran})</div>
              </div>
              <div className="flex-1 text-center px-4">
                <div className="text-2xl font-bold text-[#4472C4]">{current.kadin}</div>
                <div className="text-xs text-slate-500 mt-0.5">Kadın (%{kadinOran})</div>
              </div>
              <div className="flex-1 text-center px-4">
                <div className="text-2xl font-bold text-slate-700">
                  {current.toplamPersonel}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Toplam</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aylık Cinsiyet Trend Grafiği */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#1F497D]" />
              Aylık Cinsiyet Dağılımı Trendi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={allGenderTrend}
                  margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={({ x, y, payload, index }) => {
                      const isCurrentBar = allGenderTrend[index]?.current;
                      return (
                        <text
                          x={x}
                          y={Number(y) + 10}
                          textAnchor="middle"
                          fill={isCurrentBar ? "#d97706" : "#64748b"}
                          fontWeight={isCurrentBar ? "700" : "400"}
                          fontSize={12}
                        >
                          {payload.value}
                        </text>
                      );
                    }}
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value} kişi`,
                      name,
                    ]}
                    labelFormatter={(label, payload) => {
                      const item = allGenderTrend.find((d) => d.name === label);
                      return item?.current ? `${label} (Devam Ediyor)` : label;
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="Erkek"
                    fill="#1F497D"
                    radius={[3, 3, 0, 0]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="Kadın"
                    fill="#4472C4"
                    radius={[3, 3, 0, 0]}
                    stackId="a"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geçmiş Aylara Göre Karşılaştırma Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Aylık Personel Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">
                    Ay
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600">
                    Toplam
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-[#1F497D]">
                    Erkek
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-[#4472C4]">
                    Kadın
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600">
                    Erkek %
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600">
                    Kadın %
                  </th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {PERSONNEL_DATA.filter((r) => r.toplamPersonel > 0).map((r, idx) => {
                  const eOran = ((r.erkek / r.toplamPersonel) * 100).toFixed(1);
                  const kOran = ((r.kadin / r.toplamPersonel) * 100).toFixed(1);
                  return (
                    <tr
                      key={r.no}
                      className={`border-b border-slate-100 transition-colors ${
                        r.isCurrentMonth
                          ? "bg-amber-50 hover:bg-amber-100"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              r.isCurrentMonth
                                ? "text-amber-700"
                                : "text-slate-900"
                            }`}
                          >
                            {r.ay}
                          </span>
                          {r.isCurrentMonth && (
                            <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">
                              Devam ediyor
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-bold text-slate-800">
                        {r.toplamPersonel.toLocaleString("tr-TR")}
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-[#1F497D]">
                        {r.erkek}
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-[#4472C4]">
                        {r.kadin}
                      </td>
                      <td className="text-right py-3 px-4 text-slate-600">
                        %{eOran}
                      </td>
                      <td className="text-right py-3 px-4 text-slate-600">
                        %{kOran}
                      </td>
                      <td className="py-3 px-4">
                        {/* Mini bar */}
                        <div className="flex h-3 rounded-full overflow-hidden w-24 ml-auto">
                          <div
                            className="bg-[#1F497D] h-full"
                            style={{ width: `${eOran}%` }}
                          />
                          <div
                            className="bg-[#4472C4] h-full flex-1"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
