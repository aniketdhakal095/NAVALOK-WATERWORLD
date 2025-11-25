const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sendGridMail = require('@sendgrid/mail');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Set SendGrid API key
sendGridMail.setApiKey('YOUR_SENDGRID_API_KEY');

exports.sendInvoiceEmail = functions.firestore
    .document('orders/{orderId}')
    .onUpdate((change, context) => {
        const order = change.after.data();

        if (order.paymentStatus === 'successful') {
            const { customerEmail, customerName, orderId, amount, transactionId } = order;

            // Create the email content
            const emailContent = `
                <h3>Dear ${customerName},</h3>
                <p>Thank you for your purchase!</p>
                <p>Here are the details of your order:</p>
                <ul>
                    <li><strong>Order ID:</strong> ${orderId}</li>
                    <li><strong>Amount Paid:</strong> NPR ${amount}</li>
                    <li><strong>Transaction ID:</strong> ${transactionId}</li>
                    <li><strong>Payment Status:</strong> Successful</li>
                </ul>
                <p>If you have any questions, feel free to reach out to us.</p>
                <p>Thank you for using Khalti!</p>
            `;

            const msg = {
                to: customerEmail, // Customer's email
                from: 'your-email@example.com', // Your sending email
                subject: `Your Khalti Invoice for Order #${orderId}`,
                html: emailContent, // Email body as HTML
            };

            return sendGridMail.send(msg)
                .then(response => {
                    console.log('Invoice email sent successfully.');
                    return null; // Return null to indicate the function is done
                })
                .catch(error => {
                    console.error('Error sending invoice email:', error);
                    throw new functions.https.HttpsError('internal', 'Failed to send invoice email', error);
                });
        }

        return null;
    });
