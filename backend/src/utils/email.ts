import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { config, isDev } from '../config';

const sesClient = new SESClient({
  region: config.ses.region,
  credentials: {
    accessKeyId: config.ses.accessKeyId,
    secretAccessKey: config.ses.secretAccessKey,
  },
});

export const sendMail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  if (!config.ses.accessKeyId || !config.ses.secretAccessKey) {
    if (isDev) {
      console.log('--- DEV EMAIL (no AWS SES credentials) ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(html);
      console.log('--- END DEV EMAIL ---');
    }
    return;
  }

  const command = new SendEmailCommand({
    Source: config.ses.from,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: html },
      },
    },
  });

  await sesClient.send(command);
};
