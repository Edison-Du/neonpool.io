import { useNavigate } from "react-router-dom";

function Error ({errorMessage}) {
    const navigate = useNavigate();
    const returnHome = () => {
        navigate("/");
    };
    return (
        <div className="error d-flex flex-column justify-content-center align-items-center h-100 w-100">
            <h1>{errorMessage}</h1>
            <button onClick={returnHome} title="Return home">Return Home</button>
        </div>
    );
}

export default Error;