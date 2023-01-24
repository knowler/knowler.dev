import { json, LoaderArgs } from "@remix-run/node";

export function loader({}: LoaderArgs) {
	return json({
		testing: "hello, world!",
	});
}
