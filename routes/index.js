export function GET(c) {
	return c.render(
		"[page]",
		{
			title: "Welcome",
			page: {
				html:
					'<p>My name is Nathan Knowler and this is my website. I’m originally from Vancouver, however, I now live in Winnipeg and work remotely as a Senior Frontend Developer at <a href="https://wearekettle.com" rel="noreferrer">Kettle</a>.</p>',
			},
		},
	);
}
