import type { LinksFunction, MetaFunction } from "@remix-run/node";
import proseStyles from '~/styles/prose.css';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: proseStyles},
];

export const meta: MetaFunction = () => ({
  title: "Nathan Knowler",
  description: "Nathan Knowler builds for the web.",
});

export default function Index() {
  return (
    <article className="prose">
      <h1>I am Nathan Knowler</h1>
      <p>
        Welcome to my website. I’m originally from Vancouver, however, I now
        live in Winnipeg and work remotely as a Senior Frontend Developer at{" "}
        <a href="https://wearekettle.com">Kettle</a>.
      </p>
    </article>
  );
}