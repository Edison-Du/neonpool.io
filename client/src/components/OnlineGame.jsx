import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ConnectionManager } from "../network/connectionManager.mjs";
import { SocketEvents } from "../network/socketEvents.mjs";

function OnlineGame ({players, gameSeed, exitGame}) {
    return (
        <div>
            <h1>Online Game</h1>
            <div>
                {/* {lobbyCode} */}
            </div>

        </div>
    );
}

export default OnlineGame; 