import { MAJORS, normalizeMajor } from "./majors.js";

const getCellText = (cell) => {
  const value = cell.value;
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if ("richText" in value) {
      return value.richText.map((part) => part.text).join("").trim();
    }
    if ("result" in value) return String(value.result ?? "").trim();
    if ("text" in value) return String(value.text ?? "").trim();
    return "";
  }
  return String(value).trim();
};

const parseClass = (value) => {
  const match = value.match(/\bkelas\s*:\s*([ivx]+\s+[a-z]+(?:\s+\d+)?)/i);
  if (!match) return null;

  const label = match[1].replace(/\s+/g, " ").toUpperCase();
  const [grade, rawMajor] = label.split(/\s+/);
  const major = normalizeMajor(rawMajor);
  if (!MAJORS.includes(major)) return null;

  return { grade, label: `${grade} ${major.toUpperCase()}`, major };
};

export async function parseAttendanceRoster(file) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  const groups = new Map();
  workbook.worksheets.forEach((worksheet) => {
    let activeGroup = null;
    worksheet.eachRow((row) => {
      let classHeader = null;
      row.eachCell((cell) => {
        classHeader ??= parseClass(getCellText(cell));
      });

      if (classHeader) {
        const id = `${worksheet.name}:${classHeader.grade}:${classHeader.major}`;
        activeGroup = groups.get(id);
        if (!activeGroup) {
          activeGroup = {
            id,
            sheetName: worksheet.name,
            label: classHeader.label,
            major: classHeader.major,
            students: [],
          };
          groups.set(id, activeGroup);
        }
      }

      if (!activeGroup) return;
      const studentId = getCellText(row.getCell(2));
      const studentName = getCellText(row.getCell(3));
      if (!/^\d+$/.test(studentId) || !studentName) return;

      activeGroup.students.push({
        student_name: studentName,
        email: "",
        student_id: studentId,
        student_class: activeGroup.major,
        password: "",
        pin: "",
      });
    });
  });

  return [...groups.values()]
    .filter((group) => group.students.length > 0)
    .flatMap((group) => {
      const batchCount = Math.ceil(group.students.length / 100);
      return Array.from({ length: batchCount }, (_, batchIndex) => {
        const batchNumber = batchIndex + 1;
        const students = group.students.slice(batchIndex * 100, batchNumber * 100);
        return {
          ...group,
          id: `${group.id}:${batchNumber}`,
          label: batchCount > 1 ? `${group.label} (${batchNumber}/${batchCount})` : group.label,
          students,
        };
      });
    });
}
