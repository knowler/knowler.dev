import { kv } from "./utils/production-kv.js";

const [url] = Deno.args;

await kv.delete(["kv-httpcache", url]);
console.log(`Successfully purged cache for ${url}`);
