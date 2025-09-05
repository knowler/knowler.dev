customElements.define("site-footer", class extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
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
			</style>
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
