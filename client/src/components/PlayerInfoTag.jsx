import { useEffect, useRef, useState } from "react";
import { Consts } from "../modules/consts.mjs";
import { Player } from "../modules/game/player.mjs";

function PlayerInfoTag({name, playerColour, playerState, isPlayerTurn, ballsPotted, totalBalls, width}) { // potted balls does not include black

    const grayPrimary = "#676971";
    const graySecondary = "#87898F";
    const grayBackground = "#2E303C";

    const primary = playerColour || grayPrimary;
    const secondary = (() => {
        for (let i = 0; i < Consts.playerColours.length; i++) {
            if (Consts.playerColours[i] === playerColour) {
                return Consts.playerSecondaryColours[i];
            }
        }
        return graySecondary;
    })();

    // resizing font size based on element width
    const defaultSize = 1;
    const defaultUnit = "vw";
    const nameTagRef = useRef(null);
    const canvasRef = useRef(null);
    const [fontSize, setFontSize] = useState(defaultSize);

    const checkLength = (text) => {
        if (canvasRef.current === null) {
            canvasRef.current = document.createElement("canvas");
        }
        let ctx = canvasRef.current.getContext("2d");
        ctx.font = defaultSize + defaultUnit + " Exo";
        return ctx.measureText(text).width;
    }

    useEffect(() => {
        if (!nameTagRef.current) return;
        const resizeObserver = new ResizeObserver(() => {
            let length = checkLength(name);
            if (length === 0) return;
            let width = nameTagRef.current.offsetWidth;
            let scale = Math.min((width-15)/checkLength(name), defaultSize);
            setFontSize(scale);
        });
        resizeObserver.observe(nameTagRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // bar containing information about the balls the player has potted
    const generateBallCountBar = () => {
        let arr = [];
        for (let i = 0; i < ballsPotted; i++) {
            arr.push(<div key={i} style={{backgroundColor: primary}}></div>);
        }
        if (playerState === Player.state.WON) {
            arr.push(<div key={ballsPotted} style={{backgroundColor: "white"}}></div>);
        }
        else if (playerState === Player.state.LOST) {
            arr.push(
                <div key={ballsPotted} style={{backgroundColor: grayBackground}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="red" class="bi bi-x" viewBox="4 4.5 8 7" preserveAspectRatio="none">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                    </svg>
                </div>
            );
        }
        for (let i = arr.length; i < totalBalls; i++) {
            arr.push(<div key={i} style={{backgroundColor: grayBackground}}></div>);
        }
        return arr;
    }
    
    return (
        <div className="player-info-tag d-flex">
            <div 
                className="player-info-left" 
                style={{backgroundColor: primary}}
            >
                <div className="player-info-highlight"></div>
            </div>
            <div className="player-info-right">
                <div className="player-info-top d-flex">
                    <div 
                        ref={nameTagRef}
                        className="p-2 d-flex align-items-center" 
                        style={{
                            backgroundColor: (isPlayerTurn ? secondary : grayBackground), 
                            width: width,
                            // fontSize: fontSize + "rem"
                            fontSize: fontSize + defaultUnit
                        }}
                    >
                        {name}
                    </div>
                    <div 
                        style={{backgroundColor: primary}}
                    >
                        <div className="player-info-highlight"></div>
                    </div>
                </div>
                <div className="player-info-bottom d-flex">
                    {generateBallCountBar()}
                </div>
            </div>
        </div>
    );
}

export default PlayerInfoTag;