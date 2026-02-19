import { Kafka, Producer } from 'kafkajs';
import { config } from '../config';

export const EMAIL_TOPIC = 'email.order-confirmation';

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
});

let producer: Producer | null = null;

export const connectProducer = async (): Promise<void> => {
  producer = kafka.producer();
  await producer.connect();
  console.log('Kafka producer connected');
};

export const disconnectProducer = async (): Promise<void> => {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
};

export { kafka };

export interface OrderConfirmationJobData {
  orderId: string;
  email: string;
  customerName: string;
  items: Array<{
    productName: string;
    quantity: number;
    productPrice: number;
  }>;
  totalAmount: number;
  shippingAddress: Record<string, unknown>;
}

export const addOrderConfirmationJob = (
  data: OrderConfirmationJobData
): void => {
  if (!producer) {
    console.error('Kafka producer not connected, skipping email job');
    return;
  }

  producer
    .send({
      topic: EMAIL_TOPIC,
      messages: [
        {
          key: data.orderId,
          value: JSON.stringify(data),
        },
      ],
    })
    .catch((err) => {
      console.error('Failed to produce order confirmation message:', err.message);
    });
};
