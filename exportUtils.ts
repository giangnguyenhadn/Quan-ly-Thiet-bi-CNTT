
export const exportOrPrint = (
  mode: 'excel' | 'print',
  title: string, 
  columns: string[], 
  data: any[][], 
  summaryData?: any[][],
  qrCodeIndex?: number
) => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  const dateLine = `Hòa Xuân, ngày ${day} tháng ${month} năm ${year}`;
  const schoolYear = `${year}-${year + 1}`;
  
  const totalCols = columns.length;
  const colLeft = Math.floor(totalCols * 0.45) || 3; 
  const colRight = totalCols - colLeft;

  let tableHtml = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: "Times New Roman", Times, serif; margin: 30px; line-height: 1.5; color: #000; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; table-layout: fixed; word-wrap: break-word; }
        td, th { border: 0.5pt solid black; padding: 6px 4px; vertical-align: middle; font-size: 10pt; }
        .no-border, .no-border td { border: none !important; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .italic { font-style: italic; }
        .uppercase { text-transform: uppercase; }
        .header-bg { background-color: #f2f2f2 !important; font-weight: bold; text-align: center; }
        .qr-img { width: 60px; height: 60px; display: block; margin: 0 auto; }
        /* Excel specific formatting */
        .number { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; }
        .text { mso-number-format:"\\@"; text-align: center; }
        @media print {
          @page { size: A4 landscape; margin: 1cm; }
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <table class="no-border" style="width: 100%">
        <tr>
          <td colspan="${colLeft}" align="center" style="text-align:center;">UBND PHƯỜNG HÒA XUÂN</td>
          <td colspan="${colRight}" align="center" style="font-weight: bold; text-align:center;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</td>
        </tr>
        <tr>
          <td colspan="${colLeft}" align="center" style="font-weight: bold; text-align:center;">
            TRƯỜNG TH TRẦN ĐẠI NGHĨA
          </td>
          <td colspan="${colRight}" align="center" style="font-weight: bold; text-align:center;">
            Độc lập - Tự do - Hạnh phúc
          </td>
        </tr>
      </table>

      <div style="height: 20px;"></div>

      <div style="text-align: center;">
        <div style="font-size: 16pt; font-weight: bold; text-transform: uppercase;">${title}</div>
        <div style="font-size: 12pt; font-weight: bold; margin-top: 5px;">Năm học: ${schoolYear}</div>
      </div>

      <div style="height: 15px;"></div>

      ${summaryData && summaryData.length > 0 ? `
        <div style="font-weight: bold; font-size: 11pt; margin-bottom: 5px;">I. TỔNG HỢP TÀI SẢN</div>
        <table>
          <tr class="header-bg">
             <td style="width: 20%;">Loại thiết bị</td>
             <td style="width: 8%;">ĐVT</td>
             <td style="width: 12%;">Đơn giá TB</td>
             <td style="width: 8%;">Tốt</td>
             <td style="width: 8%;">Hỏng</td>
             <td style="width: 8%;">Tổng</td>
             <td style="width: 15%;">Thành tiền</td>
             <td>Ghi chú</td>
             ${Array(Math.max(0, totalCols - 8)).fill(0).map(() => `<td></td>`).join('')}
          </tr>
          ${summaryData.map(row => {
            const isTotal = String(row[0]).includes('TỔNG CỘNG');
            const formatNum = (val: any) => mode === 'print' ? Number(val || 0).toLocaleString('vi-VN') : (val || 0);
            return `
              <tr style="${isTotal ? 'font-weight: bold; background: #eee;' : ''}">
                <td class="text">${row[0] ?? ''}</td>
                <td class="text-center">${row[1] ?? ''}</td>
                <td class="number">${formatNum(row[2])}</td>
                <td class="text-center">${row[3] ?? 0}</td>
                <td class="text-center">${row[4] ?? 0}</td>
                <td class="text-center">${row[5] ?? 0}</td>
                <td class="number">${formatNum(row[6])}</td>
                <td class="text">${row[7] ?? ''}</td>
                ${Array(Math.max(0, totalCols - 8)).fill(0).map(() => `<td></td>`).join('')}
              </tr>
            `;
          }).join('')}
        </table>
        <div style="height: 15px;"></div>
        <div style="font-weight: bold; font-size: 11pt; margin-bottom: 5px;">II. DANH MỤC CHI TIẾT</div>
      ` : ''}

      <table>
        <tr class="header-bg">
          ${columns.map(col => `<td>${col}</td>`).join('')}
        </tr>
        ${data.map(row => `
          <tr>
            ${row.map((cell, idx) => {
              const isNumeric = typeof cell === 'number';
              
              // Nếu là chế độ IN và là cột QR
              if (mode === 'print' && idx === qrCodeIndex) {
                 const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${cell}`;
                 return `<td align="center"><img src="${qrUrl}" class="qr-img"/></td>`;
              }

              const displayVal = (isNumeric && mode === 'print') ? cell.toLocaleString('vi-VN') : (cell ?? '');
              return `<td class="${isNumeric ? 'number' : 'text-center'}">${displayVal}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </table>

      <div style="height: 30px;"></div>

      <table class="no-border" style="width: 100%">
        <tr>
          <td colspan="${colLeft}"></td>
          <td colspan="${colRight}" align="center" style="font-style: italic; text-align:center;">${dateLine}</td>
        </tr>
        <tr style="font-weight: bold;">
          <td colspan="${colLeft}" align="center" style="text-align:center;">NGƯỜI LẬP BIỂU</td>
          <td colspan="${colRight}" align="center" style="text-align:center;">HIỆU TRƯỞNG</td>
        </tr>
        <tr style="font-style: italic; font-size: 9pt;">
          <td colspan="${colLeft}" align="center" style="text-align:center;">(Ký, ghi rõ họ tên)</td>
          <td colspan="${colRight}" align="center" style="text-align:center;">(Ký tên, đóng dấu)</td>
        </tr>
        <tr><td colspan="${totalCols}" style="height: 60px;"></td></tr>
        <tr style="font-weight: bold;">
          <td colspan="${colLeft}" align="center" style="text-align:center;">Nguyễn Thị Thanh Hương</td>
          <td colspan="${colRight}" align="center" style="text-align:center;">Ngô Thị Bích Đào</td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (mode === 'excel') {
    const blob = new Blob(['\ufeff', tableHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const fileName = `${title.trim().replace(/\s+/g, '-')}-${year}${month}${day}.xls`;
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (printWindow) {
      printWindow.document.write(tableHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 700);
    }
  }
};

export const printQRLabelCards = (title: string, items: { qrDataUrl: string, name: string, location: string, code: string }[]) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Vui lòng cho phép trình duyệt mở pop-up để thực hiện in!");
    return;
  }

  const htmlContent = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @page { size: A4; margin: 10mm; }
        body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: #fff; }
        .grid { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr);
          gap: 15px; 
        }
        .label-card {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          page-break-inside: avoid;
          height: 180px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .school-name { font-size: 8pt; font-weight: bold; color: #333; margin-bottom: 5px; text-transform: uppercase; }
        .qr-img { width: 100px; height: 100px; display: block; margin: 5px auto; }
        .device-name { font-size: 9pt; font-weight: bold; margin-top: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .device-code { font-size: 8pt; color: #666; font-family: monospace; font-weight: bold; margin-top: 2px; }
      </style>
    </head>
    <body>
      <div class="grid">
        ${items.map(item => `
          <div class="label-card">
            <div class="school-name">TRƯỜNG TH TRẦN ĐẠI NGHĨA</div>
            <img src="${item.qrDataUrl}" class="qr-img" />
            <div class="device-name">${item.name} - ${item.location}</div>
            <div class="device-code">ID: ${item.code}</div>
          </div>
        `).join('')}
      </div>
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
            window.onafterprint = () => window.close();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
