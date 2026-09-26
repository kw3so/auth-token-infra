import * as ConfigEnv from "../config/config.env.js";
import { Resend } from "resend";

const resend = new Resend(ConfigEnv.RESEND_KEY);
const appUrl = ConfigEnv.APP_URL

export const emailService = async ({ receiver, resetToken }) => {
  const { data, error } = await resend.emails.send({
    from: "User support <support@chanzo.fyi>",
    to: receiver,
    subject: "Reset password request",
    html: `
    <p>Did you request a password reset? See below, else contact support.</p>

    <a>${appUrl}/api/auth/reset-password?token=${resetToken}</a>
    `,
  });

  return { data, error };
};
