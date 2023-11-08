const DENO_KV_DB_UUID = Deno.env.get("DENO_KV_DB_UUID");
export const kv = await Deno.openKv(`https://api.deno.com/databases/${DENO_KV_DB_UUID}/connect`);
