import styles from "~/styles/main.css";

export default function Index() {
  return (
    <main>
      <h1>Nathan Knowler</h1>
    </main>
  );
}

export function links() {
  return [
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
}
