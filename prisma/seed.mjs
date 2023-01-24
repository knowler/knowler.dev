import prismaClientModule from "@prisma/client";
import { readFile } from "fs/promises";
const postsSeed = JSON.parse(
	await readFile(
		new URL('./posts-seed.json', import.meta.url),
	),
);

const prisma = new prismaClientModule.PrismaClient();

let EXIT_CODE = 0;
try {
	for (const data of postsSeed.posts) {
		await prisma.post.create({ data });
	}
} catch (error) {
	console.error(error);
	EXIT_CODE = 1;
} finally {
	await prisma.$disconnect();
	process.exit(EXIT_CODE);
}
