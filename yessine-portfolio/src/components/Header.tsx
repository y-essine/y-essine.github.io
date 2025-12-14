import './Header.css';

interface HeaderProps {
  title?: string;
}

const Header = ({ title = "Yassine's Resume" }: HeaderProps) => {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__bar">
          <a href="#hero" className="header__logo">
            {title}
          </a>
          <button className="header__menu-button">
            <svg className="header__menu-icon" viewBox="0 0 24 24">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
