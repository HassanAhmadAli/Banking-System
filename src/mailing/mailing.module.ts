import { Keys } from "@/common/const";
import { env } from "@/common/env";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { MailingConsumer } from "./mailing.consumer";
import { CommonModule } from "@/common/common.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EnvVariables } from "@/common/schema/env";

@Module({
  providers: [MailingConsumer],
  exports: [MailingConsumer, BullModule],
  imports: [
    CommonModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService<EnvVariables>) {
        return {
          transport: {
            host: configService.get("APP_EMAIL_HOST", { infer: true }),
            auth: {
              user: configService.get("APP_EMAIL_User", { infer: true }),
              pass: configService.get("APP_EMAIL_Password", { infer: true }),
            },
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: Keys.MailingConsumer,
      connection: {
        url: env!.REDIS_DATABASE_URL,
      },
    }),
  ],
})
export class AppMailingModule {}
