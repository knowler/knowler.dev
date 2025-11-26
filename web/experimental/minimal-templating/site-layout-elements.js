{
	const commonStyles = new CSSStyleSheet();
	commonStyles.replaceSync(`
		ul {
			display: flex;
			list-style: none;
			padding-inline-start: 0;
			margin-block: 0;
			gap: 16px;
		}

		a[aria-current="page"] {
			text-decoration: none;
		}
	`);

	customElements.define("site-header", class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `
				<span>Nathan Knowler</span>
				<nav>
					<ul>
						<li><a href=/>Welcome</a>
						<li><a href=/about>About</a>
						<li><a href=/blog>Blog</a>
						<li><a href=/uses>Uses</a>
					</ul>
				</nav>
			`;
			this.shadowRoot.adoptedStyleSheets = [commonStyles];
			for (const link of this.shadowRoot.querySelectorAll(":any-link")) {
				if (link.pathname === location.pathname) {
					link.ariaCurrent = "page";
					link.part = "active-link";
				}
			}
		}
	});

	customElements.define("site-footer", class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: "open" });
			this.shadowRoot.adoptedStyleSheets = [commonStyles];
			this.shadowRoot.innerHTML = `
				<p><a href=https://github.com/knowler/knowler.dev>Code</a> and content by Nathan Knowler without the use of an LLM
				<p>Except if noted otherwise, content on this website is licensed under a <a rel=license href=https://creativecommons.org/licenses/by-nc-sa/4.0/>CC BY-NC-SA 4.0 license</a>.
				<nav>
					<ul>
						<li><a href=/accessibility>Accessibility</a>
						<li><a href=/privacy>Privacy</a>
						<li><a href=/feed.xml>RSS</a>
					</ul>
				</nav>
			`;
		}
	});
}
