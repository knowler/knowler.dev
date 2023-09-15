export function GET({ view }) {
	return view("dashboard", {
		title: "Dashboard",
	});
}
