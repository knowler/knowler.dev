const webfinger = {
	"subject":"acct:knowler@sunny.garden",
	"aliases":
	[
		"https://sunny.garden/@knowler",
		"https://sunny.garden/users/knowler"
	],
	"links":
	[
		{
			"rel":"http://webfinger.net/rel/profile-page",
			"type":"text/html",
			"href":"https://sunny.garden/@knowler"
		},
		{
			"rel":"self",
			"type":"application/activity+json",
			"href":"https://sunny.garden/users/knowler"
		},
		{
			"rel":"http://ostatus.org/schema/1.0/subscribe",
			"template":"https://sunny.garden/authorize_interaction?uri={uri}"
		},
	],
};

export function loader() {
	return new Response(
		JSON.stringify(webfinger, null, 2),
		{
			headers: {
				'content-type': 'application/jrd+json',
			},
		},
	);
}
