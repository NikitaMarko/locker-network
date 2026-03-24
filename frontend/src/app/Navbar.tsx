import {Link} from 'react-router-dom';
import {Paths} from "./utils/paths.ts";
import "./navlink.css"

const Navbar = () => {

    // const isAuth = false;

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to={Paths.HOME}>Home</Link>
                <Link to={Paths.LOCKERS}>Lockers</Link>
                <Link to={Paths.LOCATION}>Locations</Link>
                <Link to={Paths.PRICE}>Pricing</Link>
                <Link to={Paths.INFO}>Info</Link>
            </div>

            {/*<div className="navbar-right">*/}
            {/*    {isAuth ? (*/}
            {/*        <button>Logout</button>*/}
            {/*    ) : (*/}
            {/*        <>*/}
            {/*            <Link to={Paths.LOGIN}>Login</Link>*/}
            {/*            <Link to={Paths.REGISTER}>Registration</Link>*/}
            {/*        </>*/}
            {/*    )}*/}
            {/*</div>*/}
        </nav>
    );
}

export default Navbar;