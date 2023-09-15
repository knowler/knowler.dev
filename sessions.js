import { getCookies } from "std/http";
import kv from "./kv.js";

function flash(name) {
	return `__flash_${name}__`;
}

export function createSession(initialData, id) {
	const map = new Map(Object.entries(initialData));

	return {
		get id() {
			return id;
		},
		get data() {
			return Object.fromEntries(map);
		},
		get(name) {
			if (map.has(name)) return map.get(name);

			const flashName = flash(name);
			if (map.has(flashName)) {
				const value = map.get(flashName);
				map.delete(flashName);
				return value;
			}

			return undefined;
		},
		set(name, value) {
			map.set(name, value);
		},
		flash(name, value) {
			map.set(flash(name), value);
		},
		unset(name) {
			map.delete(name);
		},
	};
}

export function createSessionStorage(
	{ cookie, createData, readData, updateData, deleteData },
) {
	const { name, ...cookieOptions } = cookie;

	return {
		async getSession(request) {
			const cookies = getCookies(request.headers);
			const id = cookies[name];
			const data = id && await readData(id);

			return createSession(data || {}, id || "");
		},
		async commitSession(session) {
			let { id, data } = session;

			if (id) await updateData(id, data);
			else id = await createData(data);

			return {
				name,
				value: id,
				...cookieOptions,
			};
		},
		async destroySession(session) {
			await deleteData(session.id);

			return {
				name,
				value: id,
				...cookieOptions,
			};
		},
	};
}

export function createDenoKVSessionStorage({ cookie, kv }) {
	return createSessionStorage({
		cookie,
		async createData(data) {
			const randomBytes = new Uint8Array(8);
			crypto.getRandomValues(randomBytes);
			const id = [...randomBytes]
				.map((x) => x.toString(16).padStart(2, "0"))
				.join("");

			await kv.set([cookie.name, id], data);

			return id;
		},
		async readData(id) {
			const res = await kv.get([cookie.name, id]);

			return res.value;
		},
		async updateData(id, data) {
			await kv.set([cookie.name, id], data);
		},
		async deleteData(id) {
			await kv.delete([cookie.name, id]);
		},
	});
}

export const { getSession, commitSession } = createDenoKVSessionStorage({
	cookie: {
		name: "__session",
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 7,
		path: "/",
		sameSite: "lax",
		domain: Deno.env.get("SESSION_DOMAIN"),
	},
	kv,
});
