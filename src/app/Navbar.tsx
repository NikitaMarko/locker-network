import {Link} from 'react-router-dom';
import {Paths} from "./utils/paths.ts";
import "./navlink.css"

const Navbar = () => {


    return (
        <nav className="navbar">
            <div className="navbar-center">
                <Link to={Paths.HOME}>HOME</Link>
                {/*<Link to={Paths.LOCKERS}>Lockers</Link>*/}
                <Link to={Paths.LOCATION}>LOCATIONS</Link>
                <Link to={Paths.PRICE}>PRICING</Link>
                <Link to={Paths.INFO}>INFO</Link>
            </div>

        </nav>
    );
}

export default Navbar;