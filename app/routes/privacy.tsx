import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => ({
  title: "Privacy – Nathan Knowler",
});

export default function PrivacyPolicy() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>I don’t track nothing.</p>
    </>
  );
}
