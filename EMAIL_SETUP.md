# Email Setup Guide for Navalok Order Invoices

## Overview
The system now sends professional HTML emails with PDF invoices to:
- **Customer** (user who placed the order)
- **Product Owner/Seller** (seller of the product)
- **Admin** (navalok2025@gmail.com)

## Setup Instructions

### Step 1: Generate Gmail App Password

Since we're using Gmail to send emails, you need to create an **App Password** (not your regular Gmail password).

1. Go to your Gmail account: [myaccount.google.com](https://myaccount.google.com)
2. Go to **Security** (left sidebar)
3. Enable **2-Step Verification** if not already enabled
4. After enabling 2FA, scroll down and find **App passwords**
5. Select **Mail** and **Windows Computer** (or your device)
6. Generate the app password
7. **Copy the 16-character password** provided

### Step 2: Set Firebase Functions Config

Run this command in your terminal:

```bash
firebase functions:config:set email.user="navalok2025@gmail.com" email.password="your-16-char-app-password"
```

Replace `your-16-char-app-password` with the password you generated in Step 1.

### Step 3: Verify Configuration

Deploy the functions again to apply the configuration:

```bash
firebase deploy --only functions
```

## Email Template Format

Each email includes:

### **Email Header**
- "Order Confirmed" with gradient background
- Company name: Navalok Fresh Farm

### **Order Summary Section**
- Order ID
- Order Date & Time
- Status (with green badge)

### **Product Details Section**
- Product Name
- Quantity and Unit

### **Payment Details Section**
- Payment Method
- **Total Amount** (highlighted in purple)

### **Customer Information**
- Customer Email

### **Seller Information**
- Seller Name
- Seller Email

### **PDF Attachment**
- Professional invoice PDF with all details
- Filename: `Order_Invoice_{OrderID}.pdf`

## Email Recipients

1. **Customer Email**: The person who placed the order receives their invoice
2. **Seller Email**: The product owner gets notified of the new order
3. **Admin Email**: navalok2025@gmail.com receives all orders for monitoring

## Testing

To test the email system:

1. Initiate a payment in the app
2. Check the Expo logs for the function execution
3. Verify emails are received in all three email addresses

## Troubleshooting

### Error: `auth/invalid-email-password`
- Make sure you're using the **App Password** (16 characters), not your regular Gmail password
- Verify 2-Step Verification is enabled

### Emails not sending
- Check the Firebase Functions logs for errors
- Verify the email configuration is set correctly: `firebase functions:config:get`
- Make sure the email account is not blocking third-party app access

### Configuration issues
- To view current config: `firebase functions:config:get`
- To update config: `firebase functions:config:set email.password="new-password"`

## Email Output Example

```
From: navalok2025@gmail.com
To: customer@example.com, seller@example.com, navalok2025@gmail.com
Subject: Order Confirmation #ORDER123 - Navalok Fresh Farm

[Beautiful HTML Email with all order details]
[PDF Attachment: Order_Invoice_ORDER123.pdf]
```

## Customization

To modify the email format, edit the `generateEmailHTML()` function in `functions/src/index.ts`.

Current styling includes:
- Gradient purple header
- Clean white design
- Color-coded sections
- Highlight for total amount
- Professional layout

---

**Once setup is complete, customers will automatically receive invoice emails after completing their Khalti payment!**
