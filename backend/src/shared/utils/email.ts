// src/shared/utils/email.ts
import nodemailer from "nodemailer";

export class EmailService {
    private transporter

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: +process.env.EMAIL_PORT!,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    async sendEmail(to: string, subject: string, html: string) {
        await this.transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html
        });
    };
}