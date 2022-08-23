import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => ({
  title: "Nathan Knowler",
  description: "Nathan Knowler builds for the web.",
});

export default function Index() {
  return (
    <article className="prose has-links">
      <h1>I am Nathan Knowler</h1>
      <p>
        Welcome to my website. I’m originally from Vancouver, however, I now
        live in Winnipeg and work remotely as a Senior Frontend Developer at{" "}
        <a href="https://wearekettle.com">Kettle</a>.
      </p>
    </article>
  );
}
