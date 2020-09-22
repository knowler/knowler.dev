import React from 'react';
import EleventyNavigation from '@11ty/eleventy-navigation/eleventy-navigation';

export default ({
  content,
  title = 'Nathan Knowler',
  description = 'Nathan Knowler builds web-based solutions for people.',
  page,
  collections,
}) => {
  const navPages = EleventyNavigation.findNavigationEntries(collections.all);

  return (
    <html lang="en-CA">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />
        <title>{title}</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Oswald&display=swap"
          rel="stylesheet"
        />
        <link href="/main.css" rel="stylesheet" />
      </head>
      <body>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <header role="banner" className="site-header">
          <nav
            id="site-nav"
            className="site-nav"
            aria-labelledby="site-nav-label"
          >
            <div id="site-nav-label" hidden>
              Site
            </div>
            <ul className="site-nav--list">
              {navPages.map(({title, url}) => (
                <li key={url}>
                  <a
                    href={url}
                    aria-current={url === page.url ? 'page' : null}
                    className="site-nav--link"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav
            id="social-nav"
            className="site-nav"
            aria-labelledby="social-nav-label"
          >
            <div id="social-nav-label" hidden>
              Social
            </div>
            <ul className="site-nav--list">
              <li>
                <a href="https://github.com/knowler" className="site-nav--link">
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/kn_wler"
                  className="site-nav--link"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </nav>
        </header>
        <main
          id="content"
          tabIndex="-1"
          className="site-content"
          dangerouslySetInnerHTML={{__html: content}}
        />
        <footer className="site-footer">
          <a
            href="https://github.com/knowler/knowlerkno.ws"
            className="viewsource-link"
          >
            View source on GitHub
          </a>
        </footer>
      </body>
    </html>
  );
};
