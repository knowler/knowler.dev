---
title: Maintaining dotfiles
---

# Maintaining dotfiles

When it comes to maintaining anything that serves a sort of background
function for more important things, it is vital to ensure that the
maintainence process is simple, otherwise, there will be stagnation and
that thing won’t be serving its purpose. When it comes to dotfiles, I
don’t believe there is necessarily a best way to maintain them, however,
your maintainence methods should suit your strengths. 

Mine is **Git**. 

I’ve used Git for a number of years and it is a tool that I use every
day. For many developers, I am sure this is also the case, though I
expect that many might not feel adequately strong at using Git. I still
think that a maintainence workflow that favours Git is the best route
for most of these developers, because the main alternative is a workflow
that, while it does use Git, primarily depends on a shell’s linking
capabilities (i.e. `ln`), and from my observation and experience, most developers
are much less confident here. 

That was the case with myself. I found myself spending a long time
writing shell scripts for linking files or using scripts that required a
tendious degree of maintainence in order to add new files or simply to
move files, along with a lot of time spent on trial and error — which is
scary to do when you just need your system to work for more important
tasks. This usually resulted a stale dotfiles repository and a lot less
care for my local dotfiles or even fear towards modifying (or fixing)
different configurations.

In 2020, after a number of issues with my computer hardware which
required me to setup at least 3 different fresh OS installs for my work,
I decided that I needed to find a solution for my dotfiles so that I
could reduce how much time it was taking me to get to work.

## The Bare Repository Method

I stumbled upon an article by Atlassian called [“The best way to store
your dotfiles: A bare Git repository.”](https://www.atlassian.com/git/tutorials/dotfiles)
I had never heard of a bare Git respository and since I had been digging
deep into Git, I was curious. After reading the article, I gave the
setup a try in a new respository on my GitHub and very quickly realized
that this was a much easier way to manage dotfiles, and I converted my
main repo over.

A bare repository is essentially just the `.git` directory without a
checked out worktree. A setup looks like cloning your dotfiles as a bare
repo. Usually it is advisable to use something other than `.git`, I use
`.dotfiles` in my home directory. Then you create checkout a worktree in
your home directory. Now, you might wonder, _wouldn’t that display
everything as potential files to track when I run `git status`?_ Yes, it
does, however, this is easily solvable, by turning off untracked files
in your status config for the repository.

### Clone the repo

```shell
git clone <repo> "$HOME/.dotfiles" --bare
```

### Do not show untracked files in git status for the repo

```shell
git --git-dir="$HOME/.dotfiles" config status.showUntrackedFiles no
```

### Checkout the worktree in your `$HOME`

```shell
git --git-dir="$HOME/.dotfiles" --work-tree="$HOME" checkout
```

### Manage dotfiles using Git

You will need to prefix your Git commands with the path to the Git
directory and the worktree path:

```shell
git --git-dir="$HOME/.dotfiles" --work-tree="$HOME" <command>
```

It is best to create an alias for this.

```shell
alias dots="git --git-dir=$HOME/.dotfiles --work-tree=$HOME"
```

Now, you can use this alias however you would use Git.

```shell
dots add ~/.config/nvim/init.lua

dots commit -m "Add Neovim config"

dots push
```