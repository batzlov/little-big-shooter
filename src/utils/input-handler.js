export default class InputHandler {
    constructor() {
        this.keysPressed = {};
        this.mouseKeysPressed = {};
        this.cursorPosition = { x: 0, y: 0 };

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
            delete this.mouseKeysPressed.left;
            delete this.mouseKeysPressed.right;
        });

        window.addEventListener("mousemove", (event) => {
            // values range from -0.5 to 0.5
            // this.cursor.x = event.clientX / sizes.width - 0.5;
            // this.cursor.y = -(event.clientY / sizes.height - 0.5);
        });
    }
}
