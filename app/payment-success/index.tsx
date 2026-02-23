import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';

type OrderShape = {
  product?: {
    name?: string;
    price?: number;
    quantity?: number;
    measureUnit?: string;
  };
  totalPrice?: number;
  userEmail?: string;
  productOwnerEmail?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  khaltiTransactionId?: string;
  khaltiPidx?: string;
  paidAt?: any;
};

export default function PaymentSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createAndDownloadInvoice();
  }, []);

  const toStringParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value || '';

  const formatDate = (value?: any) => {
    if (!value) return new Date().toLocaleString();
    if (typeof value?.toDate === 'function') return value.toDate().toLocaleString();
    return new Date(value).toLocaleString();
  };

  const getOrderData = async () => {
    const orderId = toStringParam(params.orderId);
    if (!orderId) return { orderId: '', order: null as OrderShape | null };

    const ref = doc(db, 'Orders', orderId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { orderId, order: null as OrderShape | null };

    return { orderId, order: snap.data() as OrderShape };
  };

  const generatePDF = async () => {
    const { orderId, order } = await getOrderData();
    if (!order) throw new Error('Order not found for invoice generation.');

    const productName = order.product?.name || 'Product';
    const unitPrice = Number(order.product?.price || 0);
    const quantity = Number(order.product?.quantity || 1);
    const measureUnit = order.product?.measureUnit || 'unit';
    const total = Number(order.totalPrice || unitPrice * quantity);
    const buyer = order.userEmail || 'N/A';
    const seller = order.productOwnerEmail || 'N/A';
    const paymentMethod = order.paymentMethod || 'Online Payment';
    const paymentStatus = order.paymentStatus || 'Paid';
    const txnId = toStringParam(params.transactionId) || order.khaltiTransactionId || 'N/A';
    const pidx = toStringParam(params.pidx) || order.khaltiPidx || 'N/A';
    const paidDate = formatDate(order.paidAt);
    const invoiceNo = `INV-${orderId.slice(0, 8).toUpperCase()}`;

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 28px; color: #222;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <h1 style="margin:0; color:#0a74da;">Navalok WaterWorld</h1>
              <p style="margin:6px 0 0 0;">Purchase Bill / Tax Invoice</p>
            </div>
            <div style="text-align:right;">
              <p style="margin:0;"><b>Invoice No:</b> ${invoiceNo}</p>
              <p style="margin:4px 0 0 0;"><b>Order ID:</b> ${orderId}</p>
              <p style="margin:4px 0 0 0;"><b>Date:</b> ${paidDate}</p>
            </div>
          </div>

          <hr style="margin:18px 0;" />

          <div style="display:flex; justify-content:space-between;">
            <div>
              <h3 style="margin:0 0 8px 0;">Bill To</h3>
              <p style="margin:0;">${buyer}</p>
            </div>
            <div>
              <h3 style="margin:0 0 8px 0;">Sold By</h3>
              <p style="margin:0;">${seller}</p>
            </div>
          </div>

          <table style="width:100%; border-collapse:collapse; margin-top:20px;">
            <thead>
              <tr style="background:#f4f7fb;">
                <th style="border:1px solid #d9e2ec; padding:10px; text-align:left;">Item</th>
                <th style="border:1px solid #d9e2ec; padding:10px; text-align:right;">Unit Price</th>
                <th style="border:1px solid #d9e2ec; padding:10px; text-align:right;">Qty</th>
                <th style="border:1px solid #d9e2ec; padding:10px; text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border:1px solid #d9e2ec; padding:10px;">${productName}</td>
                <td style="border:1px solid #d9e2ec; padding:10px; text-align:right;">Rs ${unitPrice.toFixed(2)}</td>
                <td style="border:1px solid #d9e2ec; padding:10px; text-align:right;">${quantity} ${measureUnit}</td>
                <td style="border:1px solid #d9e2ec; padding:10px; text-align:right;">Rs ${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top:18px; text-align:right;">
            <p style="font-size:18px; margin:0;"><b>Total Paid: Rs ${total.toFixed(2)}</b></p>
          </div>

          <div style="margin-top:18px; padding:12px; background:#f8fafc; border:1px solid #e6edf5;">
            <p style="margin:0 0 6px 0;"><b>Payment Method:</b> ${paymentMethod}</p>
            <p style="margin:0 0 6px 0;"><b>Payment Status:</b> ${paymentStatus}</p>
            <p style="margin:0 0 6px 0;"><b>Khalti Transaction ID:</b> ${txnId}</p>
            <p style="margin:0;"><b>Khalti PIDX:</b> ${pidx}</p>
          </div>

          <p style="margin-top:22px; font-size:12px; color:#6b7280;">
            This is a system generated invoice.
          </p>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  };

  const createAndDownloadInvoice = async () => {
    try {
      const pdfUri = await generatePDF();

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Download not supported on this device');
        return;
      }

      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Download Bill',
      });
    } catch (error: any) {
      console.log(error);
      Alert.alert('Failed to create bill', error?.message || 'Unknown error');
    } finally {
      setLoading(false);
      router.replace('/(auth)/home');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />
      <View style={styles.card}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#0a74da" />
          <Text style={styles.text}>Preparing your bill...</Text>
        </>
      ) : (
        <Text style={styles.text}>Redirecting...</Text>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f7fb',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  text: {
    marginTop: 8,
    fontFamily: 'outfits-medium',
    color: '#334155',
    fontSize: 15,
  },
  bgTopBlob: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 130,
    backgroundColor: 'rgba(53, 109, 231, 0.18)',
  },
  bgBottomBlob: {
    position: 'absolute',
    bottom: -140,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: 'rgba(22, 167, 111, 0.12)',
  },
});
