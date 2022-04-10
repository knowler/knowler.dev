---
title = "Bookmarklet: Open GitHub Repo in CodeSandbox"
date = "2020-01-14T23:37:30-07:00"
---

Just thought I’d share this helpful little bookmarklet I made
for opening a GitHub repo in CodeSandbox. 

Just drag the link into your bookmarks toolbar.

<a href="javascript:void(location.hostname === 'github.com' && open(`https://codesandbox.io/s/github${location.pathname}`))" title="Drag me into your bookmarks toolbar">Open in CodeSandbox</a>

Here is the raw code for it. Any improvements are welcome!

```js
javascript:void(location.hostname === 'github.com' && open(`https://codesandbox.io/s/github${location.pathname}`))
```
