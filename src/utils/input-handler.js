export default class InputHandler {
    constructor() {
        this.keysPressed = {};
        this.mouseKeysPressed = {};
        this.cursorPosition = { x: 0, y: 0 };

        this.currentMouseState = {
            left: false,
            right: false,
            mouseXDelta: 0,
            mouseYDelta: 0,
            mouseX: 0,
            mouseY: 0,
        };
        this.previousMouseState = null;

        window.addEventListener("keydown", (event) => {
            this.onKeyDown(event);
        });

        window.addEventListener("keyup", (event) => {
            this.onKeyUp(event);
        });

        window.addEventListener("mousedown", (event) => {
            this.onMouseDown(event);
        });

        window.addEventListener("mouseup", (event) => {
            this.onMouseUp(event);
        });

        window.addEventListener("mousemove", (event) => {
            this.onMouseMove(event);
        });
    }

    onKeyDown(event) {
        this.keysPressed[event.key.toLowerCase()] = true;
    }

    onKeyUp(event) {
        delete this.keysPressed[event.key.toLowerCase()];
    }

    onMouseDown(event) {
        // TODO: add event handling for mouse events
        this.mouseKeysPressed.left = event.buttons === 1;
        this.mouseKeysPressed.right = event.buttons === 2;

        this.currentMouseState.left = event.buttons === 1;
        this.currentMouseState.right = event.buttons === 2;
    }

    onMouseUp(event) {
        // TODO: add event handling for mouse events
        delete this.mouseKeysPressed.left;
        delete this.mouseKeysPressed.right;

        this.currentMouseState.left = false;
        this.currentMouseState.right = false;
    }

    onMouseMove(event) {
        this.currentMouseState.mouseX = event.pageX - window.innerWidth / 2;
        this.currentMouseState.mouseY = event.pageY - window.innerHeight / 2;

        if (this.previousMouseState === null) {
            this.previousMouseState = {
                ...this.currentMouseState,
            };
        }

        this.currentMouseState.mouseXDelta =
            this.currentMouseState.mouseX - this.previousMouseState.mouseX;
        this.currentMouseState.mouseYDelta =
            this.currentMouseState.mouseY - this.previousMouseState.mouseY;
    }

    isReady() {
        return this.previousMouseState !== null;
    }

    update() {
        if (this.previousMouseState !== null) {
            this.currentMouseState.mouseXDelta =
                this.currentMouseState.mouseX - this.previousMouseState.mouseX;
            this.currentMouseState.mouseYDelta =
                this.currentMouseState.mouseY - this.previousMouseState.mouseY;

            this.previousMouseState = { ...this.currentMouseState };
        }
    }
}
