import type { ContactFormSubmission } from "@prisma/client";
import type { ActionFunction, LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import type { GitHubProfile } from "remix-auth-github";
import { auth } from "~/auth.server";
import { prisma } from "~/db.server";
import styles from './dashboard.css';

export const meta: MetaFunction = () => ({
  title: 'Dashboard – Nathan Knowler',
});

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: styles},
];

interface LoaderData {
  name: GitHubProfile['displayName'];
  contactFormSubmissions: ContactFormSubmission[];
};

export const loader: LoaderFunction = async ({request}) => {
  const {profile} = await auth.isAuthenticated(request, {
    failureRedirect: '/',
  });

  const contactFormSubmissions = await prisma.contactFormSubmission.findMany({
    take: 10,
  });

  return json<LoaderData>({
    name: profile.displayName,
    contactFormSubmissions,
  });
}

export const action: ActionFunction = async ({request}) => {
  const form = await request.formData();

  switch (form.get('_action')) {
    case 'delete': {
      await prisma.contactFormSubmission.delete({
        where: {
          id: form.get('submissionId') as string,
        }
      });
      return json({success: true});
    }
    case 'toggleSpam': {
      await prisma.contactFormSubmission.update({
        where: {
          id: form.get('submissionId') as string,
        },
        data: {
          isSpam: !(form.get('isSpam') === 'true'),
        },
      })
      return json({success: true});
    }
    default: {
      throw new Error('wtf are you trying to do.');
    }
  }
};

export default function Dashboard() {
  const {name, contactFormSubmissions} = useLoaderData<LoaderData>();

  return (
    <main>
      <h1>Welcome to the dashboard, {name}!</h1>
      <table>
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
        {contactFormSubmissions.map(submission => (
          <tr key={submission.id}>
            <td>{submission.subject}</td>
            <td>{submission.name}</td>
            <td>{submission.email}</td>
            <td>{submission.message}</td>
            <td>
              <div>
                {submission.isSpam ? 'Yes' : 'No'}
                <Form method="patch">
                  <input type="hidden" name="_action" value="toggleSpam" />
                  <input type="hidden" name="isSpam" value={String(submission.isSpam)} />
                  <input type="hidden" name="submissionId" value={submission.id} />
                  <button>{submission.isSpam ? 'Not Spam' : 'Spam'}</button>
                </Form>
              </div>
            </td>
            <td>{new Date(submission.createdAt).toLocaleString()}</td>
            <td>{new Date(submission.updatedAt).toLocaleString()}</td>
            <td>
              <Form method="delete">
                <input type="hidden" name="_action" value="delete" />
                <input type="hidden" name="submissionId" value={submission.id} />
                <button>Delete</button>
              </Form>
            </td>
          </tr>
        ))}
      </table>
    </main>
  );
}
