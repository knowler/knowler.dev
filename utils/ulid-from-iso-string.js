import { ulid } from "@std/ulid";

export function ulidFromISOString(isoString, offset = 0) {
	return ulid(Number(new Date(isoString)) + offset);
}
