---
title: Meter and progress in Safari
---

# `<meter>` and `<progress>` in Safari

Date: November 1, 2021

On the weekend, I wrote some cross-browser styles for an HTML `meter` element.
The biggest difference was between Firefox and Chrome/Safari — I’ll spare the
details. There was a slight difference between Safari and Chrome which required
me to set `-webkit-appearance: none` for Safari to override any of the browser
styles, immediately followed by `appearance: meter` for Chrome. Safari doesn’t
support the latter rule. When all was done, I was pretty satisfied and began
some cross-browser testing.

After a visual test, I went on to using screen readers. That’s when I noticed an
issue in Safari: the element seemed to be completely ignored. Upon further
investigation, I discovered that the element didn’t have an implicit ARIA role
in the accessibility details of Safari’s Web Inspector. The first thing I did
was remove the `-webkit-appearance: none` rule to set it back to its default
state to see if Safari set it in the first place. This resolved the issue; the
implicit role was now `meter` as it should be. After reintroducing that rule,
then changing the value to `meter`, `auto`, etc. then back to `none`, it became
clear that `none` was the offending value.

I checked what effect `-webkit-appearance: none` had on other elements with
implicit ARIA roles and the only two elements affected by the bug were `<meter>`
and `<progress>`. I filed [the bug report](https://bugs.webkit.org/show_bug.cgi?id=232569) for WebKit this morning.

## Takeaway

Until this bug is fixed, if you want to have visually consistent meters and
progress bars, and not break accessibility in Safari, you should not use
`<meter>` or `<progress>`. Instead use the `meter` and `progressbar` roles,
along with the appropriate ARIA attributes to implement your own.