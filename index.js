const express = require('express');
const app = express();
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');
const _ = require('lodash');

app.get('/', async (req, res) => {
    const page = await editPdf();
    const data = await getNewData();
    console.log('KEYS-->', _.get(data, ['yml_catalog', 'shop', 'offers', 'offer']));
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
  res.end(`<div>
    <h2>JS to PDF</h2>
    <p>${_.get(data, ['yml_catalog', 'shop', 'categories', 'category'])}</p>
    <p>${_.get(data, ['yml_catalog', 'shop', 'offers', 'offer'])}</p>
    <div>`);
});
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

async function getNewData() {
  const xmlParser = new XMLParser();
  const xml = await fetch('https://rostmetall.ru/yandex.xml');
  const text = await xml.text();
  const data = await xmlParser.parse(text, true);
  return data
}

async function editPdf() {
  // Load a PDFDocument from the existing PDF bytes
  const pdfPath = path.join(__dirname, 'katalog.pdf');
  const existingPdfBytes = await fs.readFileSync(pdfPath);
  console.log('EXISTING PDF BYTES-->', typeof existingPdfBytes, existingPdfBytes.byteLength);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Get the first page of the document
  const pages = pdfDoc.getPages();
  const page = pages[6]
    console.log('PAGE-->', typeof page);
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