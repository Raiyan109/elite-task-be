import nodemailer from 'nodemailer';
import config from '../config';
import { ISendEmail } from '../types/email';


const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port),
    secure: false,
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendEmail = async (values: ISendEmail) => {
    try {
        const info = await transporter.sendMail({
            from: `"Probashi Sheba" ${config.email.from}`,
            to: values.to,
            subject: values.subject,
            html: values.html,
        });

    } catch (error) {
        console.log('Email', error);
    }
};

export const emailHelper = {
    sendEmail,
};