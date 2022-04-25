import type { MetaFunction } from "@remix-run/node";
import {
  FootnoteRef as Ref,
  Footnotes,
  FootnotesProvider,
} from "react-a11y-footnotes";
import proseStyles from '~/styles/prose.css';
import styles from "./about.css";

export const links = () => [
  {rel: "stylesheet", href: proseStyles },
  {rel: "stylesheet", href: styles },
];

export const Meta: MetaFunction = () => ({
  title: "About – Nathan Knowler",
});

export default function About() {
  return (
    <FootnotesProvider>
      <article className="prose">
        <h1>About Nathan Knowler</h1>
        <aside aria-label="Work in progress" className="wip">
          <p>This article is a work in progress.</p>
        </aside>
        <p>
          My name is Nathan Knowler. I am a follower of Jesus, the husband of
          Rhythm, and the father of Indigo. We live on Treaty 1 territory, in a
          town called West St. Paul, just outside of Winnipeg, Manitoba, Canada.
          Web development is my trade and I currently am employed remotely as a
          Senior Frontend Developer at{" "}
          <a href="https://wearekettle.com">Kettle</a>.
        </p>
        <h2>Purpose</h2>
        <p>
          I believe that humanity needs to be reconciled to our Creator and to
          one another. This reconciliation is one and the same as{" "}
          <Ref
            description={
              <>
                Genesis 1:26-27. See{" "}
                <a href="https://bibleproject.com/explore/video/image-of-god/">
                  BibleProject’s video “Image of God”
                </a>{" "}
                for more about the biblical theme.
              </>
            }
          >
            we are made in the image of our Creator.
          </Ref>{" "}
          Why am I saying this? Because it’s the truth that informs a lot of
          what I do. Ultimately, it’s why I care about accessibility so much.
          And it’s why I am{" "}
          <Ref description="See Karl Barth on being a pacifist in practice and not in principle.">
            practically a pacifist.
          </Ref>
        </p>
        <Footnotes Wrapper={FootnotesWrapper} />
      </article>
    </FootnotesProvider>
  );
}

function FootnotesWrapper(props) {
  return <aside aria-labelledby="footnotes-label" {...props} />;
}
