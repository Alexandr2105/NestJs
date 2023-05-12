import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as ngrok from 'ngrok';
import { settings } from '../../settings';

@Injectable()
export class TelegramAdapter {
  private axiosInstance: AxiosInstance;
  constructor() {
    const token = settings.TELEGRAM_TOKEN;
    this.axiosInstance = axios.create({
      baseURL: `https://api.telegram.org/bot${token}/`,
    });
  }

  async sendMessage(text: string, chatId: number) {
    await this.axiosInstance.post(`sendMessage`, {
      chat_id: chatId,
      text: text,
    });
  }

  async sendOurHookForTelegram(url: string) {
    await this.axiosInstance.post(`setWebhook`, {
      url,
    });
  }

  async connectToNgrok() {
    return await ngrok.connect(3000);
  }
}
