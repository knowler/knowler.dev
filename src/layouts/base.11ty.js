const setAriaCurrent = (page, url) => (url === page.url ? ' aria-current="page"' : '');

module.exports = ({
  content,
  title = 'Nathan Knowler',
  description = 'Nathan Knowler builds web-based solutions for people.',
  page,
}) =>
  `
<!doctype html>
<html lang="en-CA">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${description}">
    <title>${title}</title>
    <link href="/main.css" rel="stylesheet">
  </head>
  <body>
    <a href="#content">Skip to content</a>
    <header role="banner">
      <nav id="site-nav" aria-labelledby="site-nav-label">
        <div id="site-nav-label" hidden>Site</div>
        <ul>
          <li>
            <a href="/"${setAriaCurrent(page, '/')}>Home</a>
          </li>
          <li>
            <a href="/accessibility/"${setAriaCurrent(page, '/accessibility/')}>Accessibility</a>
          </li>
        </ul>
      </nav>
    </header>
    <main id="content" tabindex="-1">
      ${content}
    </main>
    <footer>
      <a href="https://github.com/knowler/knowlerkno.ws">View source on GitHub</a>
    </footer>
    <script>if ('serviceWorker' in navigator) navigator.serviceWorker.ready.then(registration => { registration.unregister(); });</script>
  </body>
</html>
`.trim();
