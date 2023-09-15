// TODO: actually use the database.

export const posts = [
	{
		"slug": "extending-html-form-validation",
		"title": "Extending HTML Form Validation",
		"description":
			"A quick and practical introduction for using the Constraint Validation API to extend HTML Form Validation.",
		"publishedAt": "2022-11-23T01:26:11.931Z",
	},
	{
		"slug": "im-on-mastodon",
		"title": "I’m on Mastodon",
		"publishedAt": "2022-11-05T05:44:00.000Z",
	},
	{
		"slug": "managing-event-listeners-in-custom-elements",
		"title": "Managing Event Listeners in Custom Elements",
		"publishedAt": "2022-10-06T23:33:00.000Z",
	},
	{
		"slug": "2020-in-music",
		"title": "2020 in music",
		"publishedAt": "2020-12-30T23:10:00.000Z",
	},
	{
		"slug": "open-in-codesandbox-bookmarklet",
		"title": "Bookmarklet: Open GitHub Repo in CodeSandbox",
		"publishedAt": "2020-01-15T01:37:00.000Z",
	},
	{
		"slug": "introduction-to-clover",
		"title": "Introduction to Clover",
		"publishedAt": "2019-03-05T10:57:00.000Z",
	},
	{
		"slug": "gg-a-git-directory-jumping-helper",
		"title": "gg: a Git directory jumping helper",
		"publishedAt": "2019-02-22T14:20:00.000Z",
	},
	{
		"slug": "rust-for-a-rusty-game-developer",
		"title": "Rust For A Rusty Game Developer",
		"publishedAt": "2019-01-31T16:31:00.000Z",
	},
	{
		"slug": "2018-in-music",
		"title": "2018 in music and a look to the future",
		"publishedAt": "2018-12-31T19:00:00.000Z",
	},
	{
		"slug": "hello-world",
		"title": "Hello, World!",
		"publishedAt": "2018-12-31T16:30:00.000Z",
	},
];

export async function GET({ view }) {
	return view(
		"blog.index",
		{
			title: "Blog",
			posts,
		},
	);
}

export const pattern = new URLPattern({ pathname: "/blog{/}?" });
