import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatRupiah, formatDate } from './formatters'

/**
 * Ekspor kebutuhan event ke file CSV
 */
export function exportToCSV(event, categories, items) {
  if (!event) return

  // Header CSV
  const headers = [
    'No',
    'Kategori',
    'Nama Kebutuhan',
    'Jumlah',
    'Estimasi Biaya (Rp)',
    'Penanggung Jawab',
    'Deadline',
    'Prioritas',
    'Status',
    'Catatan',
    'Ditambahkan Oleh',
  ]

  // Map category id to name
  const categoryMap = {}
  categories.forEach((cat) => {
    categoryMap[cat.id] = cat.nama
  })

  // Rows
  const rows = items.map((item, index) => [
    index + 1,
    `"${categoryMap[item.category_id] || 'Umum'}"`,
    `"${(item.nama_kebutuhan || '').replace(/"/g, '""')}"`,
    `"${(item.jumlah || '').replace(/"/g, '""')}"`,
    item.estimasi_biaya || 0,
    `"${(item.penanggung_jawab || '').replace(/"/g, '""')}"`,
    item.deadline ? formatDate(item.deadline) : '-',
    item.prioritas || 'Sedang',
    item.status || 'Belum',
    `"${(item.catatan || '').replace(/"/g, '""')}"`,
    `"${(item.created_by_name || '').replace(/"/g, '""')}"`,
  ])

  // Gabungkan dengan BOM \uFEFF agar aksen dan karakter UTF-8 terbaca sempurna di Microsoft Excel
  const csvContent =
    '\uFEFF' +
    `DAFTAR KEBUTUHAN EVENT: ${event.nama}\n` +
    `Tanggal: ${formatDate(event.tanggal)} | Lokasi: ${event.lokasi} | PJ: ${event.penanggung_jawab}\n\n` +
    headers.join(',') +
    '\n' +
    rows.map((row) => row.join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  const safeTitle = event.nama.toLowerCase().replace(/[^a-z0-9]/g, '_')
  link.setAttribute('download', `kebutuhan_${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Ekspor kebutuhan event ke dokumen PDF formal siap cetak untuk rapat OSIS
 */
export function exportToPDF(event, categories, items) {
  if (!event) return

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Header Dokumen Resmi OSIS
  doc.setFillColor(30, 41, 59) // Slate 800
  doc.rect(0, 0, 210, 24, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ORGANISASI SISWA INTRA SEKOLAH (OSIS)', 14, 12)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('LEMBAR KONTROL & DAFTAR KEBUTUHAN EVENT', 14, 18)

  // Informasi Event
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(event.nama, 14, 34)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)

  doc.text(`Tanggal Pelaksanaan : ${formatDate(event.tanggal)}`, 14, 40)
  doc.text(`Lokasi Acara       : ${event.lokasi}`, 14, 45)
  doc.text(`Penanggung Jawab   : ${event.penanggung_jawab}`, 14, 50)
  doc.text(`Status Event       : ${event.status}`, 14, 55)

  // Statistik Ringkas
  const totalItem = items.length
  const totalSelesai = items.filter((i) => i.status === 'Selesai').length
  const totalBiaya = items.reduce((acc, curr) => acc + (Number(curr.estimasi_biaya) || 0), 0)
  const persenSelesai = totalItem > 0 ? Math.round((totalSelesai / totalItem) * 100) : 0

  doc.setFillColor(241, 245, 249)
  doc.roundedRect(120, 30, 76, 28, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(30, 41, 59)
  doc.text('RINGKASAN PROGRES:', 124, 36)
  doc.setFont('helvetica', 'normal')
  doc.text(`Progres: ${totalSelesai} dari ${totalItem} item (${persenSelesai}%)`, 124, 42)
  doc.text(`Total Estimasi Biaya:`, 124, 48)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 118, 110)
  doc.text(formatRupiah(totalBiaya), 124, 54)

  // Group items by category
  let startY = 64
  const categoryMap = {}
  categories.forEach((c) => {
    categoryMap[c.id] = c.nama
  })

  // Buat tabel untuk masing-masing kategori atau tabel gabungan
  const tableData = items.map((item, idx) => [
    idx + 1,
    categoryMap[item.category_id] || '-',
    item.nama_kebutuhan,
    item.jumlah || '1',
    formatRupiah(item.estimasi_biaya),
    item.penanggung_jawab,
    item.deadline ? formatDate(item.deadline) : '-',
    item.prioritas,
    item.status,
  ])

  autoTable(doc, {
    startY: startY,
    head: [
      [
        'No',
        'Kategori',
        'Nama Kebutuhan',
        'Jumlah',
        'Estimasi Biaya',
        'PJ',
        'Deadline',
        'Prioritas',
        'Status',
      ],
    ],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 42 },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 24 },
      6: { cellWidth: 20, halign: 'center' },
      7: { cellWidth: 16, halign: 'center' },
      8: { cellWidth: 16, halign: 'center' },
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 8) {
        const val = data.cell.raw
        if (val === 'Selesai') {
          data.cell.styles.textColor = [22, 101, 52] // green
          data.cell.styles.fontStyle = 'bold'
        } else if (val === 'Proses') {
          data.cell.styles.textColor = [194, 65, 12] // orange
        } else {
          data.cell.styles.textColor = [185, 28, 28] // red
        }
      }
    },
  })

  // Footer & Tanda Tangan
  const finalY = doc.lastAutoTable.finalY + 12
  if (finalY < 250) {
    doc.setFontSize(8)
    doc.setTextColor(71, 85, 105)
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')} | Dokumen Kerja Internal Pengurus OSIS`, 14, finalY)

    doc.text('Mengetahui,', 20, finalY + 10)
    doc.text('Ketua Umum OSIS', 20, finalY + 14)
    doc.text('______________________', 20, finalY + 32)

    doc.text('Penanggung Jawab Acara,', 140, finalY + 10)
    doc.text(`${event.penanggung_jawab}`, 140, finalY + 14)
    doc.text('______________________', 140, finalY + 32)
  }

  const safeTitle = event.nama.toLowerCase().replace(/[^a-z0-9]/g, '_')
  doc.save(`kebutuhan_${safeTitle}_${new Date().toISOString().slice(0, 10)}.pdf`)
}
