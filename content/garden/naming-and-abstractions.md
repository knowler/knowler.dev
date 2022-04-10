---
title: Naming and Abstractions
description: Thoughts on naming and abstracting stuff in programming.
---

> Naming things is hard.

It really is, but it is important. It’s not the most important thing though — I
think making good abstractions of greater importance. In my experience, good
naming serves good abstractions — they kind of are inseparable. Poor naming
often leads to poor use or misunderstanding of abstractions whether the code is
good or bad. Good abstractions are clear about what they are.

How do we name things well? I have some thoughts on this which I plan to write
here soon. Here’s the gist of it:

- Identify the context of the thing being named.
  - For more specific contexts, less specific names are appropriate.
  - For less specific contexts, more specific names are necessary.
      - Is this thing shared or have the potentially to be shared in anyway?
- When the context changes, names need to be revisited.
- It’s better to write two specific things which are practically the same
  instead of one less specific thing to begin with. The specifics of names will
  help lead to what an abstraction could be (i.e. if you remove the specifics
  what are you left with — that’s the abstraction).
- It’s better to maintain duplication than poor abstractions.