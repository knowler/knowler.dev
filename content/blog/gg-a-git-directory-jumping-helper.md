---
title = "gg: a Git directory jumping helper"
date = "2019-02-22T12:20:48-07:00"
tags = [scripts, coding]
---

Large projects and mono repos can be a pain to navigate. **gg**
is a small script I use almost everyday to make it easier.

If you’ve ever worked with WordPress — or really most CMSes for
that matter — the base application configuration, themes,
plugins, etc. are typically given their own sub directories to
help isolate them. For WordPress development, I use the
[Roots](https://roots.io) stack and it does a great job of
making the project structure relavant, however, since it is
still WordPress, the project structure is not exactly flat.
Often I’ll need to jump to Trellis’ directory to start the
development VM, run a deploy, or update an environment’s
configuration, but shortly after jump back to the directory of
the theme or plugin I’m working on. Remembering the level of
depth and simply writing out the path can be a tedious and
erroneous task.

## A simple solution

**gg** is a very simple Bash script I wrote to make is 100%
easier to jump between directories in a large project. Here’s a
short clip of it in action with a Roots project:

{{ youtube(id="w0SjUNTfzKk", class="youtube") }}

## Breaking down the script

There are a few requirements you will need before you get started:

**Requirements**: `git`, [`fzf`], [`fd`], [`ag`]

You most likely should be able to achieve the same thing with
built-in tools or alternatives to `fd` and `ag` (maybe even
`fzf`), but for this tutorial, I’ll use the tools listed above.
One note before diving into the script, I do have the following
set for my FZF default command:

```bash
export FZF_DEFAULT_COMMAND='ag -g ""'
```

The script itself is pretty simple. There are two parts to it.
First, if we want to see all of the directories within our
project, even if we are already in a nested directory, we will
need to jump to the root of the Git repo. Luckily, it is
relatively easy to do this with Git. Using Git’s `rev-parse`
subcommand with the `--show-toplevel` flag, we can get “the
absolute path of the top-level-directory.” Since this is useful
in itself, but still a tad cumbersome to remember and write out,
we’ll create a function for it:

```bash
gr() {
  cd `git rev-parse --show-toplevel`
}
```

If you already have a set of Git-aliases, you might find naming
conflicts with the ones I will create in this tutorial and in
that case, or in the case you don’t like the names I’ve picked,
you will need to use a different name.

The next step is to create an easy way to find a sub-directory.
If you’ve ever used a fuzzy-search tool, you’ll know that that
they are pretty great. Knowing the fuzzy-search capabilities of
`fzf`, I know I can do something like `cd $(fzf)` to almost
achieve what we’re looking for, however, that finds directories
and files, the latter of which we do not need. Luckily, we can
use a finder tool with `fzf` to get what we need. I’ll use `fd`
to achieve this:

```bash
gd() {
  cd `
    fd --type d --hidden --follow --exclude .git \
    | fzf --preview "ls -Ap {}"
  `
}
```

We are telling `fd` to just find directories, follow symbolic
links, allow hidden directories, but exclude the `.git`
directory. Luckily, `fd` already respects `.gitignore` so we do
not need to worry about dependencies or build files polluting
our search selection. Also, we are making it fancy with a
preview window of the selected directory’s contents.

I prefer to leave these as separate functions in case I want to
just jump to the Git repo root or jump to a sub-directoy within
the current directory. For the final `gg` command, we can just
use an alias:

```bash
alias gg="gr && gd"
```

And that’s it. Here’s the full and final script:

```bash
#!/usr/bin/env bash

# Go to Git root
gr() {
  cd `git rev-parse --show-toplevel`
}

# Go to sub-directory
gd() {
  cd `
    fd --type d --hidden --follow --exclude .git \
    | fzf --preview "ls -Ap {}"
  `
}

# Go to a directory within the current Git repository
alias gg="gr && gd"
```

[`fzf`]: https://github.com/junegunn/fzf
[`fd`]: https://github.com/sharkdp/fd
[`ag`]: https://github.com/ggreer/the_silver_searcher
