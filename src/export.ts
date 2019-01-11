import * as ExcelJS from "exceljs";
import * as fs from "fs";
import getSynoData from "./synodata";

const exportColumns = [
  { header: "Id", key: "id", width: 6 },
  { header: "Batiment", key: "building", width: 20 },
  { header: "Niveau", key: "level", width: 20 },
  { header: "Salle", key: "room", width: 20 },
  { header: "Service", key: "department", width: 20 },
  { header: "Catégorie", key: "category", width: 20 },
  { header: "Sous-catégorie", key: "subCategory", width: 20 },
  {
    header: "Date d'achat",
    key: "purchasedAt",
    style: { numFmt: "dd/mm/yyyy" },
    width: 12,
  },
  { header: "Durée de garantie", key: "warrantyDuration", width: 8 },
  { header: "État", key: "condition", width: 6 },
  { header: "Référence du contrat", key: "contractReference", width: 8 },
  {
    header: "Coût HT",
    key: "cost",
    style: { numFmt: '#,##0.00" €";[Red]-#,##0.00" €"' },
    width: 12,
  },
  {
    header: "Coût TTC",
    key: "atiCost",
    style: { numFmt: '#,##0.00" €";[Red]-#,##0.00" €"' },
    width: 12,
  },
  {
    header: "Taux de TVA",
    key: "vatRate",
    style: { numFmt: "#,##0.00" },
    width: 8,
  },
  { header: "Durée d'amortissement", key: "depreciationPeriod", width: 8 },
];

// const data = JSON.stringify(getSynoData());

const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet("items", {
  views: [{ state: "frozen", ySplit: 1 }],
});

ws.columns = exportColumns;

const headers = ws.getRow(1);
headers.eachCell({ includeEmpty: true }, (cell /*colNumber*/) => {
  cell.font = { bold: true };
  cell.border = {
    bottom: { style: "thin", color: { argb: "FF333333" } },
  };
});

// const rows = this.selection.map((itemKey) => this.buildItemRow(itemKey));
// ws.addRows(rows);

wb.xlsx.writeFile("testexceljs.xlsx");
