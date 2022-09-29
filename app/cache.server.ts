import type { CachedBlogPost, CachedPage } from "@prisma/client";
import { prisma } from "~/db.server";
import { parseMarkdown } from "~/md.server";
import { octokit } from "~/octokit.server";

interface ContentQueryResponseData {
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
  const data = await octokit.graphql<ContentQueryResponseData>(pagesQuery);
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

const blogPostsQuery = `{
	repository(owner: "knowler", name: "knowler.dev") {
		object(expression: "HEAD:content/blog") {
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
}`;


export async function cacheBlogPosts(): Promise<CachedBlogPost[]> {
	const data = await octokit.graphql<ContentQueryResponseData>(blogPostsQuery);
	const cachedBlogPosts = await Promise.all(
		data.repository.object.entries?.map(async (entry) => {
			const markdown = entry.object.text;
			const slug = entry.name.replace(entry.extension, "");
			const { attributes, html } = await parseMarkdown(markdown);
			const { title, date: publishedAt, updated: updatedAt, description } = attributes;

			return await prisma.cachedBlogPost.upsert({
				where: { slug },
				create: {
					slug,
					title,
					publishedAt,
					updatedAt,
					description,
					markdown,
					html,
				},
				update: {
					title,
					description,
					markdown,
					html,
					publishedAt,
					updatedAt
				}
			});
		})
	);
	return cachedBlogPosts;
}
