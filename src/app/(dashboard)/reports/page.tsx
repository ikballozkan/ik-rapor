"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getTrendData } from "@/app/actions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const handleDownloadPdf = async () => {
    setLoadingPdf(true);
    try {
      const data = await getTrendData();
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("IK KPI Raporu", 14, 22);
      
      const tableColumn = ["Donem", "Sirkulasyon (%)", "Devamsizlik (%)", "Fazla Mesai (Saat)", "Is Kazasi", "Egitim (Saat)"];
      const tableRows = data.map(item => [
        item.name,
        item.sirkulasyon,
        item.devamsizlik,
        item.fazlaMesai,
        item.isKazasi,
        (item.teknik || 0) + (item.isg || 0) + (item.yonetsel || 0)
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
      });

      doc.save("ik_kpi_raporu.pdf");
    } catch (e) {
      console.error(e);
      alert("Hata oluştu.");
    }
    setLoadingPdf(false);
  };

  const handleDownloadExcel = async () => {
    setLoadingExcel(true);
    try {
      const data = await getTrendData();
      const formattedData = data.map(item => ({
        "Dönem": item.name,
        "Sirkülasyon (%)": item.sirkulasyon,
        "Devamsızlık (%)": item.devamsizlik,
        "Fazla Mesai (Saat)": item.fazlaMesai,
        "İş Kazası": item.isKazasi,
        "Teknik Eğitim": item.teknik,
        "İSG Eğitimi": item.isg,
        "Yönetsel Eğitim": item.yonetsel,
        "Toplam Eğitim (Saat)": (item.teknik || 0) + (item.isg || 0) + (item.yonetsel || 0)
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "KPI Verileri");
      XLSX.writeFile(workbook, "ik_kpi_raporu.xlsx");
    } catch (e) {
      console.error(e);
      alert("Hata oluştu.");
    }
    setLoadingExcel(false);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Raporlar</h1>
          <p className="text-sm text-slate-500">Tüm KPI verilerini PDF veya Excel formatında dışa aktarın.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aylık Özet Raporu</CardTitle>
            <CardDescription>Tüm departmanların aylık genel değerlendirmesi.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button onClick={handleDownloadPdf} disabled={loadingPdf || loadingExcel} variant="outline" className="w-full">
                {loadingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} 
                PDF İndir
              </Button>
              <Button onClick={handleDownloadExcel} disabled={loadingPdf || loadingExcel} variant="outline" className="w-full">
                {loadingExcel ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} 
                Excel İndir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
