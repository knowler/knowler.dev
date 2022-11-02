//import { Queue } from "quirrel/remix";
//import { prisma } from "~/db.server";
//
//export default Queue("queues/webmention", async ({source, target}) => {
//	const webmention = await prisma.webmention.create({
//		data: {
//			target,
//			source,
//		},
//	});
//
//	console.log(webmention);
//});

export default () => null;
