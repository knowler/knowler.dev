/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

import type { DOMAttributes } from "react";
import type {FormField} from "./elements/form-field.mjs";
import type {SlugInputElement} from "./elements/slug-input.mjs";

type CustomElement<T> = Partial<
  T & DOMAttributes<T> & { children: any; class: string; ref?: any }
>;

declare global {
	namespace JSX {
		interface IntrinsicElements {
			["form-field"]: CustomElement<FormField>
			["article-header"]: CustomElement<Element>
			["site-preferences"]: CustomElement<Element>
			["slug-input"]: CustomElement<SlugInputElement>
		}
	}
}
