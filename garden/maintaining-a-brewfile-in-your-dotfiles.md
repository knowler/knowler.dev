---
title: Maintaining a Brewfile in your dotfiles
description: ''

---
# {{title}}


The `brew bundle` command lets you work with a `Brewfile`. Without any additional subcommands (`install` is the implicit subcommand) it will attempt to install formulae, casks, Mac App Store apps, and whalebrew dependencies from a `Brewfile` in the current directory. This is useful in itself, especially if you need to install a system from scratch, however, if we dig deeper we will find some tools to help us maintain a global `Brewfile` for our macOS system.

`brew bundle dump` let's us dump the system's current installed packages into a `Brewfile` in the current working directory. If you add the `--global` flag, it dumps to a `.Brewfile` (note, the preceeding dot) in your `$HOME` directory (i.e. `$HOME/.Brewfile`). This is great, but you’ll quickly notice on subsequent dumps, we get and error that the file already exists. To resolve this just add the `--force` flag. The full command now is like this:

```shell
brew bundle dump --global --force
```

If you want to be fancy you can also add the `--describe` and it will add a leading comment describing what the dependency is. I don’t feel that need for my own `Brewfile`.

One thing you will notice with this approach is that Homebrew becomes in charge of how the file is sorted. I know some people like to organize their own, however, if you want an easier time with version control, I recommend that you just let that go.

Now, remembering to dump this file is pain and there is no first-class way to do it. I suggest that one does implement some sort of way to automatically dump it. For now, the best solution I have for this is the following:

```bash
#!/usr/bin/env bash

# Pass everything to brew
/usr/local/bin/brew "$@"

# Dump after install or upgrade
case "$1" in
  install | uninstall | upgrade) /usr/local/bin/brew bundle dump --global --force;;
esac
```

This is sort of a proxy on top of the `brew` command which just dumps the file after installing, uninstalling, or upgrading dependencies. I store this as `~/.local/bin/brew` which is a part of my `$PATH`.

On another note, I’d advise not spending any time worrying about the lock file that the bundle feature provides. It seems to set the installed version to `null` on subsequent dumps which doesn’t make sense. Maybe I’m not understanding it. I’ll have to check it out more in the future.