---
title: "VoiceOver ignores meter elements in Safari with -webkit-appearance: none"
---

# {{title}}

It doesn’t seem possible to provide customs styles for a `<meter>` element in
Safari without breaking the element’s accessibility. In order to provide custom
styles, one must set `-webkit-appearance: none` which seems to cause VoiceOver to
ignore the `<meter>` element. In Safari, the default setting of
`-webkit-appearance` is `meter`. It seems to me that there is no accessible
advantage to using `<meter>` unless one is using browser styles for the element.
