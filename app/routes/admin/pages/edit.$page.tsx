import type {
  ActionFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { octokit } from "~/octokit.server";
import parseFrontMatter from "front-matter";
import { getFormData } from "remix-params-helper";
import { z } from "zod";
import { auth } from "~/auth.server";
import { cachePages } from "~/cache.server";

export const handle = { hydrate: true };

const updatePageMutation = `
  mutation updatePage(
    $expectedHeadOid: GitObjectID!,
    $contents: Base64String!,
    $pagePath: String!,
    $commitSubject: String!
  ) {
    createCommitOnBranch(input: {
      branch: {
        repositoryNameWithOwner: "knowler/knowler.dev",
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

// prettier-ignore
const markdownTemplate = ({ title, description, content }: {title: string; description?: string; content: string;}) => 
`---
title: ${title}
description: ${description ?? ""}
---
${content}`;

export const action: ActionFunction = async ({ params, request }) => {
  const { pathname } = new URL(request.url);
  await auth.isAuthenticated(request, {
    failureRedirect: `/login?returnTo=${pathname}`,
  });

  const result = await getFormData(
    request,
    z.object({
      title: z.string(),
      description: z.string().optional(),
      content: z.string(),
      expectedHeadOid: z.string(),
    })
  );

  if (!result.success) return json(result, 400);

  await octokit.graphql(updatePageMutation, {
    contents: Buffer.from(
      markdownTemplate({
        title: result.data.title,
        description: result.data?.description,
        content: result?.data.content,
      }),
      "utf-8"
    ).toString("base64"),
    expectedHeadOid: result.data.expectedHeadOid,
    pagePath: `content/pages/${params.page}.md`,
    commitSubject: `Update ${result.data.title} page`,
  });
  await cachePages();

  return json({ success: true });
};

const pageWithHeadOidQuery = `
  query page($expression: String!) {
    repository(name: "knowler.dev", owner: "knowler") {
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
  const { pathname } = new URL(request.url);
  await auth.isAuthenticated(request, {
    failureRedirect: `/login?returnTo=${pathname}`,
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
  const actionData = useActionData();
  const { attributes, body, expectedHeadOid } = useLoaderData();

  return (
    <Form method="patch" className="edit-form">
      <h1>Editing “{attributes.title}”</h1>
      <div className="_sidebar">
        <form-field>
          <label htmlFor="post-title">Title</label>
          <input
            id="post-title"
            name="title"
            required
            defaultValue={attributes.title}
          />
        </form-field>
        <form-field>
          <label htmlFor="post-description">Description</label>
          <textarea
            id="post-description"
            name="description"
            defaultValue={attributes?.description}
          />
        </form-field>
        <button type="submit">
          {actionData?.success ? "Success!" : "Save"}
        </button>
        <input
          type="hidden"
          name="expectedHeadOid"
          defaultValue={expectedHeadOid}
        />
      </div>
      <form-field>
        <label htmlFor="post-content">Content</label>
				<textarea id="#post-content" name="content" defaultValue={body} />
      </form-field>
    </Form>
  );
}
