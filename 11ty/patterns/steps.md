---
title: Steps
---

# {{title}}

This is almost identical to the [breadcrumbs](/patterns/breadcrumbs) pattern,
however, it indicates steps in some sort of process and can be static.

Interactive:

```html
<nav aria-label="registration process">
  <ol>
    <li>
      <a href="/1">
        First step <span class="visually-hidden">(completed)</span>
      </a>
    </li>
    <li aria-current="step">
      <a href="/2">
        Second step
      </a>
    </li>
    <li>
      <a href="/3">
        Final step
      </a>
    </li>
  </ol>
</nav>
```

Static:

```html
<div role="group" aria-label="registration progress">
  <ol>
    <li>
      First step <span class="visually-hidden">(completed)</span>
    </li>
    <li aria-current="step">
      Second step
    </li>
    <li>
      Final step
    </li>
  </ol>
</div>
```

## Resources

[This StackOverflow answer](https://stackoverflow.com/a/52935539) is well
explained and confirmed my initial inclination, but also makes a good case about
using `role=group` instead of placing the accessible name directly on the list
element.
