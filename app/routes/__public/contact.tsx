import type { MetaFunction, } from "@remix-run/node";
import { getSeo } from "~/seo";

const [seoMeta] = getSeo({title: 'Contact'});

export const meta: MetaFunction = () => seoMeta;

export default function Contact() {
  return (
		<article style={{maxInlineSize: '60ch', lineHeight: 1.5}}>
			<h1>Contact me</h1>
			<p>Nobody really used this form (except spammers), so I am putting a pause on it until I have the time redesign it. Please reach out to me on the fediverse if you need to get in touch. My handle is <a href="https://sunny.garden/@knowler">@knowler@sunny.garden</a>.</p>
		</article>
  );
}
