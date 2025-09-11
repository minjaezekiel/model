import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Helper: check if row is empty
function isEmptyRow(row) {
  return Object.values(row).every((val) => val === "" || val === null || val === undefined);
}

// Helper: remove empty rows and columns
function cleanSheetData(data) {
  // 1. Remove empty rows
  let cleanedRows = data.filter((row) => !isEmptyRow(row));

  if (cleanedRows.length === 0) return [];

  // 2. Find non-empty columns
  const nonEmptyColumns = new Set();
  cleanedRows.forEach((row) => {
    Object.entries(row).forEach(([key, val]) => {
      if (val !== "" && val !== null && val !== undefined) {
        nonEmptyColumns.add(key);
      }
    });
  });

  // 3. Keep only non-empty columns
  cleanedRows = cleanedRows.map((row) => {
    const newRow = {};
    [...nonEmptyColumns].forEach((col) => {
      newRow[col] = row[col];
    });
    return newRow;
  });

  return cleanedRows;
}

// Load Excel file
export async function loadExcel(filePath) {
  const response = await fetch(filePath);
  const arrayBuffer = await response.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const sheets = {};
  workbook.SheetNames.forEach((name) => {
    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[name], {
      defval: "", // keep empty cells
    });
    sheets[name] = cleanSheetData(rawData); // Clean rows & columns
  });

  return { workbook, sheets };
}

// Save updated data back to Excel
export function saveExcel(sheets, filename = "updated_model.xlsx") {
  const workbook = XLSX.utils.book_new();

  Object.keys(sheets).forEach((name) => {
    const worksheet = XLSX.utils.json_to_sheet(sheets[name]);
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  });

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, filename);
}
