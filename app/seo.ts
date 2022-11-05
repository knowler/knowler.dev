import initSeo from "remix-seo";

export const { getSeo, getSeoMeta, getSeoLinks } = initSeo({
	titleTemplate: "%s – Nathan Knowler",
	description: "Nathan Knowler builds for the web.",
});
