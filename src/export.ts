import * as ExcelJS from "exceljs";
import * as fs from "fs";
import alphasort from "./alphasort";
import { IPermissions } from "./interfaces";
import getSynoData from "./synodata";

const data = getSynoData();

const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet("Accès", {
  views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
});

const exportColumns = [{ header: "Partage", key: "share", width: 25 }];
const usernames = Object.keys(data.users).sort(alphasort);
for (const username of usernames) {
  exportColumns.push({
    header: username,
    key: username.toLowerCase(),
    width: 7,
  });
}
ws.columns = exportColumns;

const hHeaders = ws.getRow(1);
hHeaders.eachCell({ includeEmpty: true }, (cell /*colNumber*/) => {
  cell.font = { bold: true };
  cell.border = {
    bottom: { style: "thin", color: { argb: "FF333333" } },
  };
});

const vHeaders = ws.getColumn(1);
vHeaders.eachCell({ includeEmpty: true }, (cell /*colNumber*/) => {
  cell.font = { bold: true };
  cell.border = {
    right: { style: "thin", color: { argb: "FF333333" } },
  };
});

const rows = Object.keys(data.shares)
  .sort(alphasort)
  .map((shareName) => {
    const row = [shareName];
    for (const username of usernames) {
      let access = "-";
      const permissions: IPermissions = data.shares[shareName].permissions;
      if (permissions.readWrite.indexOf(username) !== -1) {
        access = "RW";
      } else if (permissions.readOnly.indexOf(username) !== -1) {
        access = "RO";
      } else if (permissions.custom.indexOf(username) !== -1) {
        access = "CA";
      } else if (permissions.none.indexOf(username) !== -1) {
        access = "NA";
      }
      row.push(access);
    }
    return row;
  });

const fills: { [index: string]: ExcelJS.Fill } = {
  "-": {
    bgColor: { argb: "88FF0000" },
    fgColor: { argb: "88FF0000" },
    pattern: "none",
    type: "pattern",
  },
  "CA": {
    fgColor: { argb: "8800FF00" },
    pattern: "none",
    type: "pattern",
  },
  "NA": {
    fgColor: { argb: "880000FF" },
    pattern: "none",
    type: "pattern",
  },
  "RO": {
    fgColor: { argb: "88000000" },
    pattern: "none",
    type: "pattern",
  },
  "RW": {
    fgColor: { argb: "88FFFFFF" },
    pattern: "none",
    type: "pattern",
  },
};
ws.eachRow((row, rowNumber) => {
  console.log("Adding style for row " + rowNumber);
  if (rowNumber === 1) {
    return;
  }
  row.eachCell((cell, colNumber) => {
    console.log("Adding style for col " + colNumber);
    if (colNumber === 1) {
      return;
    }
    console.log("Cell contains " + cell.value);
    if (typeof cell.value === "string") {
      console.log("Adding fill for this cell");
      cell.fill = fills[cell.value];
    }
  });
});

ws.addRows(rows);

wb.xlsx.writeFile("/volume21/GROUPE - IT/EXPORT ACCES PARTAGES.xlsx");
