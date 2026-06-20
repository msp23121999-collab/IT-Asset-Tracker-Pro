import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { auditService } from '@/services/auditService';
import type { Asset } from '@/types/asset';
import type { Employee } from '@/types/employee';
import { format } from 'date-fns';

/** Utility to trigger download of a Blob */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/** Log report generation */
const logReport = async (user: any, reportName: string, exportType: 'excel' | 'pdf') => {
  try {
    await auditService.logReportGeneration(user, reportName, exportType);
  } catch (e) {
    console.warn('Audit log failed', e);
  }
};

/** 1. Employee Report */
export const exportEmployeeReport = async (
  user: any,
  employees: Employee[]
) => {
  const wsData = [
    ['Employee ID', 'Name', 'Email', 'Department', 'Role', 'Assigned Asset Count', 'Status'],
    ...employees.map((e) => [
      e.employeeId,
      e.name,
      e.email,
      e.department,
      e.role,
      e.assignedAssets?.length ?? 0,
      e.isActive ? 'Active' : 'Inactive'
    ])
  ];
  const wb = utils.book_new();
  const ws = utils.aoa_to_sheet(wsData);
  utils.book_append_sheet(wb, ws, 'Employees');
  const wbout = writeFile(wb, `Employee_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`, { bookType: 'xlsx', type: 'array' });
  // writeFile already triggers download in browser; still log
  await logReport(user, 'Employee Report', 'excel');
};

/** 2. Asset Inventory Report */
export const exportAssetInventoryReport = async (
  user: any,
  assets: Asset[]
) => {
  const wsData = [
    ['Asset ID', 'Asset Name', 'Category', 'Brand', 'Model', 'Serial Number', 'Department', 'Assigned Employee', 'Status', 'Warranty End Date'],
    ...assets.map((a) => [
      a.assetId,
      a.name,
      a.category,
      a.brand,
      a.model,
      a.serialNumber,
      a.department,
      a.assignedToName || 'Unassigned',
      a.status,
      a.warrantyEnd || 'N/A'
    ])
  ];
  const wb = utils.book_new();
  const ws = utils.aoa_to_sheet(wsData);
  utils.book_append_sheet(wb, ws, 'Assets');
  writeFile(wb, `Asset_Inventory_${format(new Date(), 'yyyyMMdd')}.xlsx`, { bookType: 'xlsx', type: 'array' });
  await logReport(user, 'Asset Inventory Report', 'excel');
};

/** 3. Employee‑Asset Mapping Report */
export const exportEmployeeAssetMappingReport = async (
  user: any,
  employees: Employee[],
  assets: Asset[]
) => {
  const mappingRows: any[] = [];
  employees.forEach((e) => {
    const empAssets = assets.filter((a) => a.assignedTo === e.id);
    empAssets.forEach((a) => {
      const warrantyStatus = a.warrantyEnd && new Date(a.warrantyEnd) < new Date()
        ? 'Expired'
        : 'Valid';
      mappingRows.push([
        e.name,
        e.employeeId,
        e.department,
        a.assetId,
        a.name,
        a.category,
        a.warrantyEnd || 'N/A',
        warrantyStatus
      ]);
    });
  });
  const wsData = [
    ['Employee Name', 'Employee ID', 'Department', 'Asset ID', 'Asset Name', 'Category', 'Warranty End', 'Warranty Status'],
    ...mappingRows
  ];
  const wb = utils.book_new();
  const ws = utils.aoa_to_sheet(wsData);
  utils.book_append_sheet(wb, ws, 'Mapping');
  writeFile(wb, `Employee_Asset_Mapping_${format(new Date(), 'yyyyMMdd')}.xlsx`, { bookType: 'xlsx', type: 'array' });
  await logReport(user, 'Employee‑Asset Mapping Report', 'excel');
};

/** 4. Warranty Report – Excel */
export const exportWarrantyReportExcel = async (user: any, assets: Asset[]) => {
  const now = new Date();
  const in30 = new Date();
  in30.setDate(now.getDate() + 30);
  const in60 = new Date();
  in60.setDate(now.getDate() + 60);

  const sections: { title: string; rows: any[] }[] = [
    {
      title: 'Expired Assets',
      rows: assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) < now)
    },
    {
      title: 'Expiring Within 30 Days',
      rows: assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) >= now && new Date(a.warrantyEnd) <= in30)
    },
    {
      title: 'Expiring Within 60 Days',
      rows: assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) > in30 && new Date(a.warrantyEnd) <= in60)
    },
    {
      title: 'Active Warranty Assets',
      rows: assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) > in60)
    }
  ];

  const wb = utils.book_new();
  sections.forEach((sec) => {
    const wsData = [
      ['Asset ID', 'Name', 'Category', 'Warranty End', 'Status'],
      ...sec.rows.map((a) => [a.assetId, a.name, a.category, a.warrantyEnd, a.status])
    ];
    const ws = utils.aoa_to_sheet(wsData);
    utils.book_append_sheet(wb, ws, sec.title);
  });
  writeFile(wb, `Warranty_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`, { bookType: 'xlsx', type: 'array' });
  await logReport(user, 'Warranty Report', 'excel');
};

/** Helper for PDF generation */
const generatePdf = async (
  user: any,
  title: string,
  columns: string[],
  rows: any[][]
) => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 20);
  autoTable(doc, {
    startY: 30,
    head: [columns],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [24, 182, 255] },
    styles: { fontSize: 9 }
  });
  const pdfBlob = doc.output('blob');
  downloadBlob(pdfBlob, `${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  await logReport(user, title, 'pdf');
};

/** 4b. Warranty Report – PDF */
export const exportWarrantyReportPdf = async (user: any, assets: Asset[]) => {
  const now = new Date();
  const in30 = new Date();
  in30.setDate(now.getDate() + 30);
  const in60 = new Date();
  in60.setDate(now.getDate() + 60);

  const sections = [
    { label: 'Expired Assets', rows: assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) < now) },
    { label: 'Expiring Within 30 Days', rows: assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) >= now && new Date(a.warrantyEnd) <= in30) },
    { label: 'Expiring Within 60 Days', rows: assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) > in30 && new Date(a.warrantyEnd) <= in60) },
    { label: 'Active Warranty Assets', rows: assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) > in60) }
  ];

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('Warranty Report', 14, 20);
  let cursorY = 30;
  sections.forEach((sec) => {
    doc.setFontSize(12);
    doc.text(sec.label, 14, cursorY);
    const data = sec.rows.map((a) => [a.assetId, a.name, a.category, a.warrantyEnd ?? '-', a.status]);
    autoTable(doc, {
      startY: cursorY + 4,
      head: [['Asset ID', 'Name', 'Category', 'Warranty End', 'Status']],
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [255, 176, 32] },
      styles: { fontSize: 8 }
    });
    cursorY = doc.previousAutoTable.finalY + 10;
  });
  const pdfBlob = doc.output('blob');
  downloadBlob(pdfBlob, `Warranty_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
  await logReport(user, 'Warranty Report', 'pdf');
};

/** 5. Asset Assignment History Report – using assets data (mock history) */
export const exportAssetAssignmentHistoryReport = async (
  user: any,
  assets: Asset[]
) => {
  // For demo purposes, assume each asset has a simple assignment history stored in a custom field `history`
  // We will generate placeholder rows.
  const rows: any[][] = [];
  assets.forEach((a) => {
    // mock two entries per asset
    rows.push([
      a.assetId,
      a.name,
      a.assignedToName || 'Unassigned',
      a.createdAt,
      a.updatedAt,
      a.status,
      'System Admin' // Approver placeholder
    ]);
  });
  const wb = utils.book_new();
  const ws = utils.aoa_to_sheet([
    ['Asset ID', 'Asset Name', 'Employee', 'Assignment Date', 'Return Date', 'Status', 'Approved By'],
    ...rows
  ]);
  utils.book_append_sheet(wb, ws, 'AssignmentHistory');
  writeFile(wb, `Asset_Assignment_History_${format(new Date(), 'yyyyMMdd')}.xlsx`, { bookType: 'xlsx', type: 'array' });
  await logReport(user, 'Asset Assignment History Report', 'excel');
};

/** 6. Executive Summary Report – PDF only */
export const exportExecutiveSummaryReport = async (
  user: any,
  assets: Asset[],
  employees: Employee[]
) => {
  const totalAssets = assets.length;
  const assignedAssets = assets.filter((a) => a.assignedToName).length;
  const unassignedAssets = totalAssets - assignedAssets;
  const deptSet = new Set(assets.map((a) => a.department));
  const departmentCount = Array.from(deptSet).length;
  const expiringSoon = assets.filter((a) => a.warrantyEnd && new Date(a.warrantyEnd) < new Date(new Date().setDate(new Date().getDate() + 30))).length;

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Executive Summary Report', 14, 20);
  doc.setFontSize(12);
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 28);
  const overview = [
    ['Total Assets', totalAssets.toString()],
    ['Assigned Assets', assignedAssets.toString()],
    ['Unassigned Assets', unassignedAssets.toString()],
    ['Employees', employees.length.toString()],
    ['Departments', departmentCount.toString()],
    ['Assets Expiring Soon (30d)', expiringSoon.toString()]
  ];
  autoTable(doc, {
    startY: 35,
    head: [['Metric', 'Value']],
    body: overview,
    theme: 'grid',
    headStyles: { fillColor: [0, 208, 132] },
    styles: { fontSize: 10 }
  });
  // Charts – for brevity we add placeholder tables
  // Assets By Department
  const assetsByDept = Object.entries(
    assets.reduce((acc, a) => {
      acc[a.department] = (acc[a.department] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([dept, cnt]) => [dept, cnt]);
  autoTable(doc, {
    startY: doc.previousAutoTable.finalY + 10,
    head: [['Department', 'Asset Count']],
    body: assetsByDept,
    theme: 'grid',
    headStyles: { fillColor: [24, 182, 255] },
    styles: { fontSize: 10 }
  });
  // Asset Status Distribution
  const statusDist = Object.entries(
    assets.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)  
  ).map(([status, cnt]) => [status, cnt]);
  autoTable(doc, {
    startY: doc.previousAutoTable.finalY + 10,
    head: [['Status', 'Count']],
    body: statusDist,
    theme: 'grid',
    headStyles: { fillColor: [255, 176, 32] },
    styles: { fontSize: 10 }
  });

  const pdfBlob = doc.output('blob');
  downloadBlob(pdfBlob, `Executive_Summary_${format(new Date(), 'yyyyMMdd')}.pdf`);
  await logReport(user, 'Executive Summary Report', 'pdf');
};
