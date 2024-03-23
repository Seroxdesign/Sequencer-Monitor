import { WebhookClient } from 'discord.js';

export const notifyDiscord = async (message: string): Promise<void> => {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('DISCORD_WEBHOOK_URL not set');
    }
    const webhookClient = new WebhookClient({ url: webhookUrl });
    await webhookClient.send(message);
  } catch (error) {
    console.error('Failed to send notification to Discord:', error);
  }
}