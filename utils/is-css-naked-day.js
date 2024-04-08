export function isCSSNakedDay() {
	const year = new Date().getFullYear();
	const april9 = [year, 3, 9];
	const start = Date.UTC(...april9, -12, 0, 0, 0);
	const end = Date.UTC(...april9, 36, 0, 0, 0);
	const now = Date.now();

  return now >= start && now <= end;
}
