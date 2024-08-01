// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
// https://www.netlify.com/blog/2019/03/11/deep-dive-how-do-react-hooks-really-work/
/**
 * Summary of my struggles and what I've learned:
 *  - State creates a new object each render, ref does not. Thus, closure issues
 *    when creating the callback function for set interval only apply to state.
 *    (Because the intial value of state is referenced in the closure, but that value is overridden when
 *     the next render comes around with a new object, so it's sort of like a dangling pointer. Ref on
 *     the other hand just provides an unchanging object, but you can change the current property of that object.)
 * 
 *    myRef.current, although annoying to type, actually makes perfect sense, and is absolutely necessary.
 */

import { useEffect, useRef } from "react";

function useInterval(callback, delay) {
    
    const fn = useRef();

    useEffect(() => {
        fn.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay) {
            let id = setInterval(() => {
                fn.current();
            }, delay);
            return () => clearInterval(id);
        }   
    }, [delay]);
}

export default useInterval;