const migrations = new Map([
	[
		"2023_10_12_create_migrations_store",
		() => import("~/migrations/2023_10_12_create_migrations_store.js"),
	],
	[
		"2023_10_13_add_existing_pages",
		() => import("~/migrations/2023_10_13_add_existing_pages.js"),
	],
]);

export async function runMigrations() {
	try {
		const kv = await Deno.openKv();

		const migrationsToRun = [];
		for (const migration of migrations) {
			const [key] = migration;

			const record = await kv.get(["migrations", key]);

			// Migration hasn’t run: add it to the todo list
			if (!record?.value) migrationsToRun.push(migration);
			// There is a missing migration in between the ones that have run.
			else if (migrationsToRun.length > 0) {
				throw new MissingMigrationError(`missing migration: ${key}`);
			} // Migration has run: continue looking for migrations which haven’t run.
			else continue;
		}

		console.log(`Migrations to run: ${migrationsToRun.length}`);
		for (const [key, importMigration] of migrationsToRun) {
			const { migrate } = await importMigration();

			console.log(`Running migration: ${key}`);
			await migrate();

			console.log(`Successfully ran migration: ${key}`);
			await kv.set(["migrations", key], true);
		}
	} catch (error) {
		if (error instanceof MissingMigrationError) console.error(error);
		else throw error;
	}
}

class MissingMigrationError extends Error {}
