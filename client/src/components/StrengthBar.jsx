import { useEffect, useRef, useState } from "react";

function StrengthBar({fractionFilled}) {

    const [height, setHeight] = useState(0);

    const strengthBarRef = useRef(null);
    const gradientRef = useRef(null);

    // observe when height of bar changes, scale gradient accordingly
    useEffect(() => {
        if (!strengthBarRef.current) return;
        const resizeObserver = new ResizeObserver(() => {
            setHeight(strengthBarRef.current.offsetHeight);
        });
        resizeObserver.observe(strengthBarRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // adjust gradient height and values accordingly
    useEffect(() => {
        const top = [255, 214, 135];
        const bot = [211, 0, 121];
        let startColour = `rgb(`;
        for (let i = 0; i < 3; i++) {
            startColour += bot[i] + (top[i] - bot[i]) * fractionFilled;
            if (i != 2) startColour += ",";
        }
        startColour += ")";
        gradientRef.current.style.height = height*fractionFilled + "px";
        gradientRef.current.style.backgroundImage = `linear-gradient(180deg, ${startColour}, #D30079)`;
    }, [fractionFilled, height]);

    return (
        <div className="strength-bar" ref={strengthBarRef}>
            <div className="strength-gradient" ref={gradientRef}></div>
            <div className="strength-line"></div>
            <div className="strength-line"></div>
            <div className="strength-line"></div>
        </div>
    );
}

export default StrengthBar;