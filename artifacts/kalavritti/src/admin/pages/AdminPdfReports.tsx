import { useState } from "react";
import { adminApi } from "@/admin/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText, Download, Eye, RefreshCw, BarChart2, IndianRupee, Package,
  RotateCcw, Wallet, ShieldCheck, TrendingUp, Calendar, Printer, Save,
  FileDown, CheckCircle, Clock
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── PDF types ────────────────────────────────────────────────────────────────
const PDF_TYPES = [
  { id: "order_invoice", label: "Order Invoice", icon: Package, desc: "After payment confirmation", category: "customer", color: "bg-blue-50 text-blue-600" },
  { id: "tax_invoice", label: "Tax Invoice (GST)", icon: IndianRupee, desc: "After shipment / delivery", category: "customer", color: "bg-green-50 text-green-600" },
  { id: "order_summary", label: "Order Summary", icon: FileText, desc: "Download from order page", category: "customer", color: "bg-purple-50 text-purple-600" },
  { id: "return_receipt", label: "Return Receipt", icon: RotateCcw, desc: "After return approval", category: "customer", color: "bg-amber-50 text-amber-600" },
  { id: "refund_receipt", label: "Refund Receipt", icon: CheckCircle, desc: "After refund completion", category: "customer", color: "bg-emerald-50 text-emerald-600" },
  { id: "warranty_certificate", label: "Warranty Certificate", icon: ShieldCheck, desc: "If product has warranty", category: "customer", color: "bg-rose-50 text-rose-600" },
  { id: "payout_statement", label: "Seller Payout Statement", icon: Wallet, desc: "After each payout cycle", category: "seller", color: "bg-orange-50 text-orange-600" },
  { id: "sales_report", label: "Sales Report", icon: BarChart2, desc: "Daily / Weekly / Monthly", category: "admin", color: "bg-blue-50 text-blue-600" },
  { id: "commission_statement", label: "Commission Statement", icon: IndianRupee, desc: "Platform commission breakdown", category: "admin", color: "bg-violet-50 text-violet-600" },
  { id: "settlement_report", label: "Settlement Report", icon: TrendingUp, desc: "Seller settlement ledger", category: "seller", color: "bg-cyan-50 text-cyan-600" },
  { id: "order_export", label: "Order Export PDF", icon: Download, desc: "Bulk order data export", category: "admin", color: "bg-gray-50 text-gray-600" },
  { id: "revenue_report", label: "Revenue Report", icon: BarChart2, desc: "Platform-wide revenue analysis", category: "admin", color: "bg-green-50 text-green-600" },
  { id: "seller_performance", label: "Seller Performance Report", icon: TrendingUp, desc: "KPIs and metrics per seller", category: "seller", color: "bg-amber-50 text-amber-600" },
  { id: "refund_report", label: "Refund Report", icon: RotateCcw, desc: "All refunds in period", category: "admin", color: "bg-red-50 text-red-600" },
  { id: "gst_report", label: "Tax / GST Report", icon: IndianRupee, desc: "GSTR-1 / GSTR-3B summary", category: "admin", color: "bg-indigo-50 text-indigo-600" },
];

const RECENT_REPORTS = [
  { id: "RPT-001", type: "Order Invoice", entity: "#KL-2345", generated: "Today, 10:42 AM", size: "42 KB", status: "ready" },
  { id: "RPT-002", type: "Sales Report", entity: "May 2025", generated: "01 Jun 2025", size: "128 KB", status: "ready" },
  { id: "RPT-003", type: "GST Report", entity: "Q1 FY26", generated: "31 May 2025", size: "86 KB", status: "ready" },
  { id: "RPT-004", type: "Payout Statement", entity: "Meena Devi", generated: "28 May 2025", size: "24 KB", status: "ready" },
];

// ─── PDF Generator ────────────────────────────────────────────────────────────
function generatePdf(type: string, params: Record<string, string> = {}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(124, 45, 18);
  doc.rect(0, 0, 210, 38, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("KALAVRITTI", 14, 18);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Celebrating Handmade · Honouring Artisans", 14, 25);
  doc.text("namaste@kalavritti.in · www.kalavritti.in · +91 94762 11198", 14, 31);

  const typeLabel = PDF_TYPES.find(p => p.id === type)?.label || type.replace(/_/g, " ").toUpperCase();
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(typeLabel.toUpperCase(), 196, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const docNum = `KLV-${type.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
  doc.text(`Doc #: ${docNum}`, 196, 25, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 196, 31, { align: "right" });

  doc.setTextColor(0, 0, 0);

  if (type === "order_invoice" || type === "tax_invoice" || type === "order_summary") {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 14, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Customer Name: " + (params.customerName || "Priya Sharma"), 14, 57);
    doc.text("Order ID: " + (params.orderId || "#KL-2345"), 14, 63);
    doc.text("Address: 42 Park Street, Kolkata — 700016, WB", 14, 69);
    doc.text("Phone: +91 98765 43210", 14, 75);

    if (type === "tax_invoice") {
      doc.text("GSTIN: Customer GSTIN (if applicable)", 110, 57);
      doc.text("Invoice Date: " + new Date().toLocaleDateString("en-IN"), 110, 63);
      doc.text("HSN/SAC: 9983 (Handcrafted Goods)", 110, 69);
    }

    autoTable(doc, {
      startY: 85,
      head: [["#", "Product Description", "Artisan", "Qty", "Unit Price (₹)", "Total (₹)"]],
      body: [
        ["1", "Hand-painted Terracotta Vase", "Meena Devi", "1", "1,240.00", "1,240.00"],
        ["2", "Handwoven Assam Silk Stole", "Rina Borah", "1", "2,100.00", "2,100.00"],
      ],
      foot: [
        ["", "", "", "", "Subtotal:", "3,340.00"],
        ["", "", "", "", "GST (18%):", "601.20"],
        ["", "", "", "", "Shipping:", "FREE"],
        ["", "", "", "", "Grand Total:", "3,941.20"],
      ],
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [124, 45, 18], textColor: 255 },
      footStyles: { fillColor: [250, 245, 240], fontStyle: "bold" },
    });
  } else if (type === "sales_report" || type === "revenue_report") {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("REVENUE SUMMARY — " + (params.period || "May 2025").toUpperCase(), 14, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    autoTable(doc, {
      startY: 58,
      head: [["Metric", "Value"]],
      body: [
        ["Total Revenue", "₹1,24,500"],
        ["Total Orders", "142"],
        ["Average Order Value", "₹876"],
        ["Platform Commission (10%)", "₹12,450"],
        ["Seller Earnings", "₹1,12,050"],
        ["Refunds Processed", "₹3,200"],
        ["Net Revenue", "₹1,21,300"],
      ],
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [124, 45, 18], textColor: 255 },
      alternateRowStyles: { fillColor: [250, 245, 240] },
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Category", "Orders", "Revenue (₹)", "% Share"]],
      body: [
        ["Pottery & Ceramics", "42", "38,500", "30.9%"],
        ["Textiles & Weaving", "38", "35,200", "28.3%"],
        ["Paintings & Art", "28", "24,800", "19.9%"],
        ["Jewelry & Accessories", "22", "18,000", "14.5%"],
        ["Other Crafts", "12", "8,000", "6.4%"],
      ],
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [124, 45, 18], textColor: 255 },
    });
  } else if (type === "gst_report") {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("GST / TAX REPORT — " + (params.period || "Q1 FY2025-26"), 14, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("GSTIN: 19AAACK1234F1Z0 (West Bengal)", 14, 58);

    autoTable(doc, {
      startY: 66,
      head: [["Description", "Taxable Value (₹)", "CGST (9%)", "SGST (9%)", "IGST (18%)", "Total Tax"]],
      body: [
        ["Handcrafted Goods (B2C)", "1,24,500", "5,602", "5,602", "—", "11,204"],
        ["B2B Supplies", "45,000", "—", "—", "8,100", "8,100"],
        ["Exempt Supplies", "12,000", "—", "—", "—", "—"],
      ],
      foot: [["TOTAL", "1,81,500", "5,602", "5,602", "8,100", "19,304"]],
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [124, 45, 18], textColor: 255 },
      footStyles: { fontStyle: "bold", fillColor: [250, 245, 240] },
    });
  } else {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(typeLabel.toUpperCase(), 14, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Report for: ${params.period || "June 2025"}`, 14, 58);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 65);
    autoTable(doc, {
      startY: 75,
      head: [["Field", "Value"]],
      body: [["Status", "Generated"], ["Period", params.period || "June 2025"], ["Reference", docNum]],
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [124, 45, 18], textColor: 255 },
    });
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(28, 10, 0);
  doc.rect(0, pageHeight - 22, 210, 22, "F");
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(7);
  doc.text("© 2025 Kalavritti — Celebrating Handmade · namaste@kalavritti.in · kalavritti.in", 105, pageHeight - 13, { align: "center" });
  doc.text(`Document ID: ${docNum} · Generated ${new Date().toLocaleString("en-IN")} · This is a computer-generated document.`, 105, pageHeight - 8, { align: "center" });

  return doc;
}

export default function AdminPdfReports() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [params, setParams] = useState({ orderId: "", period: "June 2025", customerName: "" });

  const generate = async (type: string, download = true) => {
    setGenerating(type);
    try {
      await new Promise(r => setTimeout(r, 300));
      const doc = generatePdf(type, params);
      if (download) {
        doc.save(`kalavritti-${type}-${Date.now()}.pdf`);
        toast({ title: "PDF Generated", description: "PDF downloaded to your device." });
      } else {
        const dataUrl = doc.output("datauristring");
        setPreviewPdf(dataUrl);
        setPreviewTitle(PDF_TYPES.find(p => p.id === type)?.label || type);
        setPreviewOpen(true);
      }
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setGenerating(null); }
  };

  const filtered = PDF_TYPES.filter(p => categoryFilter === "all" || p.category === categoryFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">PDF Reports</h1><p className="text-muted-foreground text-sm">{PDF_TYPES.length} professional PDF types · Kalavritti branded · jsPDF</p></div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick params */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Report Parameters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Order ID</Label><Input value={params.orderId} onChange={e => setParams(p => ({ ...p, orderId: e.target.value }))} placeholder="KL-2345" className="h-8 text-sm" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Period / Month</Label><Input value={params.period} onChange={e => setParams(p => ({ ...p, period: e.target.value }))} placeholder="June 2025" className="h-8 text-sm" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Customer / Seller Name</Label><Input value={params.customerName} onChange={e => setParams(p => ({ ...p, customerName: e.target.value }))} placeholder="Name for document" className="h-8 text-sm" /></div>
          </div>
        </CardContent>
      </Card>

      {/* PDF cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(pdf => {
          const Icon = pdf.icon;
          const isGenerating = generating === pdf.id;
          return (
            <Card key={pdf.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pdf.color}`}><Icon className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{pdf.label}</p>
                    <p className="text-xs text-muted-foreground">{pdf.desc}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${pdf.category === "admin" ? "bg-blue-100 text-blue-700" : pdf.category === "seller" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>{pdf.category}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => generate(pdf.id, false)} disabled={isGenerating}><Eye className="w-3.5 h-3.5 mr-1" />{isGenerating ? "…" : "Preview"}</Button>
                  <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => generate(pdf.id, true)} disabled={isGenerating}><Download className="w-3.5 h-3.5 mr-1" />{isGenerating ? "Generating…" : "Download"}</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <div>
        <h2 className="text-base font-semibold mb-3">Recently Generated Reports</h2>
        <Card><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b"><tr>{["Report ID", "Type", "For", "Generated", "Size", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {RECENT_REPORTS.map(r => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{r.id}</td>
                  <td className="px-4 py-3 text-sm">{r.type}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.entity}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.generated}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.size}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => generate(PDF_TYPES[0].id, false)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => generate(PDF_TYPES[0].id, true)}><FileDown className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-3 text-xs text-muted-foreground border-t">Reports stored in Supabase Storage after running the <code className="bg-muted px-1 rounded">pdf_reports</code> SQL schema.</p>
        </CardContent></Card>
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={() => { setPreviewOpen(false); setPreviewPdf(null); }}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0"><DialogTitle className="flex items-center gap-2"><FileText className="w-4 h-4" />{previewTitle} Preview</DialogTitle></DialogHeader>
          {previewPdf && (
            <div className="flex-1 h-full p-4">
              <iframe src={previewPdf} className="w-full h-[calc(85vh-80px)] border rounded-xl bg-white" title="PDF Preview" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
