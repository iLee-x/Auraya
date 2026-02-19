import { Consumer } from 'kafkajs';
import { config } from '../config';
import { sendMail } from '../utils/email';
import { kafka, EMAIL_TOPIC, OrderConfirmationJobData } from './emailQueue';

let consumer: Consumer | null = null;

const buildItemsTable = (
  data: OrderConfirmationJobData
): string => {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.productName}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${Number(item.productPrice).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  return `
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#f5f5f5">
          <th style="padding:8px;text-align:left">Product</th>
          <th style="padding:8px;text-align:center">Qty</th>
          <th style="padding:8px;text-align:right">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:8px;text-align:right;font-weight:bold">Total</td>
          <td style="padding:8px;text-align:right;font-weight:bold">$${Number(data.totalAmount).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>`;
};

const buildAddressBlock = (addr: Record<string, string>): string => {
  return `
    <p>
      ${addr.recipientName || ''}<br/>
      ${addr.addressLine1 || ''}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}<br/>
      ${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}<br/>
      ${addr.country || ''}
    </p>`;
};

const buildOrderConfirmationHtml = (
  data: OrderConfirmationJobData
): string => {
  const addr = data.shippingAddress as Record<string, string>;

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2>Order Confirmation</h2>
      <p>Hi ${data.customerName || 'Customer'},</p>
      <p>Thank you for your order! Here are your order details:</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      ${buildItemsTable(data)}
      <h3>Shipping Address</h3>
      ${buildAddressBlock(addr)}
    </div>
  `;
};

const buildAdminOrderNotificationHtml = (
  data: OrderConfirmationJobData
): string => {
  const addr = data.shippingAddress as Record<string, string>;

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2>New Order Received</h2>
      <p>A new order has been placed.</p>
      <p><strong>Customer:</strong> ${data.customerName || 'N/A'} (${data.email})</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      ${buildItemsTable(data)}
      <h3>Shipping Address</h3>
      ${buildAddressBlock(addr)}
    </div>
  `;
};

export const startEmailWorker = async (): Promise<void> => {
  consumer = kafka.consumer({ groupId: 'email-worker' });
  await consumer.connect();
  await consumer.subscribe({ topic: EMAIL_TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const data: OrderConfirmationJobData = JSON.parse(
          message.value!.toString()
        );

        // Send confirmation to customer
        const customerHtml = buildOrderConfirmationHtml(data);
        await sendMail(
          data.email,
          `Order Confirmation - ${data.orderId}`,
          customerHtml
        );

        // Send notification to admin
        if (config.ses.adminEmail) {
          const adminHtml = buildAdminOrderNotificationHtml(data);
          await sendMail(
            config.ses.adminEmail,
            `New Order - ${data.orderId}`,
            adminHtml
          );
        }

        console.log(
          `Order emails processed for order ${data.orderId}`
        );
      } catch (err) {
        console.error(
          'Failed to process order confirmation email:',
          err instanceof Error ? err.message : err
        );
      }
    },
  });

  console.log('Email worker started (Kafka consumer)');
};

export const closeEmailWorker = async (): Promise<void> => {
  if (consumer) {
    await consumer.disconnect();
    consumer = null;
  }
};
