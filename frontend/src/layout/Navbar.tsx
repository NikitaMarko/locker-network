import { Link } from 'react-router-dom';
import { Paths } from '../config/paths/paths.ts';

const Navbar = () => {
    return (
        <div style={navWrapper}>
            <nav style={navStyle}>
                <div style={linksContainer}>
                    <Link to={Paths.HOME} style={navItemStyle}>HOME</Link>
                    <Link to={Paths.LOCATION} style={navItemStyle}>LOCATIONS</Link>
                    <Link to={Paths.PRICE} style={navItemStyle}>PRICING</Link>
                    <Link to={Paths.INFO} style={navItemStyle}>INFO</Link>
                </div>
            </nav>
        </div>
    );
};

const navWrapper: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    justifyContent: 'center',
};

const navStyle: React.CSSProperties = {
    width: '70%',
    height: '80px',
    background: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
};

const linksContainer = {
    display: 'flex',
    gap: '60px',
};

const navItemStyle = {
    color: '#999999',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: 500,
    letterSpacing: '1.5px',
    transition: 'color 0.2s ease',
};

export default Navbar;