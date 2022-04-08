import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => ({
  title: "Uses – Nathan Knowler",
  description: "Technology that I use every day or most days.",
});

export default function Uses() {
  return (
    <article>
      <h1>Uses</h1>
      <p>Here’s a bunch of stuff I use regularly.</p>
      <ul>
        <li>
          My <a href="https://github.com/knowler/dotfiles">dotfiles</a> — check
          them out.
        </li>
        <li>
          <a href="https://neovim.io/">Neovim</a> for editing any sort of text,
          but also as a merge tool.
        </li>
        <li>
          <a href="https://cocopon.github.io/iceberg.vim/">Iceberg</a> as my
          colour scheme for pretty much everything.
        </li>
        <li>
          <a href="https://gumroad.com/l/dank-mono">Dank Mono</a> is the font I
          use for code.
        </li>
        <li>
          <a href="https://github.com/alacritty/alacritty">Alacritty</a> as my
          terminal emulator.
        </li>
        <li>
          <a href="https://github.com/tmux/tmux">tmux</a> as my terminal
          multiplexer.
        </li>
        <li>
          <a href="https://github.com/koekeishiya/yabai">yabai</a> as my tiling
          window manager on macOS.
        </li>
        <li>
          <a href="https://github.com/cmacrae/spacebar">spacebar</a> as my
          status bar on macOS.
        </li>
        <li>
          <a href="https://www.alfredapp.com/">Alfred</a> as my application
          launcher on macOS.
        </li>
        <li>
          <a href="https://www.mozilla.org/firefox/">Firefox</a> as my primary
          web browser.
        </li>
      </ul>
    </article>
  );
}
