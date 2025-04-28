const express = require('express');
const app = express();
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

app.get('/', async (req, res) => {
    const page = await editPdf();
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
  res.end(`<div>
    <h2>JS to PDF</h2>
    <p>${JSON.stringify(page)}</p>
    <div>`);
});
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

async function editPdf() {
  // Load a PDFDocument from the existing PDF bytes
  const existingPdfBytes = await fs.readFileSync('./katalog.pdf');

  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Get the first page of the document
  const pages = pdfDoc.getPages;
  const page = pages[6]
    console.log('PAGE-->', pages.length, page);
  return page

  // Draw a string of text diagonally across the first page
//   page.drawText('This is a test', {
//     x: 50,
//     y: 700,
//     size: 30,
//     color: rgb(0.95, 0.1, 0.1),
//   });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  //const pdfBytes = await pdfDoc.save();

  // Write the PDF to a file
  //fs.writeFileSync('edited.pdf', pdfBytes);
}