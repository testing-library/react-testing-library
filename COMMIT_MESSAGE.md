# Fix: fireEvent.mouseEnter not forwarding relatedTarget properly

## Problem
`fireEvent.mouseEnter` was not properly forwarding the `relatedTarget` property from the event initialization object. When users passed a `relatedTarget` in the second parameter, it would be ignored and the event handler would receive `window` as the `relatedTarget` instead of the specified element.

## Root Cause
The issue was in the `fireEvent.mouseEnter` implementation in `src/fire-event.js`. The function was using spread operator (`...args`) which didn't properly preserve the event initialization object when calling both the original `mouseEnter` and the subsequent `mouseOver` events.

## Solution
Changed the function signatures from using spread operator to explicit parameters:
- `(...args) => { ... }` → `(node, init) => { ... }`

This ensures that the `init` object (containing `relatedTarget` and other event properties) is properly passed to both the original event and the synthetic event that React needs.

## Changes Made
1. Fixed `fireEvent.mouseEnter` and `fireEvent.mouseLeave` 
2. Fixed `fireEvent.pointerEnter` and `fireEvent.pointerLeave` for consistency
3. Fixed `fireEvent.blur` and `fireEvent.focus` for consistency
4. Added comprehensive tests to verify the fix

## Testing
- Added test cases for `mouseEnter`, `mouseLeave`, and `pointerEnter` with `relatedTarget`
- All tests verify that the `relatedTarget` is correctly forwarded to event handlers

Fixes #1422