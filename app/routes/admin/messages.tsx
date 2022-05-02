import { Form, useLoaderData } from "@remix-run/react";
import { json, LinksFunction, LoaderFunction } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { prisma } from "~/db.server";
import { ContactFormSubmission } from "@prisma/client";
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

interface LoaderData {
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
    <>
      <h1>Messages</h1>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Spam</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {contactFormSubmissions.map((submission) => (
            <tr key={submission.id}>
              <td>{submission.subject}</td>
              <td>{submission.name}</td>
              <td>{submission.email}</td>
              <td>{submission.message}</td>
              <td>
                <div>
                  {submission.isSpam ? "Yes" : "No"}
                  <Form method="patch">
                    <input type="hidden" name="_action" value="toggleSpam" />
                    <input
                      type="hidden"
                      name="isSpam"
                      value={String(submission.isSpam)}
                    />
                    <input
                      type="hidden"
                      name="submissionId"
                      value={submission.id}
                    />
                    <button>{submission.isSpam ? "Not Spam" : "Spam"}</button>
                  </Form>
                </div>
              </td>
              <td>{submission.createdAt}</td>
              <td>{submission.updatedAt}</td>
              <td>
                <Form method="delete">
                  <input type="hidden" name="_action" value="delete" />
                  <input
                    type="hidden"
                    name="submissionId"
                    value={submission.id}
                  />
                  <button>Delete</button>
                </Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
