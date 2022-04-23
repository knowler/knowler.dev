import parseFrontMatter from 'front-matter';
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { auth } from "~/auth.server";
import { octokit } from "~/octokit.server";
import { getFormData } from 'remix-params-helper';
import { z } from 'zod';

export const action: ActionFunction = async ({request}) => {
  await auth.isAuthenticated(request, { failureRedirect: '/' });
  const result = await getFormData(request, z.object({
    title: z.string(),
    description: z.string().optional(),
    content: z.string(),
  }));

  if (!result.success) return json(result, 400);

  // Do all of the GitHub stuff.
  

  return json(result);
};

export const loader: LoaderFunction = async ({request}) => {
  await auth.isAuthenticated(request, { failureRedirect: '/' });
  const data = await octokit.graphql(
      `
    query page($expression: String!) {
      repository(name: "knowlerkno.ws", owner: "knowler") {
        object(expression: $expression) {
          ... on Blob {
            text
          }
        }
      }
    }
  `,
      {
        expression: `HEAD:content/pages/uses.md`,
      }
    );

  const {attributes, body} = parseFrontMatter(data.repository.object.text);

  return json({attributes, body});
}


export default function EditIndex() {
  const {attributes, body} = useLoaderData();

  return (
    <main style={{maxInlineSize: 'unset'}}>
      <h1>Edit</h1>
      <Form method="patch">
        <div>
          <label>
            Title <input type="text" name="title" required defaultValue={attributes?.title} />
          </label>
        </div>
        <div>
          <label>
            Description <input type="text" name="description" defaultValue={attributes?.description} />
          </label>
        </div>
        <div>
          <label>Content</label>
          <textarea name="content" defaultValue={body} />
        </div>
        <button>Save</button>
      </Form>
    </main>
  );
}
