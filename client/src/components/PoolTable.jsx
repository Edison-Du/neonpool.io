import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { Consts } from "../modules/consts.mjs";

const PoolTable = forwardRef(({draw, width, mouseHandler}, ref) => {

    const canvasRef = useRef(null);

    // used to sync draw with game loop frequency, for fluidity
    function updateCanvas() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw(ctx);
    }

    useEffect(() => {
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = width/2;
        Consts.scale = width/1000;

        // add listeners
        for (let key in mouseHandler) {
            canvas.addEventListener(key, mouseHandler[key]);
        }

        // this isn't necessary for the game, but it's for preventing flickering when the screen is resized.
        // this can be removed with little impact on the product.

        let animationFrame = window.requestAnimationFrame(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw(ctx);
            window.cancelAnimationFrame(animationFrame);
        });


        // cleanup
        return () => {
            for (let key in mouseHandler) {
                canvas.removeEventListener(key, mouseHandler[key]);
            }
        }
    }, [width]);

    useImperativeHandle(ref, () => {
        return {
            updateCanvas,
        };
    });

    return (
        <canvas ref={canvasRef}></canvas>
    );
});

export default PoolTable;