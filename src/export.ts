import * as ExcelJS from "exceljs";
import * as fs from "fs";
import alphasort from "./alphasort";
import { IPermissions } from "./interfaces";
import getSynoData from "./synodata";

const data = getSynoData();
const usernames = Object.keys(data.users).sort(alphasort);
const shareNames = Object.keys(data.shares).sort(alphasort);

const wb = new ExcelJS.Workbook();

// FULL MATRIX
let ws = wb.addWorksheet("Matrice", {
  views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
});

ws.columns = [{ header: "Partage", key: "share", width: 25 }];
for (const username of usernames) {
  ws.columns.push({
    header: username,
    key: username.toLowerCase(),
    width: 7,
  });
}

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

const rows = shareNames.map((shareName) => {
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
    fgColor: { argb: "FFeeeeee" },
    pattern: "solid",
    type: "pattern",
  },
  "CA": {
    fgColor: { argb: "FFFF9800" },
    pattern: "solid",
    type: "pattern",
  },
  "NA": {
    fgColor: { argb: "FFeeeeee" },
    pattern: "solid",
    type: "pattern",
  },
  "RO": {
    fgColor: { argb: "FFBBDEFB" },
    pattern: "solid",
    type: "pattern",
  },
  "RW": {
    fgColor: { argb: "88AED581" },
    pattern: "solid",
    type: "pattern",
  },
};

ws.addRows(rows);

ws.eachRow((row, rowNumber) => {
  if (rowNumber === 1) {
    return;
  }
  row.eachCell((cell, colNumber) => {
    if (colNumber === 1) {
      return;
    }
    if (typeof cell.value === "string") {
      cell.fill = fills[cell.value];
      cell.alignment = { vertical: "middle", horizontal: "center" };
    }
  });
});

// BY SHARE
ws = wb.addWorksheet("Par partage", {
  views: [{ state: "frozen", xSplit: 1 }],
});

ws.columns = [
  { header: "Partage", key: "share", width: 25 },
  { header: "Accès", key: "access", width: 5 },
  { header: "Utilisateurs", key: "users", width: 300 },
];

for (const shareName of shareNames) {
  const permissions = data.shares[shareName].permissions;
  const rwUsers = permissions.readWrite.sort(alphasort).join(" ,");
  const roUsers = permissions.readOnly.sort(alphasort).join(" ,");
  const rowRW = [shareName, "RW", rwUsers];
  const rowRO = ["", "RO", roUsers];
  ws.addRow(rowRW);
  const last = ws.addRow(rowRO);
  last.border = {
    bottom: { style: "thin" },
  };
}

// BY USER
ws = wb.addWorksheet("Par utilisateur", {
  views: [{ state: "frozen", xSplit: 1 }],
});

wb.xlsx.writeFile("/volume21/GROUPE - IT/EXPORT ACCES PARTAGES.xlsx");
