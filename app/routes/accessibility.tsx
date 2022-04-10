import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => ({
  title: "Accessibility Statement – Nathan Knowler",
  description:
    "My commitment to make this website as transparently, accessible as possible.",
});

export default function AccessibilityStatement() {
  return (
    <>
      <h1>Accessibility Statement</h1>
      <p>
        I want this website to be as accessible as possible. I am building this
        website with this goal in mind. This page will be used to document how I
        intend on meeting this goal, how I am testing the accessibility of this
        website, and if there are any known accessibility issues.
      </p>
      <h2>Features</h2>
      <p>
        This site uses{" "}
        <abbr title="Accessible Rich Internet Applications">ARIA</abbr>{" "}
        attributes when necessary to improve the experience.
      </p>
      <h2>Testing</h2>
      <p>
        Currently, I am testing with macOS’ VoiceOver screen reader. In the
        future I’d like to test on Windows as well.
      </p>
      <h2>Issues</h2>
      <p>
        I’ve done my best with ensuring sufficient WCAG 2.1 AA contrast so far.
        I’m worried that the content link contrast might not be enough. As well,
        I haven’t been able to give the focus styles as much attention as they
        deserve, so they are the browser defaults for now.
      </p>
      <h2>Feedback</h2>
      <p>
        If you find any other issues that I haven’t accounted for, please help
        me address them by{" "}
        <a href="https://github.com/knowler/knowlerkno.ws/issues/new">
          submitting an issue on GitHub
        </a>
        .
      </p>
    </>
  );
}