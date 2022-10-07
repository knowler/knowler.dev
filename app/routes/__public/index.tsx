import type { MetaFunction } from "@remix-run/node";
import { getSeoMeta } from "~/seo";

export const meta: MetaFunction = () => getSeoMeta({
  title: "Home",
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
