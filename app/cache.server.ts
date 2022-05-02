import { CachedPage } from "@prisma/client";
import { prisma } from "~/db.server";
import { parseMarkdown } from "~/md.server";
import { octokit } from "~/octokit.server";

interface PagesQueryResponseData {
  repository: {
    object: {
      entries: {
        name: string;
        extension: string;
        object: {
          text: string;
        };
      }[];
    };
  };
}
const pagesQuery = `
  query pages {
    repository(name: "knowler.dev", owner: "knowler") {
      object(expression: "HEAD:content/pages") {
        ... on Tree {
          entries {
            name
            extension
            object {
              ... on Blob {
                text
              }
            }
          }
        }
      }
    }
  }
`;

export async function cachePages(): Promise<CachedPage[]> {
  const data = await octokit.graphql<PagesQueryResponseData>(pagesQuery);
  const cachedPages = await Promise.all(
    data.repository.object.entries?.map(async (entries) => {
      const markdown = entries.object.text;
      const slug = entries.name.replace(entries.extension, "");
      const { attributes, html } = await parseMarkdown(markdown);
      const { title, description } = attributes;

      return await prisma.cachedPage.upsert({
        where: { slug },
        create: {
          slug,
          title,
          description,
          markdown,
          html,
        },
        update: {
          title,
          description,
          markdown,
          html,
        },
      });
    })
  );

  return cachedPages;
}
