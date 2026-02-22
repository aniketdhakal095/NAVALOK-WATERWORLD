/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

admin.initializeApp();

const bucket = admin.storage().bucket();

// Email configuration - using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "navalok2025@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "", // App-specific password for Gmail
  },
});

interface OrderData {
  orderId: string;
  userEmail: string;
  productOwnerEmail: string;
  productOwnerName: string;
  product: {
    name: string;
    quantity: number;
    measureUnit: string;
    imageUrl?: string;
  };
  totalPrice: number;
  status: string;
  paymentMethod: string;
  orderDate: string;
}

// Function to generate PDF buffer
function generateOrderPDF(orderData: OrderData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Add content to PDF
    doc.fontSize(20).font("Helvetica-Bold").text("Order Invoice", { align: "center" });
    doc.moveDown();
    
    // Header
    doc.fontSize(12).font("Helvetica-Bold").text("Navalok Fresh Farm", { align: "center" });
    doc.fontSize(10).font("Helvetica").text("Email: navalok2025@gmail.com", { align: "center" });
    doc.moveDown();

    // Order Details
    doc.fontSize(12).font("Helvetica-Bold").text("Order Details", { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(10).font("Helvetica");
    doc.text(`Order ID: ${orderData.orderId}`);
    doc.text(`Order Date: ${orderData.orderDate}`);
    doc.text(`Status: ${orderData.status}`);
    doc.moveDown();

    // Product Details
    doc.fontSize(12).font("Helvetica-Bold").text("Product Information", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Product Name: ${orderData.product.name}`);
    doc.text(`Quantity: ${orderData.product.quantity} ${orderData.product.measureUnit}`);
    doc.moveDown();

    // Payment Details
    doc.fontSize(12).font("Helvetica-Bold").text("Payment Details", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Payment Method: ${orderData.paymentMethod}`);
    doc.fontSize(14).font("Helvetica-Bold").text(`Total Amount: Rs. ${orderData.totalPrice}`, { color: "000000" });
    doc.moveDown();

    // Customer Info
    doc.fontSize(12).font("Helvetica-Bold").text("Customer Information", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Email: ${orderData.userEmail}`);
    doc.moveDown();

    // Seller Info
    doc.fontSize(12).font("Helvetica-Bold").text("Seller Information", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Seller Name: ${orderData.productOwnerName}`);
    doc.text(`Seller Email: ${orderData.productOwnerEmail}`);
    doc.moveDown();

    // Footer
    doc.fontSize(9).font("Helvetica").text("Thank you for your order!", { align: "center" });
    doc.text("This document is an official receipt of your order.", { align: "center" });

    doc.end();
  });
}

// Function to generate HTML email content
function generateEmailHTML(orderData: OrderData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 5px 0 0 0; font-size: 14px; }
            .section { margin: 20px 0; }
            .section-title { font-weight: bold; font-size: 16px; color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 8px; margin-bottom: 12px; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .info-label { font-weight: bold; color: #555; }
            .info-value { color: #333; }
            .amount { font-size: 20px; font-weight: bold; color: #667eea; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888; }
            .status-badge { display: inline-block; background-color: #4CAF50; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
            .product-section { background-color: #f9f9f9; padding: 12px; border-radius: 4px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✓ Order Confirmed</h1>
                <p>Navalok Fresh Farm</p>
            </div>

            <h2>Hi ${orderData.userEmail.split('@')[0]},</h2>
            <p>Thank you for your order! We're excited to help you get fresh products. Here are your order details:</p>

            <!-- Order Summary -->
            <div class="section">
                <div class="section-title">Order Summary</div>
                <div class="info-row">
                    <span class="info-label">Order ID:</span>
                    <span class="info-value">#${orderData.orderId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Order Date & Time:</span>
                    <span class="info-value">${orderData.orderDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="status-badge">${orderData.status}</span>
                </div>
            </div>

            <!-- Product Details -->
            <div class="section">
                <div class="section-title">Product Details</div>
                <div class="product-section">
                    <div class="info-row">
                        <span class="info-label">Product Name:</span>
                        <span class="info-value">${orderData.product.name}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Quantity:</span>
                        <span class="info-value">${orderData.product.quantity} ${orderData.product.measureUnit}</span>
                    </div>
                </div>
            </div>

            <!-- Payment Details -->
            <div class="section">
                <div class="section-title">Payment Details</div>
                <div class="info-row">
                    <span class="info-label">Payment Method:</span>
                    <span class="info-value">${orderData.paymentMethod}</span>
                </div>
                <div style="margin-top: 15px; padding: 15px; background-color: #f0f7ff; border-left: 4px solid #667eea;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Total Amount</div>
                    <div class="amount">Rs. ${orderData.totalPrice}</div>
                </div>
            </div>

            <!-- Customer Info -->
            <div class="section">
                <div class="section-title">Your Information</div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${orderData.userEmail}</span>
                </div>
            </div>

            <!-- Seller Info -->
            <div class="section">
                <div class="section-title">Seller Information</div>
                <div class="info-row">
                    <span class="info-label">Seller Name:</span>
                    <span class="info-value">${orderData.productOwnerName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Seller Email:</span>
                    <span class="info-value">${orderData.productOwnerEmail}</span>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>Thank you for choosing Navalok Fresh Farm! We're committed to providing you with the freshest products.</p>
                <p style="margin-top: 10px; color: #999;">If you have any questions, please contact us at navalok2025@gmail.com</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Callable function to send order invoice email with PDF
export const sendOrderInvoice = onCall(async (request) => {
  try {
    const orderData: OrderData = request.data;

    // Validate required fields
    if (!orderData.userEmail || !orderData.productOwnerEmail || !orderData.orderId) {
      throw new Error("Missing required order data");
    }

    // Generate PDF
    const pdfBuffer = await generateOrderPDF(orderData);

    // Email configuration for different recipients
    const emails = [
      {
        to: orderData.userEmail,
        subject: `Order Confirmation #${orderData.orderId} - Navalok Fresh Farm`,
        recipientName: "Customer",
      },
      {
        to: orderData.productOwnerEmail,
        subject: `New Order #${orderData.orderId} Received - Navalok`,
        recipientName: "Seller",
      },
      {
        to: "navalok2025@gmail.com",
        subject: `New Order #${orderData.orderId} - Admin Notification`,
        recipientName: "Admin",
      },
    ];

    // Send emails to all recipients
    for (const email of emails) {
      try {
        const mailOptions = {
          from: "navalok2025@gmail.com",
          to: email.to,
          subject: email.subject,
          html: generateEmailHTML(orderData),
          attachments: [
            {
              filename: `Order_Invoice_${orderData.orderId}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        };

        await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully to ${email.to} (${email.recipientName})`, {
          orderId: orderData.orderId,
        });
      } catch (emailError) {
        logger.error(`Failed to send email to ${email.to}`, {
          error: emailError,
          orderId: orderData.orderId,
        });
        // Continue sending to other recipients even if one fails
      }
    }

    return {
      success: true,
      message: "Invoice emails sent successfully to all recipients",
      orderId: orderData.orderId,
    };
  } catch (error: any) {
    logger.error("Error in sendOrderInvoice function:", error);
    throw new Error(`Failed to send invoice: ${error.message}`);
  }
});
