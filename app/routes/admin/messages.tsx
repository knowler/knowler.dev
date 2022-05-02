import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { ActionFunction , LinksFunction, LoaderFunction } from "@remix-run/node";
import { prisma } from "~/db.server";
import type { ContactFormSubmission } from "@prisma/client";
import styles from "./messages.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  switch (form.get("_action")) {
    case "delete": {
      await prisma.contactFormSubmission.delete({
        where: {
          id: form.get("submissionId") as string,
        },
      });
      return json({ success: true });
    }
    case "toggleSpam": {
      await prisma.contactFormSubmission.update({
        where: {
          id: form.get("submissionId") as string,
        },
        data: {
          isSpam: !(form.get("isSpam") === "true"),
        },
      });
      return json({ success: true });
    }
    default: {
      throw new Error("wtf are you trying to do.");
    }
  }
};

export interface LoaderData {
  contactFormSubmissions: ContactFormSubmission[];
}

export const loader: LoaderFunction = async () =>
  json<LoaderData>({
    contactFormSubmissions: await prisma.contactFormSubmission.findMany({
      take: 10,
    }),
  });

export default function Messages() {
  const { contactFormSubmissions } = useLoaderData<LoaderData>();

  return (
    <main className="messages">
      <h1>Messages</h1>
      <ol reversed role="list" className="_list message-list">
        {contactFormSubmissions.map(submission => (
          <li key={submission.id} className="_item message-list-item">
            <NavLink to={submission.id}>
              <span className="_sender">{submission.name}</span>
              <time className="_sent-at" suppressHydrationWarning>{new Date(submission.createdAt).toLocaleDateString()}</time>
              <span className="_subject">{submission.subject}</span>
              <span className="_preview">{submission.message}</span>
            </NavLink>
          </li>
        ))}
      </ol>
      <Outlet />
    </main>
  );
}
