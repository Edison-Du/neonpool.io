import { useEffect, useRef, useState } from "react";
import useWindowWidth from "../../hooks/useWindowWidth";

function ResizableTextBox({text, defaultFontSize=1, style=null, className}) {
    // resizing font size based on element width
    const defaultUnit = "vw";
    const textRef = useRef(null);
    const canvasRef = useRef(null);
    const [fontSize, setFontSize] = useState(defaultFontSize);
    const screenWidth = useWindowWidth();

    const convertVWtoPixel = (vw) => {
        return screenWidth * (vw/100);
    }

    const checkLength = (text) => {
        if (canvasRef.current === null) {
            canvasRef.current = document.createElement("canvas");
        }
        let ctx = canvasRef.current.getContext("2d");
        ctx.font = convertVWtoPixel(defaultFontSize) + "px" + " Exo";
        return ctx.measureText(text).width;
    }

    const resize = () => {
        if (!textRef.current) return;
        let length = checkLength(text);
        if (length === 0) return;
        let width = textRef.current.offsetWidth;
        let style = window.getComputedStyle(textRef.current);
        let padding = parseFloat(style.getPropertyValue('padding-left')) + parseFloat(style.getPropertyValue('padding-right'));
        let scale = Math.min((width-padding)/length, 1);
        setFontSize(scale*defaultFontSize);
    }

    useEffect(() => {
        resize();
    })

    useEffect(() => {
        if (!textRef.current) return;
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(textRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div 
            ref={textRef}
            className={className}
            style={{
                fontSize: fontSize + defaultUnit,
                ...style
            }}
        >
            {text}
        </div>
    );
}

export default ResizableTextBox;