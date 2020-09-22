import React from 'react';

export const Main = ({content}) => (
  <main
    id="content"
    tabIndex="-1"
    className="site-content"
    dangerouslySetInnerHTML={{__html: content}}
  />
);
