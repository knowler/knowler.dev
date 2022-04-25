import { Form, NavLink } from "@remix-run/react";

export default function AdminBar() {
  return (
    <nav aria-label="admin" className="admin-bar">
      <NavLink to="/dashboard">Dashboard</NavLink>
      <Form action="/logout" method="post" className="_logout-form">
        <button>Logout</button>
      </Form>
    </nav>
  );
}
