import { config } from '@/utils/config';
import { Telegraf } from 'telegraf';

class TelegramClient {
  private bot: Telegraf;

  constructor() {
    const botToken = config('telegram_bot_token');

    if (!botToken || botToken.trim() === '') {
      throw new Error(`Missing or empty Telegram API Bot Token`);
    }

    this.bot = new Telegraf(botToken);
  }

  public async postMessage(content: string): Promise<any> {
    const chatId = config('telegram_chat_id');
    
    if (!chatId || chatId.trim() === '') {
      throw new Error(`Missing or empty Telegram API Chat ID`);
    }

    try {
      const response = await this.bot.telegram.sendMessage(chatId, content);
      return response;
    } catch (error) {
      return 'Error posting message to Telegram' + error;
    }
  }

  public getBotInstance(): Telegraf {
    return this.bot;
  }
}

let instance: TelegramClient | null = null;

export function getTelegramClient(): TelegramClient {
  if (!instance) {
    instance = new TelegramClient();
  }
  return instance;
}
