import { useParams } from "react-router-dom";


function Online () {

    const { lobbyCode } = useParams();

    return (
        <div>
            <h1>Online</h1>
            <div>
                {lobbyCode}
            </div>

        </div>
    );
}

export default Online; 