import prismaClientModule from "@prisma/client";
import { readFile } from "fs/promises";

const prisma = new prismaClientModule.PrismaClient();

async function seedPosts() {
	try {
		const postsSeed = JSON.parse(
			await readFile(
				new URL('./posts-seed.json', import.meta.url),
			),
		);
		for (const data of postsSeed.posts) {
			await prisma.post.create({ data });
		}
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
		console.log('No posts seed found.')
	}
}

async function seedPages() {
	try {
		const pagesSeed = JSON.parse(
			await readFile(
				new URL('./pages-seed.json', import.meta.url),
			),
		);
		for (const data of pagesSeed.pages) {
			await prisma.page.create({ data });
		}
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
		console.log('No pages seed found.')
	}
}

async function seedGardenPosts() {
	try {
		const gardenSeed = JSON.parse(
			await readFile(
				new URL('./garden-seed.json', import.meta.url),
			),
		);
		for (const data of gardenSeed.garden) {
			await prisma.gardenPost.create({ data });
		}
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
		console.log('No garden seed found.')
	}
}

let EXIT_CODE = 0;
try {
	try {
		await seedPosts();
		await seedPages();
		await seedGardenPosts();
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}


} catch (error) {
	console.error(error);
	EXIT_CODE = 1;
} finally {
	await prisma.$disconnect();
	process.exit(EXIT_CODE);
}
