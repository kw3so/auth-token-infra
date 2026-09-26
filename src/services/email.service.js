import * as ConfigEnv from "../config/config.env.js";
import { Resend } from "resend";

const resend = new Resend(ConfigEnv.RESEND_KEY);

export const emailService = async ({ receiver, message }) => {
  const { data, error } = await resend.emails.send({
    from: "User support <support@chanzo.fyi>",
    to: receiver,
    subject: "Reset password request",
    html: `
    <p>Did you request a password reset? See below, else contact support.</p>

    <p>${message}</p>
    `,
  });

  return { data, error };
};
