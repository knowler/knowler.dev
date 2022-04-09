import {
  ActionFunction,
  json,
  LinksFunction,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import { z } from "zod";
import mail from "~/mail.server";
import styles from "./contact.css";

export const meta: MetaFunction = () => ({
  title: "Contact – Nathan Knowler",
});

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const action: ActionFunction = async ({ request }) => {
  const ContactFormSchema = z.object({
    name: z.string().optional(),
    email: z
      .string()
      .email()
      .refine(
        async (email) => {
          const verifierEndpoint = new URL(
            email,
            "https://verifier.meetchopra.com/verify/"
          );
          verifierEndpoint.searchParams.set(
            "token",
            process.env.VERIFIER_API_KEY as string
          );
          const response = await fetch(verifierEndpoint.toString());
          const verifierResult = await response.json();
          console.log(verifierResult);
          return verifierResult.status;
        },
        {
          message: "Email address failed verification.",
        }
      ),
    // TODO: maybe filter spam in the future as well.
    subject: z.string(),
    message: z.string(),
  });

  const { name, email, subject, message } = await ContactFormSchema.parseAsync(
    Object.fromEntries(await request.formData())
  );

  await mail.send({
    to: process.env.CONTACT_FORM_TO as string,
    from: process.env.CONTACT_FORM_FROM as string,
    replyTo: email,
    subject,
    text: `
    Message from ${name || "Anonymous"}:

    ${message}
    `.trim(),
  });
  return json({ success: true });
};

export default function Contact() {
  const action = useActionData();
  const transition = useTransition();

  if (transition.submission || action?.success) {
    return (
      <p>
        Message sent! <Link to=".">Send another message?</Link> (Please, no
        spam.)
      </p>
    );
  }

  return (
    <Form className="contact-form" method="post">
      <h1>Contact me</h1>
      <p>Feel free to use this form if you’d like to get in touch.</p>
      <div className="form-field">
        <div className="field-info">
          <label htmlFor="name">Name</label> (optional)
        </div>
        <input type="text" name="name" id="name" />
      </div>

      <div className="form-field">
        <div className="field-info">
          <label htmlFor="email">Email</label> (required)
        </div>
        <input type="email" name="email" id="email" required />
      </div>

      <div className="form-field">
        <div className="field-info">
          <label htmlFor="subject">Subject</label> (required)
        </div>
        <input type="text" name="subject" id="subject" required />
      </div>

      <div className="form-field">
        <div className="field-info">
          <label htmlFor="message">Message</label> (required)
        </div>
        <textarea name="message" id="message" />
      </div>
      <p className="privacy-disclosure">
        Sending a message with this form will verify your email using{" "}
        <a href="https://verifier.meetchopra.com/">a service</a> to help me
        filter out potential spam. If you are not comfortable with that, you can
        send an email to{" "}
        <a href="mailto:contact@knowlerkno.ws">contact@knowlerkno.ws</a> (this
        is not my actual email, so don’t go adding it to your address book or
        anything).
      </p>
      <div className="submission-controls">
        <button type="submit" className="send-message">
          Send message
        </button>
      </div>
    </Form>
  );
}
