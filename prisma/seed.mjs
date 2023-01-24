import prismaClientModule from "@prisma/client";

const prisma = new prismaClientModule.PrismaClient();

let EXIT_CODE = 0;
try {
	await prisma.post.create({
		data: {
			slug: "hello-world",
			title: "Hello, World!",
			description: "Welcome to my blog.",
			published: true,
			publishedAt: new Date(),
			html: `
<p>Hi there. This is an example blog post.</p>
<h2>Second Level Heading</h2>
<p>Sup.</p>
`.trim(),
			markdown: `
Hi there. This is an example blog post.

## Second Level Heading

Sup.
			`.trim(),
		}
	});
} catch (error) {
	console.error(error);
	EXIT_CODE = 1;
} finally {
	await prisma.$disconnect();
	process.exit(EXIT_CODE);
}

