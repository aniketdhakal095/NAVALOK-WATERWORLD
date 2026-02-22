import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import PDFDocument from 'pdfkit'
import nodemailer from 'nodemailer'
import streamBuffers from 'stream-buffers'

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '10mb' }))

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001

function generateOrderPDFBuffer(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 })
      const bufferStream = new streamBuffers.WritableStreamBuffer()

      doc.pipe(bufferStream)

      doc.fontSize(20).text('Invoice', { align: 'center' })
      doc.moveDown()

      const meta = [
        { label: 'Order ID', value: order.orderId || '' },
        { label: 'Order Date', value: order.orderDate || '' },
        { label: 'Payment Method', value: order.paymentMethod || '' },
        { label: 'Status', value: order.status || '' },
      ]

      meta.forEach((m) => {
        doc.fontSize(10).text(`${m.label}: ${m.value}`)
      })

      doc.moveDown()

      const customer = order.customer || {}
      doc.fontSize(12).text('Customer:', { underline: true })
      doc.fontSize(10).text(`${customer.name || ''}`)
      doc.text(`${customer.email || ''}`)
      doc.moveDown()

      doc.fontSize(12).text('Items:', { underline: true })

      const items = order.items || []
      items.forEach((it: any, idx: number) => {
        doc.fontSize(10).text(`${idx + 1}. ${it.title} x${it.quantity} — ${it.price}`)
      })

      doc.moveDown()
      doc.fontSize(12).text(`Total: ${order.totalPrice || ''}`)

      doc.end()

      bufferStream.on('finish', () => {
        const buffer = bufferStream.getContents() as Buffer
        resolve(buffer)
      })
    } catch (err) {
      reject(err)
    }
  })
}

async function sendInvoiceEmail(options: {
  to: string[]
  subject: string
  text?: string
  html?: string
  attachmentBuffer: Buffer
  attachmentName: string
}) {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD
  if (!user || !pass) throw new Error('EMAIL_USER and EMAIL_PASSWORD must be set in env')

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })

  const msg = {
    from: user,
    to: options.to.join(','),
    subject: options.subject,
    text: options.text || '',
    html: options.html,
    attachments: [
      {
        filename: options.attachmentName,
        content: options.attachmentBuffer,
      },
    ],
  }

  return transporter.sendMail(msg)
}

app.get('/health', (_req, res) => res.json({ ok: true }))

app.get('/api/test', (_req, res) => {
  res.json({ ok: true, message: 'Webhook server alive' })
})

// Endpoint to receive invoice data and send emails with a PDF invoice
app.post('/api/send-invoice', async (req, res) => {
  try {
    const body = req.body
    // expected shape: { orderId, orderDate, paymentMethod, status, customer: { name, email }, items: [{title, quantity, price}], totalPrice, ownerEmail }

    if (!body || !body.customer || !body.items) {
      return res.status(400).json({ error: 'Invalid payload. customer and items required.' })
    }

    const pdfBuffer = await generateOrderPDFBuffer(body)

    const recipients = new Set<string>()
    if (body.customer?.email) recipients.add(body.customer.email)
    if (body.ownerEmail) recipients.add(body.ownerEmail)
    if (process.env.ADMIN_EMAIL) recipients.add(process.env.ADMIN_EMAIL)

    const to = Array.from(recipients)
    if (to.length === 0) return res.status(400).json({ error: 'No recipient emails provided.' })

    await sendInvoiceEmail({
      to,
      subject: `Invoice for Order ${body.orderId || ''}`,
      text: `Attached invoice for order ${body.orderId || ''}`,
      html: `<p>Attached invoice for order <strong>${body.orderId || ''}</strong></p>`,
      attachmentBuffer: pdfBuffer,
      attachmentName: `invoice-${body.orderId || 'order'}.pdf`,
    })

    res.json({ ok: true, sentTo: to })
  } catch (err: any) {
    console.error('send-invoice error:', err)
    res.status(500).json({ error: err.message || 'server error' })
  }
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Webhook server listening on http://localhost:${PORT}`)
})

export default app
