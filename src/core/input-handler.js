import Experience from "./experience";

export default class InputHandler {
    constructor() {
        this.experience = new Experience();
        this.canvas = this.experience.canvas;

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

        this.movements = {
            left: false,
            right: false,
            forward: false,
            backward: false,
            up: false,
        };
        this.mouseMovements = {
            movementX: 0,
            movementY: 0,
        };

        this.lockPointer = false;

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

        window.addEventListener("dblclick", (event) => {
            this.onDblClick(event);
        });
    }

    onKeyDown(event) {
        this.keysPressed[event.key.toLowerCase()] = true;

        //
        switch (event.code) {
            case "KeyW":
            case "ArrowUp":
                this.movements.forward = true;
                break;

            case "KeyA":
            case "ArrowLeft":
                this.movements.left = true;
                break;

            case "KeyS":
            case "ArrowDown":
                this.movements.backward = true;
                break;

            case "KeyD":
            case "ArrowRight":
                this.movements.right = true;
                break;

            case "KeyF":
                this.lockPointer = true;
                this.toggleGameInstructions();
                break;

            case "Escape":
                this.lockPointer = false;
                this.toggleGameInstructions();
                break;

            case "Space":
                this.movements.up = true;
                break;
        }
    }

    toggleGameInstructions() {
        document.querySelector(".game-instructions").classList.toggle("hidden");
    }

    onKeyUp(event) {
        delete this.keysPressed[event.key.toLowerCase()];

        switch (event.code) {
            case "KeyW":
            case "ArrowUp":
                this.movements.forward = false;
                break;

            case "KeyA":
            case "ArrowLeft":
                this.movements.left = false;
                break;

            case "KeyS":
            case "ArrowDown":
                this.movements.backward = false;
                break;

            case "KeyD":
            case "ArrowRight":
                this.movements.right = false;
                break;

            case "Space":
                this.movements.up = false;
                break;
        }
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

        //
        this.mouseMovements.movementX = event.movementX;
        this.mouseMovements.movementY = event.movementY;
    }

    onDblClick() {
        const fullscreenElement =
            document.fullscreenElement || document.webkitFullscreenElement;

        if (!fullscreenElement) {
            if (this.canvas.requestFullscreen) {
                this.canvas.requestFullscreen();
            } else if (this.canvas.webkitRequestFullscreen) {
                this.canvas.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
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