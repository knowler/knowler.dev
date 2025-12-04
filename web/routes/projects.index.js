export async function get(c, next) {
	return c.render("projects.index", {
		title: "Projects",
		projectsByCategory: {
			"Custom elements": [
				{
					name: "<code>&lt;log-form></code> element",
					link: "https://github.com/knowler/log-form-element",
					description: "This element causes a nested form to log to the console on submission. Useful for debugging.",
				},
				{
					name: "<code>&lt;restart-animations></code> element",
					link: "https://github.com/knowler/restart-animations-element",
					description: "This element allows you to restart any Web animations for an element.",
				},
				{
					name: "<code>&lt;break-on></code> element",
					link: "https://github.com/knowler/break-on-element",
					description: "This element is effectively a declarative mutation observer. It’s inspired by the “Break on” feature in a browser’s developer tools.",
				},
				{
					name: "Dossier: a set of tabbed interface elements",
					link: "https://github.com/knowler/dossier",
					description: "Work in progress.",
				},
				{
					name: "Coniferous: a set of tree-view elements",
					link: "https://github.com/knowler/coniferous",
					description: "Work in progress.",
				},
				{
					name: "<code>&lt;html-></code> elements",
					link: "https://github.com/knowler/html-",
					description: "An ambitious project to reimplement all of HTML with custom elements. Not for production!",
				},
				{
					name: "<code>&lt;field-error></code> element",
					link: "https://github.com/knowler/field-error-element",
					description: "An exploration.",
				},
			],
			"Experiments": [
				{
					name: "ConcatenHTML",
					link: "https://github.com/knowler/concatenhtml",
					description: "What happens if we combine HTML streaming with custom elements as partials?",
				},
				{
					name: "doomed.css",
					link: "https://github.com/knowler/doomed.css",
					description: "What is the web doomed to become? This is a projec that leverages experimental web technologies like CSS Mixins and <code>ElementInternals.type</code> to get a glimpse what what styling and building custom elements might look like in the future.",
				},
			],
		},
	});
}
