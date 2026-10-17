/**
 * Utilities for Thai date formatting, Thai Baht text converter, and CSV export.
 */

const thaiMonthsShort = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const thaiMonthsFull = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export function formatThaiDate(dateString?: string, full: boolean = false): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10) + 543;
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const month = full ? thaiMonthsFull[monthIdx] : thaiMonthsShort[monthIdx];
      return `${day} ${month} ${year}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = d.getDate();
    const month = full ? thaiMonthsFull[d.getMonth()] : thaiMonthsShort[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}

export function getTodayThaiDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH').format(amount);
}

/**
 * Converts numeric amount to Thai Baht text representation
 * e.g., 10500 -> หนึ่งหมื่นห้าร้อยบาทถ้วน
 */
export function thaiBahtText(num: number): string {
  if (isNaN(num) || num === 0) return 'ศูนย์บาทถ้วน';

  const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const intPart = Math.floor(Math.abs(num));
  let str = intPart.toString();
  let result = '';

  const len = str.length;
  for (let i = 0; i < len; i++) {
    const digit = parseInt(str.charAt(i), 10);
    const unitPos = len - i - 1;
    const u = units[unitPos % 6];

    if (digit !== 0) {
      if (unitPos % 6 === 1 && digit === 1) {
        // 10 -> สิบ
        result += '';
      } else if (unitPos % 6 === 1 && digit === 2) {
        // 20 -> ยี่สิบ
        result += 'ยี่';
      } else if (unitPos % 6 === 0 && digit === 1 && len > 1 && i === len - 1) {
        // last digit 1 -> เอ็ด (if not alone)
        result += 'เอ็ด';
      } else {
        result += numbers[digit];
      }
      result += u;
    }

    if (unitPos % 6 === 0 && unitPos > 0) {
      result += 'ล้าน';
    }
  }

  return (num < 0 ? 'ลบ' : '') + result + 'บาทถ้วน';
}

/**
 * Trigger browser download for CSV content with UTF-8 BOM
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const BOM = '\uFEFF';
  const csvContent = [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
    ...rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
