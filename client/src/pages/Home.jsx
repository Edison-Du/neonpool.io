import { Link } from "react-router-dom";

function Home () {
    return (
        <div className="main-menu w-100 h-100 d-flex flex-column align-items-center justify-content-center">
            <section>
                <h1>n<span>e</span><span>o</span>n</h1>
                <h1>p<span>o</span><span>o</span>l</h1>
                <p>2 to 4 player billiard games</p>
            </section>
            <section className="d-flex flex-column justify-content-center">
                <Link to={"/local"} title="Pass and Play">Pass and Play</Link>
                <Link to={"/online"} title="Play Online">Play Online</Link>
            </section>
        </div>
    );
}

export default Home;