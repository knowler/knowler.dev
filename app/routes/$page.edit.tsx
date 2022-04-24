import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { octokit } from "~/octokit.server";
import parseFrontMatter from "front-matter";
import styles from "./edit.css";
import { getFormData } from "remix-params-helper";
import { z } from "zod";
import { auth } from "~/auth.server";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

const updatePageMutation = `
  mutation updatePage(
    $expectedHeadOid: GitObjectID!,
    $contents: Base64String!,
    $pagePath: String!,
    $commitSubject: String!
  ) {
    createCommitOnBranch(input: {
      branch: {
        repositoryNameWithOwner: "knowler/knowlerkno.ws",
        branchName: "main"
      },
      expectedHeadOid: $expectedHeadOid,
      fileChanges: {
        additions: [
          {
            path: $pagePath,
            contents: $contents
          }
        ]
      },
      message: {
        headline: $commitSubject
      }
    }) {
      commit {
        id
      }
    }
  }
`;

export const action: ActionFunction = async ({ params, request }) => {
  await auth.isAuthenticated(request, {
    failureRedirect: `/login?returnTo=/${params.page}/edit`,
  });

  const result = await getFormData(
    request,
    z.object({
      title: z.string(),
      description: z.string().optional(),
      body: z.string(),
      expectedHeadOid: z.string(),
    })
  );

  if (!result.success) return json(result, 400);

  await octokit.graphql(updatePageMutation, {
    contents: Buffer.from(
      `---\ntitle: ${result.data.title}\ndescription: ${result.data?.description}\n---\n${result.data.body}`,
      "utf-8"
    ).toString("base64"),
    expectedHeadOid: result.data.expectedHeadOid,
    pagePath: `content/pages/${params.page}.md`,
    commitSubject: `Update ${result.data.title} page`,
  });

  return json({ success: true });
};

const pageWithHeadOidQuery = `
  query page($expression: String!) {
    repository(name: "knowlerkno.ws", owner: "knowler") {
      object(expression: $expression) {
        ... on Blob {
          text
        }
        repository {
          object(expression: "HEAD") {
            oid
          }
        }
      }
    }
  }
`;

export const loader: LoaderFunction = async ({ params, request }) => {
  await auth.isAuthenticated(request, {
    failureRedirect: `/login?returnTo=/${params.page}/edit`,
  });

  const { repository } = await octokit.graphql(pageWithHeadOidQuery, {
    expression: `HEAD:content/pages/${params.page}.md`,
  });

  const markdown = repository.object.text;
  const expectedHeadOid = repository.object.repository.object.oid;

  const { attributes, body } = parseFrontMatter(markdown);

  return json({
    attributes,
    body,
    expectedHeadOid,
  });
};

export default function PageEdit() {
  const { attributes, body, expectedHeadOid } = useLoaderData();

  return (
    <main>
      <Form method="patch">
        <h1>Editing “{attributes.title}”</h1>
        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={attributes.title}
          />
        </div>
        <div className="form-field">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            defaultValue={attributes.description}
          />
        </div>
        <div>
          <label htmlFor="body">Content</label>
          <textarea id="body" name="body" required defaultValue={body} />
        </div>
        <input
          type="hidden"
          name="expectedHeadOid"
          defaultValue={expectedHeadOid}
        />
        <button type="submit">Save</button>
      </Form>
    </main>
  );
}
