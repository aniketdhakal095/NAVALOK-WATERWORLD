const express = require("express");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Gmail SMTP ----------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "navalok2025@gmail.com",
    pass: "Navalok2025@@@", // generate from google account
  },
});

// ---------- Generate PDF ----------
function generateInvoice(data) {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(20).text("Navalok WaterWorld Invoice");
    doc.moveDown();
    doc.text(`Product: ${data.productName}`);
    doc.text(`Price: Rs ${data.price}`);
    doc.text(`Quantity: ${data.quantity}`);
    doc.text(`Total: Rs ${data.price * data.quantity}`);
    doc.moveDown();

    doc.text("Sent By:");
    doc.text(`Product Owner: ${data.productOwnerEmail}`);
    doc.text("Admin: navalok2025@gmail.com");

    doc.end();
  });
}

// ---------- Send Email API ----------
app.post("/send-invoice", async (req, res) => {
  try {
    const purchaseInfo = req.body;

    const pdfBuffer = await generateInvoice(purchaseInfo);

    await transporter.sendMail({
      from: `"Navalok WaterWorld" <navalok2025@gmail.com>`,
      to: purchaseInfo.customerEmail,
      subject: "Purchase Invoice - Navalok WaterWorld",
      text: "Your purchase was successful. Invoice attached.",
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer,
        },
      ],
    });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Email failed" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));