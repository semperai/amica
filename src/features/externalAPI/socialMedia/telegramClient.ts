import { config } from '@/utils/config';
import { Telegraf } from 'telegraf';

class TelegramClient {
  private bot: Telegraf;

  constructor() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN as string;

    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined in the environment variables');
    }

    // Initialize the Telegraf bot with the bot token
    this.bot = new Telegraf(botToken);
  }

  // Method to send a message to a specific chat
  public async postMessage(content: string): Promise<void> {
    const chatId = process.env.TELEGRAM_CHAT_ID as string;
    try {
      await this.bot.telegram.sendMessage(chatId, content);
      console.log('Message posted successfully');
    } catch (error) {
      console.error('Error posting message to Telegram:', error);
    }
  }

  public getBotInstance(): Telegraf {
    return this.bot;
  }
}

// Export an instance of the TelegramClient class for use
export const telegramClientInstance = new TelegramClient();

