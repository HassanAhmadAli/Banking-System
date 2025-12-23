import { Keys } from "@/common/const";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { MailData } from "./interface/mail-data.interface";
import { logger } from "@/utils";
import { MailerService } from "@nestjs-modules/mailer";

@Processor(Keys.MailingConsumer)
export class MailingConsumer extends WorkerHost {
  constructor(private readonly mailingService: MailerService) {
    logger.info("MailingConsumer initialized");
    super();
  }
  override async process(job: Job<MailData>, _token?: string) {
    logger.info({ data: job.data }, "Mailing job received:");
    await this.mailingService.sendMail({
      to: job.data.to,
      subject: job.data.title,
      text: job.data.content,
    });
  }
}
