import { Link, useLocation } from 'react-router-dom';

export const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex items-center text-sm mb-6 whitespace-nowrap overflow-x-auto pb-2">
      <Link to="/" className="text-gold hover:text-gold-light transition-colors">
        Home
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          <span className="mx-2 text-text-muted">{'>'}</span>
          {item.to ? (
            <Link
              to={item.to}
              className="text-gold hover:text-gold-light transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};
