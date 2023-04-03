const PDFDocument = require("pdfkit");
const fs = require("fs");
const { v4 } = require("uuid");

const generatePdf = async (user) => {
  // Create a document
  const doc = new PDFDocument();

  // Saving the pdf file in root directory.
  doc.pipe(fs.createWriteStream(`${v4() - user.name}.pdf`));

  // Adding functionality
  doc.fontSize(27).text("ID Card", {
    width: 400,
    align: "center",
  });

  // Adding an image in the pdf.

  doc.image(user.image, {
    fit: [300, 300],
    align: "center",
    valign: "center",
  });

  doc.fontSize(15).text(`Name:${user.name}`, 100, 100);
  doc.fontSize(15).text(`Ojass-Id:${user.ojassId}`, 100, 100);
  doc.fontSize(15).text(`Event:${user.event}`, 100, 100);
  doc.fontSize(15).text(`Status:Registered`, 100, 100);

  // Apply some transforms and render an SVG path with the
  // 'even-odd' fill rule
  doc
    .scale(0.6)
    .translate(470, -380)
    .path("M 250,75 L 323,301 131,161 369,161 177,301 z")
    .fill("red", "even-odd")
    .restore();

  // Finalize PDF file
  doc.end();
};

module.exports = generatePdf;
