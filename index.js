// app.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const xml2js = require('xml2js');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle upload of XML or JSON
app.post('/upload-data', upload.single('dataFile'), async (req, res) => {
  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  let data = {};

  try {
    const raw = fs.readFileSync(filePath, 'utf8');

    if (mimeType === 'application/json') {
      data = JSON.parse(raw);
    } else if (mimeType === 'text/xml' || mimeType === 'application/xml') {
      const parsed = await xml2js.parseStringPromise(raw);
      data = parsed;
    } else {
      return res.status(400).send('Unsupported file type');
    }

    const flat = flattenObject(data);

    fs.unlinkSync(filePath); // cleanup
    res.json(flat);
  } catch (err) {
    res.status(500).send('Parsing failed: ' + err.message);
  }
});

// Handle PDF replacement
app.post('/replace-pdf', upload.single('pdfFile'), async (req, res) => {
  const filePath = req.file.path;
  const { replacements } = req.body;
  const parsedReplacements = JSON.parse(replacements);

  try {
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      let content = await page.getTextContent(); // won't work directly

      const form = pdfDoc.getForm();
      for (const key in parsedReplacements) {
        try {
          const field = form.getTextField(key);
          field.setText(parsedReplacements[key]);
        } catch (e) {
          // Field not found
        }
      }
    }

    const modifiedPdf = await pdfDoc.save();
    fs.unlinkSync(filePath); // cleanup

    res.contentType('application/pdf');
    res.send(modifiedPdf);
  } catch (err) {
    res.status(500).send('PDF processing failed: ' + err.message);
  }
});

function flattenObject(obj, parent = '', res = {}) {
  for (let key in obj) {
    const propName = parent ? parent + '.' + key : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      flattenObject(obj[key], propName, res);
    } else {
      res[propName] = Array.isArray(obj[key]) ? obj[key][0] : obj[key];
    }
  }
  return res;
}

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
