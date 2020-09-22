export const Navigation = ({children, label}) => {
  const navId = `${label.toLowerCase()}-nav`;
  const labelId = `${navId}-label`;

  return (
    <nav id={navId} className="site-nav" aria-labelledby={labelId}>
      <div id={labelId} hidden>
        {label}
      </div>
      <ul className="site-nav--list">{children}</ul>
    </nav>
  );
};

Navigation.Item = ({children, href, isCurrent}) => (
  <li>
    <a
      href={href}
      aria-current={isCurrent ? 'page' : null}
      className="site-nav--link"
    >
      {children}
    </a>
  </li>
);
