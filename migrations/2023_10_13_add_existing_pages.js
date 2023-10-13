export async function migrate() {
	const kv = await Deno.openKv();

	const pages = [
		{
			id: crypto.randomUUID(),
			slug: "welcome",
			title: "Welcome",
			published: true,
			html:
				`<p>My name is Nathan Knowler and this is my website. I’m originally from Vancouver, however, I now live in Winnipeg and work remotely as a Senior Frontend Developer at <a href="https://wearekettle.com" rel="noreferrer">Kettle</a>.</p>`,
		},
		{
			id: crypto.randomUUID(),
			slug: "about",
			title: "About",
			published: true,
			html:
				`<p>My name is Nathan Knowler. I live in Winnipeg, Manitoba, Canada — Treaty 1 territory — with my family. I grew up in Metro Vancouver, but I’ve lived on the Canadian Prairies for the past&nbsp;decade.</p>
<h2 id="i-am-a-web-developer">I am a web developer</h2>
<p>I currently work as a Senior Frontend Developer with <a href="https://wearekettle.com" rel="noreferrer">Kettle</a>. I built my first website in 2006 and since then the Web has been my&nbsp;jam. I’ve worked full stack for most of my career, however, the frontend is my preference.</p>
<h2 id="i-am-passionate-about-accessibility">I am passionate about accessibility</h2>
<p>Moving to Saskatchewan in 2013 made me realize that my experience of the Web in the well-connected tech hub of Vancouver was not the norm for everyone everywhere. It was then that I began the journey of learning how others experience the Web and how I could positively or negatively impact those experiences in my work as a web developer.</p>`,
		},
		{
			id: crypto.randomUUID(),
			slug: "uses",
			title: "Uses",
			published: true,
			html:
				`<p>I am a workflow junkie, so I’m always refining what I use. This page is an outline of the hardware and software that I use on a daily basis with varying degrees of details about those choices.</p>
<h2 id="devices-and-operating-systems">Devices and Operating Systems</h2>
<p>I’ve used MacBook Pros as my daily driver for the last decade. I like macOS. I can make it feel like Linux, but still benefit from the OS exclusive apps it has, which is especially important for my work as a web developer.</p>
<p>I do have a desktop PC that I built when I was a teenager. It serves as a backup work computer and a gaming rig. Currently, I have it dual-booted with <a href="https://manjaro.org">Manjaro</a> and Windows 10.</p>
<p>My current phone is an iPhone 13 Pro. Boring, I know.</p>
<h2 id="peripherals">Peripherals</h2>
<p>Generally, I just use my MacBook’s keyboard and trackpad. I do have an <a href="https://ergodox-ez.com/">ErgoDox EZ</a> that I use when I use a second monitor or if I am using my desktop computer. It’s tough to get used to since often I just need to get work done. I know I just need to take a few weeks of dedicated use to force myself to get better at it. I suspect it will be like learning anything with a steep learning curve (e.g. vim, tmux, etc.).</p>
<p>I have an old 24-inch BenQ monitor that I use. It’s not a high DPI screen which both isn’t great for regular use, but also is good for testing some designs. One day I’ll upgrade it.</p>
<p>For audio, I use a first generation Focusrite Scarlett 2i2 as an audio interface. I run that into a set of PreSonus Eris E4.5 studio monitors. I get the most use out of my first generation Sennheiser Momentums. I’ve replaced its cable about four times and the muffs at least once. I love them.</p>
<h2 id="software">Software</h2>
<p>Most of the configuration for the software that I use is store in my <a href="https://github.com/knowler/dotfiles">dotfiles</a> repository. I wrote a piece about <a href="https://knowlerkno.ws/garden/maintaining-dotfiles">how I go about maintaining these dotfiles</a>.</p>
<p>On macOS, I use <a href="https://github.com/koekeishiya/yabai">yabai</a> as a tiling window manager along with a <a href="https://www.hammerspoon.org/">Hammerspoon</a> configuration called <a href="https://github.com/AdamWagner/stackline">Stackline</a> and a <a href="https://github.com/cmacrae/spacebar">spacebar</a> as my status bar. On Manjaro, I use <a href="https://swaywm.org/">Sway</a>.</p>
<p>I’ve replaced Spotlight with <a href="https://www.alfredapp.com/">Alfred</a> on macOS. I have a number of workflows that I use with this.</p>
<p>I use <a href="https://github.com/alacritty/alacritty">Alacritty</a> as my terminal emulator. It’s written in Rust, so it’s fast. I wish it had support for ligatures, but I still prefer it over Kitty.</p>
<p>Along with Alacritty, I use <a href="https://github.com/tmux/tmux">tmux</a> as my terminal multiplexer. I have the two integrated really nicely with some nice keyboard shortcuts.</p>
<p><a href="https://www.zsh.org/">zsh</a> is my shell of choice. I do tend to write all my scripts in Bash though. I use <a href="https://github.com/sorin-ionescu/prezto">Prezto</a> as my base configuration, but do have it stripped back a fair bit. On top of that I use <a href="https://starship.rs/">Starship</a> as my prompt.</p>
<p><a href="https://neovim.io/">Neovim</a> is my general purpose text editor. I love it. Check out my <a href="https://github.com/knowler/dotfiles">dotfiles</a> to see what plugins I have installed.</p>
<h3 id="surfin-the-web">Surfin’ the Web</h3>
<p>For browsing, I use <a href="https://arc.net/">Arc</a> and I love it.</p>
<p>I really like <a href="https://hypothes.is/">Hypothesis</a> for annotating web pages.</p>
<h3 id="reading-writing-and-listening">Reading, Writing, and Listening</h3>
<p>I use Apple Books on mobile and desktop. For podcasts I use <a href="https://www.pocketcasts.com/">Pocket Casts</a>. I also use it for audiobooks when I have the actual files.</p>
<p><a href="https://netnewswire.com">NetNewsWire</a> is my RSS reader. I use it with <a href="https://github.com/xwmx/nb">nb</a> for bookmarking. I use nb for notetaking as well. I really like it so far since it uses Git under the hood and lets me use my editor for writing.</p>
<p>Markdown is my preferred text format, but for more formal work, I use LaTeX.</p>
<h2 id="aesthetics">Aesthetics</h2>
<p>I’ve used <a href="https://github.com/dominiklohmann/25th-hour">“25th Hour”</a> as a dynamic wallpaper on macOS for the last couple of years.</p>
<p><a href="https://cocopon.github.io/iceberg.vim/">Iceberg</a> as my colour scheme for pretty much everything. <a href="https://gumroad.com/l/dank-mono">Dank Mono</a> is the font I use for code.</p>`,
		},
		{
			id: crypto.randomUUID(),
			slug: "accessibility",
			title: "Accessibility Statement",
			published: true,
			html:
				`<p>I want this website to be as accessible as possible. I am building this website
with this goal in mind. This page will be used to document how I intend on
meeting this goal, how I am testing the accessibility of this website, and if
there are any known accessibility issues.</p>
<h2 id="features">Features</h2>
<p>This site uses <abbr title="Accessible Rich Internet Applications">ARIA</abbr>
attributes when necessary to improve the experience.</p>
<h2 id="testing">Testing</h2>
<p>Currently, I am testing with macOS’ VoiceOver screen reader. In the future I’d
like to test on Windows as well.</p>
<h2 id="issues">Issues</h2>
<p>I’ve done my best with ensuring sufficient WCAG 2.1 AA contrast so far.</p>
<h2 id="feedback">Feedback</h2>
<p>If you find any other issues that I haven’t accounted for, please help me
address them by <a href="https://github.com/knowler/knowler.dev/issues/new">submitting an issue on GitHub</a>.</p>`,
		},
		{
			id: crypto.randomUUID(),
			slug: "privacy",
			title: "Privacy Policy",
			published: true,
			html: `<p>I care deeply about respecting your privacy.</p>
<p>If you have cookies enabled for this site, it will use a session cookie to help provide validation feedback when you fill out any forms. Anything entered into the forms may be persisted to a database. Get in touch with me if you want any data you’ve submitted through this website removed (i.e. webmentions for website or content you own).</p>
<p>In the future, I might start tracking form validation errors so that I can make adjustments to the user experience. If I choose to do so, I’ll likely not store any identifiable content to the datasebase and just keep track of the types of validation errors.</p>`,
		},
	];

	for (const page of pages) {
		await kv.set(["pages", page.id], page);
		await kv.set(["pagesBySlug", page.slug], page.id);
	}
}
