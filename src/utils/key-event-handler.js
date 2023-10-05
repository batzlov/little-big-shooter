export default class KeyEventHandler {
    constructor() {
        super();

        this.keysPressed = {};

        window.addEventListener("keydown", (event) => {
            this.handleInput(event.key.toLowerCase());
            this.keysPressed[event.key.toLowerCase()] = true;
        });

        window.addEventListener("keyup", (event) => {
            delete this.keysPressed[event.key.toLowerCase()];
        });
    }
}
