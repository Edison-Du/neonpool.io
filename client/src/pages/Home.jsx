import { Link } from "react-router-dom";

function Home () {

    return (
        <div>
            <h1>neon pool</h1>
            <div className="d-flex flex-column justify-content-center">
                <Link to={"/local"}>Pass and Play</Link>
                <Link to={"/online"}>Play Online</Link>
            </div>
        </div>
    );
}

export default Home;