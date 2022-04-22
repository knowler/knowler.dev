import type { ActionFunction, LinksFunction, LoaderFunction, MetaFunction} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useTransition } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { getFormData } from "remix-params-helper";
import { AuthenticityTokenInput, verifyAuthenticityToken } from "remix-utils";
import invariant from "tiny-invariant";
import { z } from "zod";
import mail, { verifyEmail } from "~/mail.server";
import { getSession } from "~/session.server";
import styles from "./contact.css";

invariant(process.env.CONTACT_FORM_TO, 'CONTACT_FORM_TO must be set');
invariant(process.env.CONTACT_FORM_FROM, 'CONTACT_FORM_FROM must be set');

export const meta: MetaFunction = () => ({
  title: "Contact – Nathan Knowler",
});

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const action: ActionFunction = async ({ request }) => {
  // Verify CSRF (throws)
  await verifyAuthenticityToken(
    request,
    await getSession(request.headers.get("Cookie"))
  );

  // Validate
  const result = await getFormData(request, z.object({
    name: z.string().optional(),
    email: z.string().email(),
    subject: z.string(),
    message: z.string(),
  }));

  // Validation failed
  if (!result.success) return json(result, 400);

  // Verify email
  const emailVerified = await verifyEmail(result.data.email);

  // Email verification failed
  if (!emailVerified) return json(result, 400);

  // Send email (throws)
  await mail.send({
    to: process.env.CONTACT_FORM_TO as string,
    from: process.env.CONTACT_FORM_FROM as string,
    replyTo: result.data.email,
    subject: result.data.subject,
    text: `Message from ${result.data?.name ?? "Anonymous"}:\n\n${result.data.message}`,
  });

  // Success
  return json(result);
};

export const loader: LoaderFunction = async () => json({
  fallbackEmail: process.env.CONTACT_FORM_FROM,
});

// @ts-ignore
const lister = new Intl.ListFormat('en', {style: 'long', type: 'conjunction'});

export default function Contact() {
  const {fallbackEmail} = useLoaderData();
  const actionData = useActionData();
  const transition = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData?.success) formRef.current?.reset();
  }, [actionData]);

  return (
    <Form ref={formRef} className="contact-form" method="post">
      <AuthenticityTokenInput />
      <h1>Contact me</h1>
      <p>Feel free to use this form if you’d like to get in touch.</p>
      <div className="form-field">
        <div className="field-info">
          <label htmlFor="name">Name</label> (optional)
        </div>
        <input
          type="text"
          name="name"
          id="name"
          aria-invalid={Boolean(actionData?.errors?.name)}
          aria-describedby={actionData?.errors?.name ? 'name-error' : undefined}
        />
        {actionData?.errors?.name ? <p id="name-error" className="field-error">{actionData.errors.name}</p> : null}
      </div>
      <div className="form-field">
        <div className="field-info">
          <label htmlFor="email">Email</label> (required)
        </div>
        <input
          type="email"
          name="email"
          id="email"
          required
          aria-invalid={Boolean(actionData?.errors?.email)}
          aria-describedby={actionData?.errors?.email ? 'email-error' : undefined}
        />
        {actionData?.errors?.email ? <p id="email-error" className="field-error">{actionData.errors.email}</p> : null}
      </div>
      <div className="form-field">
        <div className="field-info">
          <label htmlFor="subject">Subject</label> (required)
        </div>
        <input
          type="text"
          name="subject"
          id="subject"
          required
          aria-invalid={Boolean(actionData?.errors?.subject)}
          aria-describedby={actionData?.errors?.subject ? 'subject-error' : undefined}
        />
        {actionData?.errors?.subject ? <p id="subject-error" className="field-error">{actionData.errors.subject}</p> : null}
      </div>

      <div className="form-field">
        <div className="field-info">
          <label htmlFor="message">Message</label> (required)
        </div>
        <textarea
          name="message"
          id="message"
          required
          aria-invalid={Boolean(actionData?.errors?.message)}
          aria-describedby={actionData?.errors?.message ? 'message-error' : undefined}
        />
        {actionData?.errors?.message ? <p id="message-error" className="field-error">{actionData.errors.message}</p> : null}
      </div>
      <p className="privacy-disclosure">
        Sending a message with this form will verify your email using{" "}
        <a href="https://verifier.meetchopra.com/">a service</a> to help me
        filter out potential spam. If you are not comfortable with that, you can send an email to{" "}
        <a href={`mailto:${fallbackEmail}`}>{fallbackEmail}</a>{" "}
        (this is not my actual email, so don’t go adding it to your address book or anything).
      </p>
      <div className="submission-controls">
        <button type="submit" className="send-message" disabled={transition.state === "submitting"}>
          Send message
        </button>
      </div>
      {actionData?.success === false ? 
        <div role="alert" className="field-error">
          The following fields are invalid: {lister.format(Object.keys(actionData.errors))}. Please fix the issues and try again.
        </div> 
        : null
      }
      {actionData?.success ? <output className="formStatus">Message sent!</output> : null}
    </Form>
  );
}

export function CatchBoundary() {
  return (
    <>
      <h1>Oops, there was an internal error.</h1>
      <p>I’m looking into it.</p>
    </>
  );
}
