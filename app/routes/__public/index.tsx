import { MetaFunction } from "@remix-run/node";
import { getSeoMeta } from "~/seo";

export const meta: MetaFunction = () => getSeoMeta({
	title: "Home",
});

export default function Index() {
	return (
		<article className="h-entry">
			<h1 className="p-name">Welcome</h1>
			<div className="e-content">
				<p>
					My name is Nathan Knowler and this is my website. I’m originally from Vancouver, however, I now
					live in Winnipeg and work remotely as a Senior Frontend Developer at{" "}
					<a href="https://wearekettle.com">Kettle</a>.
				</p>
			</div>
		</article>
	);
}
