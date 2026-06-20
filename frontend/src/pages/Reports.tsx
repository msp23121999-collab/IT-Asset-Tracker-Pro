import React, { useMemo, useState } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/hooks/useAuth';
import { Download, FileText, BarChart3, PieChart, Clock, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Utility functions ----------------------------------------------------------
const exportToExcel = (data: any[], sheetName: string, fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

const exportToPDF = (title: string, columns: string[], rows: any[][], fileName: string) => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 20);
  // @ts-ignore - autotable is added via prototype
  (doc as any).autoTable({
    startY: 30,
    head: [columns],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8 },
  });
  doc.save(`${fileName}.pdf`);
};

// Simple audit logger --------------------------------------------------------
const logReport = (user: string | null, role: string | undefined, report: string, exportType: string) => {
  const timestamp = new Date().toISOString();
  console.log('Report Generation Log:', { user, role, report, exportType, timestamp });
  // TODO: replace with proper backend logging if needed
};

// Report definitions -----------------------------------------------------------
interface ReportDef {
  id: string;
  title: string;
  description: string;
  canGenerate: (role?: string) => boolean;
  generateData: () => Promise<{ columns: string[]; rows: any[][]; exportData: any[] }>; // exportData for Excel JSON
  excelFileName: string;
  pdfFileName: string;
}

export const Reports: React.FC = () => {
  const { assets, isLoading: assetsLoading } = useAssets();
  const { employees, isLoading: empLoading } = useEmployees();
  const { user } = useAuth();
  const role = user?.role;

  const [generated, setGenerated] = useState<Record<string, boolean>>({});



  const handleExportExcel = async (def: ReportDef) => {
    if (!def.canGenerate(role)) return;
    const data = await def.generateData();
    exportToExcel(data.exportData, def.title, def.excelFileName);
    logReport(user?.email || null, role, def.title, 'excel');
  };

  const handleExportPDF = async (def: ReportDef) => {
    if (!def.canGenerate(role)) return;
    const data = await def.generateData();
    exportToPDF(def.title, data.columns, data.rows, def.pdfFileName);
    logReport(user?.email || null, role, def.title, 'pdf');
  };

  // Report definitions -------------------------------------------------------
  const reports: ReportDef[] = useMemo(() => {
    const empReport: ReportDef = {
      id: 'employee',
      title: 'Employee Report',
      description: 'HR and employee inventory tracking.',
      canGenerate: (r) => r === 'it_admin' || r === 'super_admin',
      excelFileName: 'Employee_Report',
      pdfFileName: 'Employee_Report',
      generateData: async () => {
        const columns = ['Employee ID', 'Name', 'Email', 'Department', 'Role', 'Assigned Asset Count', 'Status'];
        const rows = employees.map((e) => [
          e.employeeId,
          e.name,
          e.email,
          e.department,
          e.role,
          // count assets assigned to this employee — assignedTo is a string (employeeId or doc id)
          assets.filter((a) => a.assignedTo === e.id || a.assignedTo === e.employeeId).length + (e.assignedAssets?.length || 0) > 0
            ? Math.max(
                assets.filter((a) => a.assignedTo === e.id || a.assignedTo === e.employeeId).length,
                e.assignedAssets?.length || 0
              )
            : 0,
          e.isActive ? 'Active' : 'Inactive',
        ]);
        const exportData = rows.map((r) => columns.reduce((obj, col, i) => ({ ...obj, [col]: r[i] }), {}));
        return { columns, rows, exportData };
      },
    };

    const assetInvReport: ReportDef = {
      id: 'asset_inventory',
      title: 'Asset Inventory Report',
      description: 'Complete asset inventory overview.',
      canGenerate: (r) => r === 'it_admin' || r === 'super_admin',
      excelFileName: 'Asset_Inventory_Report',
      pdfFileName: 'Asset_Inventory_Report',
      generateData: async () => {
        const columns = ['Asset ID', 'Asset Name', 'Category', 'Brand', 'Model', 'Serial Number', 'Department', 'Assigned Employee', 'Status', 'Warranty End Date'];
        const rows = assets.map((a) => {
          // Resolve employee name from assignedTo (string id) or assignedToName
          const emp = a.assignedTo ? employees.find((e) => e.id === a.assignedTo || e.employeeId === a.assignedTo) : null;
          return [
            a.assetId,
            a.name,
            a.category,
            a.brand,
            a.model,
            a.serialNumber,
            a.department,
            emp?.name || a.assignedToName || (a.assignedTo ? a.assignedTo : 'Unassigned'),
            a.status,
            a.warrantyEnd ? new Date(a.warrantyEnd).toLocaleDateString() : 'N/A',
          ];
        });
        const exportData = rows.map((r) => columns.reduce((obj, col, i) => ({ ...obj, [col]: r[i] }), {}));
        return { columns, rows, exportData };
      },
    };

    const mappingReport: ReportDef = {
      id: 'employee_asset_mapping',
      title: 'Employee Asset Mapping Report',
      description: 'Which assets are assigned to which employees.',
      canGenerate: (r) => r === 'it_admin' || r === 'super_admin',
      excelFileName: 'Employee_Asset_Mapping',
      pdfFileName: 'Employee_Asset_Mapping',
      generateData: async () => {
        const columns = ['Employee Name', 'Employee ID', 'Department', 'Asset ID', 'Asset Name', 'Category', 'Assigned Date', 'Warranty Status'];
        const rows = assets
          .filter((a) => a.assignedTo && a.assignedTo.length > 0)
          .map((a) => {
            const emp = employees.find((e) => e.id === a.assignedTo || e.employeeId === a.assignedTo);
            return [
              emp?.name || a.assignedToName || a.assignedTo,
              emp?.employeeId || a.assignedTo,
              emp?.department || a.department,
              a.assetId,
              a.name,
              a.category,
              a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : 'N/A',
              a.warrantyEnd && new Date(a.warrantyEnd) < new Date() ? 'Expired' : 'Valid',
            ];
          });
        const exportData = rows.map((r) => columns.reduce((obj, col, i) => ({ ...obj, [col]: r[i] }), {}));
        return { columns, rows, exportData };
      },
    };

    const warrantyReport: ReportDef = {
      id: 'warranty',
      title: 'Warranty Report',
      description: 'Warranty tracking and renewal planning.',
      canGenerate: (r) => r === 'it_admin' || r === 'super_admin',
      excelFileName: 'Warranty_Report',
      pdfFileName: 'Warranty_Report',
      generateData: async () => {
        const now = new Date();
        const in30 = new Date(); in30.setDate(now.getDate() + 30);
        const in60 = new Date(); in60.setDate(now.getDate() + 60);
        const expired = assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) < now);
        const exp30 = assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) >= now && new Date(a.warrantyEnd) <= in30);
        const exp60 = assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) > in30 && new Date(a.warrantyEnd) <= in60);
        const active = assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) > in60);
        const sections = [
          { title: 'Expired Assets', data: expired },
          { title: 'Expiring Within 30 Days', data: exp30 },
          { title: 'Expiring Within 60 Days', data: exp60 },
          { title: 'Active Warranty Assets', data: active },
        ];
        // flatten for export (Excel) with a Section column
        const columns = ['Section', 'Asset ID', 'Asset Name', 'Warranty End'];
        const rows: any[][] = [];
        const exportData: any[] = [];
        sections.forEach((sec) => {
          sec.data.forEach((a) => {
            rows.push([sec.title, a.assetId, a.name, a.warrantyEnd ? new Date(a.warrantyEnd).toLocaleDateString() : 'N/A']);
            exportData.push({ Section: sec.title, 'Asset ID': a.assetId, 'Asset Name': a.name, 'Warranty End': a.warrantyEnd });
          });
        });
        return { columns, rows, exportData };
      },
    };

    const assignmentHistoryReport: ReportDef = {
      id: 'assignment_history',
      title: 'Asset Assignment History Report',
      description: 'Asset audit and tracking history.',
      canGenerate: (r) => r === 'it_admin' || r === 'super_admin',
      excelFileName: 'Asset_Assignment_History',
      pdfFileName: 'Asset_Assignment_History',
      generateData: async () => {
        // Assuming each asset has a history array; using placeholder logic
        const columns = ['Asset ID', 'Asset Name', 'Employee', 'Assignment Date', 'Return Date', 'Status', 'Approved By'];
        const rows: any[][] = [];
        assets.forEach((a) => {
          if (a.assignmentHistory && a.assignmentHistory.length) {
            a.assignmentHistory.forEach((h: any) => {
              rows.push([
                a.assetId,
                a.name,
                h.employeeName || 'N/A',
                h.assignDate ? new Date(h.assignDate).toLocaleDateString() : 'N/A',
                h.returnDate ? new Date(h.returnDate).toLocaleDateString() : 'N/A',
                h.status || 'N/A',
                h.approvedBy || 'N/A',
              ]);
            });
          }
        });
        const exportData = rows.map((r) => columns.reduce((obj, col, i) => ({ ...obj, [col]: r[i] }), {}));
        return { columns, rows, exportData };
      },
    };

    const executiveSummaryReport: ReportDef = {
      id: 'executive_summary',
      title: 'Executive Summary Report',
      description: 'Management dashboard report (PDF only).',
      canGenerate: (r) => r === 'super_admin',
      excelFileName: '', // not used
      pdfFileName: 'Executive_Summary',
      generateData: async () => {
        const totalAssets = assets.length;
        const assigned = assets.filter((a) => a.assignedTo).length;
        const unassigned = totalAssets - assigned;
        const employeeCount = employees.length;
        const departments = Array.from(new Set(assets.map((a) => a.department)));
        const expiringSoon = assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)).length;
        // Simple tables for PDF
        const sections = [
          ['Total Assets', totalAssets.toString()],
          ['Assigned Assets', assigned.toString()],
          ['Unassigned Assets', unassigned.toString()],
          ['Employees', employeeCount.toString()],
          ['Departments', departments.join(', ')],
          ['Assets Expiring Soon (<90d)', expiringSoon.toString()],
        ];
        const columns = ['Metric', 'Value'];
        const rows = sections;
        // No Excel export needed
        return { columns, rows, exportData: [] };
      },
    };

    return [empReport, assetInvReport, mappingReport, warrantyReport, assignmentHistoryReport, executiveSummaryReport];
  }, [assets, employees]);

  if (assetsLoading || empLoading) {
    return <div className="text-center p-8 text-[#94A3B8]">Loading reports...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-[#0A0F20] min-h-screen text-[#E2E8F0]">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-[#E2E8F0] to-[#18B6FF] bg-clip-text text-transparent">
        System Reports
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((def) => (
          <div
            key={def.id}
            className="bg-[#0D1B32] border border-[#19304D]/80 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-xl font-semibold text-white mb-2">{def.title}</h2>
            <p className="text-sm text-[#94A3B8] mb-4">{def.description}</p>
            <div className="flex gap-2 flex-wrap">

              <button
                onClick={() => handleExportExcel(def)}
                disabled={!def.canGenerate(role)}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${def.canGenerate(role) ? 'bg-[#00D084]/10 text-[#00D084] hover:bg-[#00D084] hover:text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
              >
                Excel
              </button>
              <button
                onClick={() => handleExportPDF(def)}
                disabled={!def.canGenerate(role)}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${def.canGenerate(role) ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] hover:bg-[#FF4D4D] hover:text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
              >
                PDF
              </button>
            </div>
            {!def.canGenerate(role) && (
              <p className="mt-2 text-xs text-[#FF4D4D]">Access denied for your role.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
