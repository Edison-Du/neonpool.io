import ResizableTextBox from "./generic/ResizableTextBox";

function GameOver({gameResults, playerNames, playerColours, onRematch, onExit}) {
    
    return (
        <div className="game-over d-flex justify-content-center align-items-center">
            <div className="h-100 d-flex flex-column justify-content-center">
                <h1 className="w-100 d-flex justify-content-center mb-3 ">Game Over</h1>
                <div>
                    {gameResults.map((player, index) => 
                        <div key={index} className="player-result-tag d-flex">
                            <div 
                                className="d-flex align-items-center justify-content-center"
                                style={{backgroundColor: playerColours[player] || "#87898F"}}
                            >
                                {index + 1}
                            </div>
                            <ResizableTextBox
                                text={playerNames[player]}
                                className={"d-flex align-items-center"}
                                defaultFontSize={1.5}
                            ></ResizableTextBox>
                            <div style={{backgroundColor: playerColours[player] || "#87898F"}}>
                                <div className="player-info-highlight"></div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="d-flex justify-content-between">   
                    <button onClick={onRematch} title="Rematch">Rematch</button>
                    <button onClick={onExit} title="Leave game">
                        <svg xmlns="http://www.w3.org/2000/svg" width="2.5vw" height="2.5vw" fill="white" className="bi bi-box-arrow-right" viewBox="-2 0 18 16">
                            <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                            <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GameOver;