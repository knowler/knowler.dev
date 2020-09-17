// Until this is a universal filter
const EleventyNavigation = require('@11ty/eleventy-navigation/eleventy-navigation');

const setAriaCurrent = (page, url) =>
  url === page.url ? ' aria-current="page"' : '';

module.exports = ({
  content,
  title = 'Nathan Knowler',
  description = 'Nathan Knowler builds web-based solutions for people.',
  page,
  collections,
}) => {
  const navPages = EleventyNavigation.findNavigationEntries(collections.all);

  return `
<!doctype html>
<html lang="en-CA">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${description}">
    <title>${title}</title>
     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Oswald&display=swap" rel="stylesheet">
    <link href="/main.css" rel="stylesheet">
  </head>
  <body>
    <a href="#content" class="skip-link">Skip to content</a>
    <header role="banner" class="site-header">
      <nav id="site-nav" class="site-nav" aria-labelledby="site-nav-label">
        <div id="site-nav-label" hidden>Site</div>
        <ul class="site-nav--list">
          ${navPages.map(({title, url}) => `<li><a href="${url}"${setAriaCurrent(page, url)} class="site-nav--link">${title}</a></li>`).join('')}
        </ul>
      </nav>
      <nav id="social-nav" class="site-nav" aria-labelledby="social-nav-label">
        <div id="social-nav-label" hidden>Social</div>
        <ul class="site-nav--list">
          <li>
            <a href="https://github.com/knowler" class="site-nav--link">GitHub</a>
          </li>
          <li>
            <a href="https://twitter.com/kn_wler" class="site-nav--link">Twitter</a>
          </li>
        </ul>
      </nav>
    </header>
    <main id="content" tabindex="-1" class="site-content">
      ${content}
    </main>
    <footer class="site-footer">
      <a href="https://github.com/knowler/knowlerkno.ws" class="viewsource-link">View source on GitHub</a>
    </footer>
    <script>if ('serviceWorker' in navigator) navigator.serviceWorker.ready.then(registration => { registration.unregister(); });</script>
  </body>
</html>
`.trim();
};
