// Until this is a universal filter
const EleventyNavigation = require('@11ty/eleventy-navigation/eleventy-navigation');

const setAriaCurrent = (page, url) => (url === page.url ? ' aria-current="page"' : '');

module.exports = ({
  content,
  title = 'Nathan Knowler',
  description = 'Nathan Knowler builds web-based solutions for people.',
  page,
  collections,
}) => {
  const navPages = EleventyNavigation.findNavigationEntries(collections.all);

  const socialLinks = [
    {
      title: 'GitHub',
      url: 'https://github.com/knowler',
    },
    {
      title: 'Twitter',
      url: 'https://twitter.com/kn_wler',
    },
  ];

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
  <body class="p-4 sm:p-8 bg-base text-green-2 font-body text-s0">
    <a href="#content">Skip to content</a>
    <header role="banner" class="-mt-2 mb-4 flex flex-wrap justify-between items-center">
      <nav id="site-nav" aria-labelledby="site-nav-label" class="mt-2 mr-2">
        <div id="site-nav-label" hidden>Site</div>
        <ul class="flex space-x-2 sm:space-x-4 pl-0 list-none">
          ${navPages.map(({title, url}) => `
              <li>
                <a href="${url}"${setAriaCurrent(page, url)} class="px-2 py-1 border-2 border-green-2 rounded-full ${url === page.url ? 'bg-green-2 text-base' : 'text-green-2 hover:bg-green-3 hover:border-green-3 hover:text-base'} text-s-1 font-medium transition-colors duration-200 ease-in">${title}</a>
              </li>
            `).join('')}
        </ul>
      </nav>
      <nav id="social-nav" aria-labelledby="social-nav-label" class="mt-2">
        <div id="social-nav-label" hidden>Social</div>
        <ul class="flex space-x-2 sm:space-x-4 pl-0 list-none">
          ${socialLinks.map(({title, url}) => `
              <li>
                <a href="${url}" class="px-2 py-1 border-2 border-green-2 rounded-full ${url === page.url ? 'bg-green-2 text-base' : 'text-green-2 hover:bg-green-3 hover:border-green-3 hover:text-base'} text-s-1 font-medium transition-colors duration-200 ease-in">${title}</a>
              </li>
            `).join('')}
        </ul>
      </nav>
    </header>
    <main id="content" tabindex="-1" class="max-w-48ch mt-8 space-y-4 focus:outline-none">
      ${content}
    </main>
    <footer class="max-w-48ch mt-4">
      <a href="https://github.com/knowler/knowlerkno.ws" class="inline-block px-1 -mx-1 text-s-1 border-b hover:bg-green-2 hover:text-base hover:border-green-2 transition-colors duration-200 ease-in">View source on GitHub</a>
    </footer>
    <script>if ('serviceWorker' in navigator) navigator.serviceWorker.ready.then(registration => { registration.unregister(); });</script>
  </body>
</html>
`.trim();
}
