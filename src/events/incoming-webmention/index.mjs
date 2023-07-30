import arc from '@architect/functions';

export const handler = arc.events.subscribe(async payload => {
	console.log(`Processing webmention from ${payload.source}…`);
});
