customElements.define("site-header", class extends HTMLElement {
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
		for (const link of this.shadowRoot.querySelectorAll(":any-link")) {
			if (link.pathname === location.pathname) link.ariaCurrent = "page";
		}
	}
});
