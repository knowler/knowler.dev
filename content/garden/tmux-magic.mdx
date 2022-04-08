---
title: tmux magic
---

# tmux magic

This isn’t really magic, but arguable how tmux is designed to be used.
When I started using tmux, I was coming from iTerm. In iTerm, splits and
tabs open a new shell, so naturally when I started using tmux this is
how I used it. It didn’t help that the built-in bindings for tmux do
encourage this (e.g. `prefix + c` to open a new window). After a while
of using tmux this way, I felt like there must be a better way thank
opening new shells all the time. My sessions were littered with
abandoned splits and windows called `zsh`.

It began with this binding:

```
bind -n C-Space command-prompt -p ":new-window" "new-window %%" 
```

Using control and space in tmux, it would open up a command prompt which
I’d use to type in the command I wanted to run in a new window. This is
quite reminiscent of Alfred if you’ve used it. This was great for
a while. I used it for running quick commands in the background like
`git pull` or `git commit -p` or install dependencies or running
database migrations or opening the manual for a command. You can even
add the `-d` flag to not focus the new window. Or the `-n` flag to name
the window. This is helpful for windows that run a persistent command
(e.g. `-dn watch yarn watch`). 

There are two big benefits to a command first approach to tmux windows:

1. The windows/splits close when the program exits. 
2. You can respawn the pane by running the `respawn-pane -k` tmux
   command. This is very helpful if you’ve just reinstall deps and you
   need to restart a watch command. I bound this to control and r: `bind
   r respawn-pane -k`

I realized after some time that `split-window` is just as desirable to
use. I bound these to alt + the arrow keys:

```
bind -n M-Right command-prompt -p ":split-window -h" "split-window -h %%" 
bind -n M-Left command-prompt -p ":split-window -bh" "split-window -bh %%" 
bind -n M-Up command-prompt -p ":split-window -b" "split-window -b %%"
bind -n M-Down command-prompt -p ":split-window" "split-window %%" 
```

