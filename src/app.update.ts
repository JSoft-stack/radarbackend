import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Hears, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf, Markup } from 'telegraf';
import { actionButtons } from './app.buttons';
import { message } from 'telegraf/filters';

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {
    // централизованный обработчик location-сообщений
    this.bot.on('location', async (ctx) => {
      await this.handleLocation(ctx);
    });
  }

  private async handleLocation(ctx: Context) {
    if (!ctx.message) return;
    // Narrow message type: ensure it contains location
    if (!('location' in ctx.message)) return;

    // TS still may need a cast after narrowing; keep it explicit and typed
    const loc = (ctx.message as { location: { latitude: number; longitude: number } }).location;
    const lat = loc.latitude;
    const lon = loc.longitude;
    const userId = ctx.from?.id ?? null;
    const firstName = ctx.from?.first_name ?? null;
    const lastName = ctx.from?.last_name ?? null;


    const lastActive = new Date();

    try {
      if (userId) {
        await ctx.reply(
          `✅ Location saved\n${firstName ?? ''} ${lastName ?? ''}\nID: ${userId}\nLat: ${lat}\nLon: ${lon}\nTime: ${lastActive.toISOString()}`,
        );

        await this.appService.savelocation(
          String(userId),
          String(lat),
          String(lon),
          lastActive.toISOString(),
        );

      } else {
        await ctx.reply(`📍 Location received\nLat: ${lat}\nLon: ${lon}\n(Not saved — no user id)`);
      }
    } catch (err) {
      console.error('saveLocation error', err);
      await ctx.reply('❗ Failed to save location.');
    }
  }

  @Start()
  async startCommand(ctx: Context) {
    const userFirstName = ctx.from?.first_name ?? 'there';

    const existingUser = await this.appService.getById(String(ctx.from?.id ?? ''));
    if (!existingUser) {

      const data = await this.appService.create({
        user_id: String(ctx.from?.id ?? ''),
        first_name: ctx.from?.first_name ?? '',
        last_name: ctx.from?.last_name ?? '',
        lat: '',
        lon: '',
        last_active_time: '',
        hide: false,
      });
      // return;
    }
    else {
      await ctx.reply(`Welcome back, ${userFirstName}!`, actionButtons());
    }


    const webAppUrl = `https://myviteapp.loca.lt/`;

    await ctx.reply(
      `Assalomu alaykum, ${userFirstName}! Please share your location.`,
      {
        reply_markup: {
          keyboard: [
            [{ text: '📍 Send Location', request_location: true }],
            [{ text: 'Run MiniApp', web_app: { url: webAppUrl } }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      },
    );
  }
}
