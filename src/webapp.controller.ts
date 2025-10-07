import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('webapp')
export class WebAppController {
  constructor(private readonly appService: AppService) {}

  @Post('launch')
  @HttpCode(HttpStatus.OK)
  async launch(
    @Body()
    body: {
      chat_id?: number | string;
      lat?: number | string;
      lon?: number | string;
      first_name?: string;
      last_name?: string;
    },
  ) {
    const chatId = body.chat_id ?? body.first_name ? String(body.chat_id ?? '') : '';
    if (!chatId || body.lat == null || body.lon == null) {
      return { ok: false, error: 'invalid payload' };
    }

    const lat = Number(body.lat);
    const lon = Number(body.lon);
    const lastActive = new Date().toISOString();

    // Использует существующий метод savelocation в AppService
    await this.appService.savelocation(String(chatId), String(lat), String(lon), lastActive);

    return { ok: true };
  }
}