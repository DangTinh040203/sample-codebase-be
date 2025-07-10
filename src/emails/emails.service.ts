import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class EmailsService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<SentMessageInfo> {
    const sentMessageInfo: SentMessageInfo = await this.mailerService.sendMail({
      to,
      subject,
      text: body,
    });

    Logger.log(`Email sent to ${to} with subject "${subject}"`, 'EmailService');
    return sentMessageInfo;
  }

  async sendHtmlEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<SentMessageInfo> {
    const sentMessageInfo: SentMessageInfo = await this.mailerService.sendMail({
      to,
      subject,
      html: body,
    });

    Logger.log(`Email sent to ${to} with subject "${subject}"`, 'EmailService');
    return sentMessageInfo;
  }
}
