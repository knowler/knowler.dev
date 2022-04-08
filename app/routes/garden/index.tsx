import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => ({
  title: "Digital Garden – Nathan Knowler",
});

export default function GardenIndex() {
  return (
    <>
      <h1>Digital Garden</h1>
      <p>
        This is my digital garden, you can find stuff I’m currently writing here
        or pieces that I’ve finished or continue to maintain. It’s highly likely
        that there will be spelling mistakes and errors herein.
      </p>
      <ul>
        <li>
          <Link to="maintaining-dotfiles">Maintaining dotfiles</Link>
        </li>
        <li>
          <Link to="tmux-magic">tmux magic</Link>
        </li>
        <li>
          <Link to="maintaining-a-brewfile-in-your-dotfiles">
            Maintaining a Brewfile in your dotfiles
          </Link>
        </li>
        <li>
          <Link to="humility-boldness-and-teaching">
            Humility, boldness, and teaching
          </Link>
        </li>
        <li>
          <Link to="discourse-and-tongues">Discourse and tongues</Link>
        </li>
        <li>
          <Link to="meter-and-progress-in-safari">
            <code>{`<meter>`}</code> and <code>{`<progress>`}</code> in Safari
          </Link>
        </li>
        <li>
          <Link to="naming-and-abstractions">Naming and Abstractions</Link>
        </li>
      </ul>
    </>
  );
}
