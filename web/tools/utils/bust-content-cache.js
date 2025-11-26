import { kv } from "./production-kv.js";

// Bust the content cache
const { value: cache_versions } = await kv.get(["cache_versions"]);
cache_versions.content_version = Date.now();
await kv.set(["cache_versions"], cache_versions);
