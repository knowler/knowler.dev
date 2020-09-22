import React from 'react';
import EleventyNavigation from '@11ty/eleventy-navigation/eleventy-navigation';

import {Header, Footer, Main, Navigation, SkipLink} from './components';

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
        <SkipLink />
        <Header>
          <Navigation label="Site">
            {navPages.map(({title, url}) => (
              <Navigation.Item
                isCurrent={url === page.url ? 'page' : null}
                href={url}
              >
                {title}
              </Navigation.Item>
            ))}
          </Navigation>
          <Navigation label="social">
            <Navigation.Item href="https://github.com/knowler">
              GitHub
            </Navigation.Item>
            <Navigation.Item href="https://twitter.com/kn_wler">
              Twitter
            </Navigation.Item>
          </Navigation>
        </Header>
        <Main content={content} />
        <Footer />
      </body>
    </html>
  );
};
