import { render } from "pug";
import { invariant } from "@knowler/shared/invariant";

import { createDemoServer } from "./server.js";

// Commands
import { createDemo } from "./commands/create.js";
import { editDemo } from "./commands/edit.js";
import { forkDemo } from "./commands/fork.js";
import { deleteDemo } from "./commands/delete.js";

const EDITOR = Deno.env.get("EDITOR");
invariant(EDITOR);

const PRODUCTION_URL = Deno.env.get("PRODUCTION_URL");
invariant(PRODUCTION_URL);

const MIGRATION_PATH = Deno.env.get("MIGRATION_PATH");
invariant(MIGRATION_PATH);

const MIGRATION_TOKEN = Deno.env.get("MIGRATION_TOKEN");
invariant(MIGRATION_TOKEN);

const ENDPOINT = new URL(
	`${MIGRATION_PATH}/demos`,
	PRODUCTION_URL,
);
Deno.env.set("ENDPOINT", ENDPOINT);

switch (Deno.args[0]) {
	case undefined:
	case "new": createDemo(); break;

	case "edit": editDemo(Deno.args[1]); break;

	case "fork": forkDemo(Deno.args[1]); break;

	case "delete": deleteDemo(Deno.args[1]); break;

	default: editDemo(Deno.args[0]); break;
}

