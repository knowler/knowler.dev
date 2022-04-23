import { Form, NavLink } from "@remix-run/react";

export default function AdminBar() {
  return (
    <nav aria-label="admin">
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/edit">Edit</NavLink>
      <Form action="/logout" method="post">
        <button>Logout</button>
      </Form>
    </nav>
  );
}
