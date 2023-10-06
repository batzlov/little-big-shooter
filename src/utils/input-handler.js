export default class InputHandler {
    constructor() {
        this.keysPressed = {};
        this.mouseKeysPressed = {};

        window.addEventListener("keydown", (event) => {
            this.keysPressed[event.key.toLowerCase()] = true;
        });

        window.addEventListener("keyup", (event) => {
            delete this.keysPressed[event.key.toLowerCase()];
        });

        window.addEventListener("mousedown", (event) => {
            // TODO: add event handling for mouse events
            this.mouseKeysPressed.left = event.buttons === 1;
            this.mouseKeysPressed.right = event.buttons === 2;
        });

        window.addEventListener("mouseup", (event) => {
            // TODO: add event handling for mouse events
            this.mouseKeysPressed.left = false;
            this.mouseKeysPressed.right = false;
        });
    }
}
