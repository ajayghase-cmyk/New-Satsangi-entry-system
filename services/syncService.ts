
import { Visitor, VisitorStatus } from "../types";

export interface SyncConfig {
  sheetId: string;
  formId: string;
  appsScriptUrl: string;
  mappings: {
    name: string;
    gender: string;
    age: string;
    place: string;
    aadhar: string;
    groupLeader: string;
    jkpId: string;
    fromDate: string;
    toDate: string;
    amPm: string;
    phone: string;
    event: string;
    noOfDays: string;
    amount: string;
  };
}

export const debugLogs: string[] = [];
let lastRawResponse: string = "";

const addLog = (msg: string) => {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${msg}`;
  debugLogs.unshift(logEntry);
  if (debugLogs.length > 50) debugLogs.pop();
  console.log(logEntry);
};

export const getDebugInfo = () => ({
  logs: debugLogs,
  lastRawResponse: lastRawResponse.slice(0, 1000)
});

// --- YAHAN APNI DETAILS FIX KAREIN TAAKI DUSRE PCS PAR AUTO-LOAD HO ---
export const DEFAULT_CONFIG: SyncConfig = {
  sheetId: '14gZ5F2Kd-FXRL-Kvg0D5tHJyZOUT0D9pb8yGCBGCSY0', // Aapki Sheet ID
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbwj6t4NOeLqG7EtOYU7cYZA1_emSaAeMGnKzgYmG7ZTBmCwt0xGPctrW1w49yth5-2I/exec', // Aapka Apps Script URL yahan paste karein
  formId: '1FAIpQLSd6DIDqjzgR4VbTAasyEH-lP1lBC2_KgUX4FY1Oz4qI6ewyqg',
  mappings: {
    name: 'entry.317214070',
    gender: 'entry.1306491324',
    age: 'entry.6489958',
    place: 'entry.103758466',
    aadhar: 'entry.1041189906',
    groupLeader: 'entry.453538488',
    jkpId: 'entry.120930572',
    fromDate: 'entry.1748803761',
    toDate: 'entry.673656392',
    amPm: 'entry.74271214',
    phone: 'entry.2030673098',
    event: 'entry.1858985532',
    noOfDays: 'entry.1162054468',
    amount: 'entry.618294482'
  }
};

const extractId = (input: string): string => {
  if (!input) return '';
  const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : input.trim();
};

export const getConfig = (): SyncConfig => {
  const stored = localStorage.getItem('vms_sync_config');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Merge with defaults in case of new fields
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
};

export const getSpreadsheetUrl = (): string => {
  const config = getConfig();
  if (!config.sheetId) return '#';
  return `https://docs.google.com/spreadsheets/d/${config.sheetId}/edit`;
};

export const saveConfig = (config: SyncConfig) => {
  config.sheetId = extractId(config.sheetId);
  localStorage.setItem('vms_sync_config', JSON.stringify(config));
  addLog(`Config saved. ID: ${config.sheetId}`);
};

const parseCsv = (text: string): string[][] => {
  const result: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"'; i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim()); cell = "";
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      if (row.length > 0 || cell !== "") {
        row.push(cell.trim());
        result.push(row);
      }
      row = []; cell = "";
    } else {
      cell += char;
    }
  }
  if (row.length > 0 || cell !== "") {
    row.push(cell.trim()); result.push(row);
  }
  return result;
};

export const formatDateToCustom = (dateStr: string): string => {
  if (!dateStr || dateStr === '-' || dateStr === 'undefined') return '-';
  if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

export const parseAnyDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split(/[\/\-:]/);
  if (parts.length === 3) {
    if (parseInt(parts[0]) <= 31 && parseInt(parts[2]) > 1000) {
      const d = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      const y = parseInt(parts[2]);
      return new Date(y, m, d);
    }
    if (parseInt(parts[0]) > 1000) {
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      const d = parseInt(parts[2]);
      return new Date(y, m, d);
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

export const parseCustomDate = (str: string): Date | null => {
  return parseAnyDate(str);
};

export const processCsvData = (csvText: string): Visitor[] => {
  if (!csvText || csvText.includes("<!DOCTYPE") || csvText.includes("google-site-verification")) {
    addLog("Error: Sheet not published as CSV correctly.");
    throw new Error("NOT_PUBLISHED");
  }
  
  const allRows = parseCsv(csvText.trim());
  if (allRows.length < 2) return [];

  const dataRows = allRows.slice(1);
  addLog(`Fetched ${dataRows.length} entries.`);

  return dataRows.map((cols) => {
    const timestampStr = cols[0];
    const name = cols[1] || 'Unknown';
    const phone = cols[11] || '-';
    const parsedTs = parseAnyDate(timestampStr);
    const timestampISO = parsedTs ? parsedTs.toISOString() : new Date().toISOString();
    const stableId = `v-${timestampStr}-${name}-${phone}`.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();

    return {
      id: stableId,
      name,
      gender: cols[2] || 'Male',
      age: cols[3] || '0',
      place: cols[4] || '-',
      aadharNo: cols[5] || '-',
      groupLeader: cols[6] || '-',
      jkpId: cols[7] || '-',
      fromDate: formatDateToCustom(cols[8]),
      toDate: formatDateToCustom(cols[9]),
      amPm: cols[10] || 'AM',
      phone,
      event: cols[12] || 'NO EV',
      noOfDays: parseInt(cols[13]) || 0,
      amount: parseFloat(String(cols[14]).replace(/[^0-9.-]+/g, "")) || 0,
      status: VisitorStatus.OUT,
      checkInTimestamp: timestampISO
    };
  }).filter(v => v.name && v.name !== 'Unknown');
};

export const fetchSheetData = async (): Promise<Visitor[]> => {
  const config = getConfig();
  const sid = config.sheetId;
  if (!sid) {
    addLog("Sync error: Missing Sheet ID.");
    throw new Error("Missing Sheet ID");
  }

  const t = Date.now();
  const exportUrl = `https://docs.google.com/spreadsheets/d/${sid}/export?format=csv&gid=0&t=${t}`;
  
  try {
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(exportUrl)}`);
    if (response.ok) {
      const text = await response.text();
      if (text && text.length > 20) {
        lastRawResponse = text;
        return processCsvData(text);
      }
    }
  } catch (e) {
    addLog("Fetch failed. Check Internet or Sheet Settings.");
  }
  throw new Error("SYNC_FAILED");
};

export const submitToGoogleForm = async (visitor: Visitor): Promise<boolean> => {
  const config = getConfig();
  
  if (config.appsScriptUrl) {
    try {
      addLog(`Sending to Apps Script: ${visitor.name}...`);
      await fetch(config.appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(visitor)
      });
      addLog(`Success for ${visitor.name}.`);
      return true;
    } catch (e) {
      addLog(`Apps Script Error: ${e}`);
    }
  }

  if (config.formId) {
    const formData = new FormData();
    formData.append(config.mappings.name, visitor.name);
    formData.append(config.mappings.gender, visitor.gender);
    formData.append(config.mappings.age, visitor.age);
    formData.append(config.mappings.place, visitor.place);
    formData.append(config.mappings.aadhar, visitor.aadharNo);
    formData.append(config.mappings.groupLeader, visitor.groupLeader);
    formData.append(config.mappings.jkpId, visitor.jkpId);
    formData.append(config.mappings.fromDate, formatDateToCustom(visitor.fromDate));
    formData.append(config.mappings.toDate, formatDateToCustom(visitor.toDate));
    formData.append(config.mappings.amPm, visitor.amPm);
    formData.append(config.mappings.phone, visitor.phone);
    formData.append(config.mappings.event, visitor.event);
    formData.append(config.mappings.noOfDays, String(visitor.noOfDays));
    formData.append(config.mappings.amount, String(visitor.amount));

    try {
      await fetch(`https://docs.google.com/forms/d/e/${config.formId}/formResponse`, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
      return true;
    } catch (e) {
      addLog("Fallback failed.");
    }
  }
  return false;
};
