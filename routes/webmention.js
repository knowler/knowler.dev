export function GET({view}) {
	return view(
		"webmention",
		{
			title: "Webmention",
			issues: [],
			formData: {},
		},
	);
}

export const pattern = new URLPattern({pathname: "/webmention"});
