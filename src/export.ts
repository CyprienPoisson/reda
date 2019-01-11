import * as ExcelJS from "exceljs";
import * as fs from "fs";
import alphasort from "./alphasort";
import getSynoData from "./synodata";

const data = getSynoData();

const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet("Accès", {
  views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
});

const exportColumns = [{ header: "Partage", key: "share", width: 20 }];
const usernames = Object.keys(data.users).sort(alphasort);
for (const username of usernames) {
  exportColumns.push({
    header: username,
    key: username.toLowerCase(),
    width: 20,
  });
}
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
