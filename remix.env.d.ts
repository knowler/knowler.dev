/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

import { DetailedHTMLProps, HTMLAttributes } from "react";

declare namespace JSX {
	interface IntrinsicElements {
		[elemName: string]: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
	}
}
