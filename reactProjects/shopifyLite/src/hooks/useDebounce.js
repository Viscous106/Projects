// useDebounce.js
// A utility hook that "debounces" a value — meaning it delays updating the value
// until the user has STOPPED typing for a specified number of milliseconds.
//
// Example: typing "laptop" in the search bar fires 6 keystrokes.
// Without debounce: the filter/search runs 6 times (once per letter).
// With debounce(300ms): the filter only runs ONCE, 300ms after the last keystroke.
// This prevents unnecessary re-renders and API calls while the user is still typing.

import { useState, useEffect } from 'react';

// value  → the raw, fast-changing value (e.g. search input text)
// delay  → how many milliseconds to wait after the last change before updating
export const useDebounce = (value, delay) => {
    // debouncedValue is the "slow" version that only updates after the delay
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set a timer: if `value` doesn't change for `delay` ms, update debouncedValue
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup function: this runs every time `value` changes BEFORE the timeout fires.
        // Clears the old timer so it never completes — effectively resetting the countdown.
        // This is what creates the "wait until user stops typing" behaviour.
        return () => clearTimeout(handler);
    }, [value, delay]); // Re-run this effect whenever value or delay changes

    return debouncedValue; // Return the delayed value for use in components
};
