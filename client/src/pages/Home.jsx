import { Link } from "react-router-dom";

function Home () {
    return (
        <div className="main-menu w-100 h-100 d-flex flex-column align-items-center justify-content-center">
            <section className="fade-in">
                <h1>n<span>e</span><span>o</span>n</h1>
                <h1>p<span>o</span><span>o</span>l</h1>
                <p>2 to 4 player billiard games</p>
            </section>
            <section className="d-flex flex-column justify-content-center fade-in">
                <Link className="option" to={"/local"} title="Pass and Play">Pass and Play</Link>
                <Link className="option" to={"/online"} title="Play Online">Play Online</Link>
            </section>
        </div>
    );
}

export default Home;