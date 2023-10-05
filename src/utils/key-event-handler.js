import * as THREE from "three";
import EventEmitter from "./event-emitter";

export default class KeyEventHandler extends EventEmitter {
    constructor() {
        super();

        this.keysPressed = {};

        window.addEventListener("keydown", (event) => {
            this.handleInput(event.key.toLowerCase());
            this.keysPressed[event.key.toLowerCase()] = true;
        });

        window.addEventListener("keyup", (event) => {
            this.keysPressed[event.key.toLowerCase()] = false;
        });
    }

    handleInput(key) {
        const forward = new THREE.Vector3(0, 0, -1);
        const backward = new THREE.Vector3(0, 0, 1);
        const left = new THREE.Vector3(-1, 0, 0);
        const right = new THREE.Vector3(1, 0, 0);
        const up = new THREE.Vector3(0, 1, 0);

        switch (key) {
            case "w":
                this.emit("move-player", [forward]);
                break;
            case "a":
                this.emit("move-player", [left]);
                break;
            case "s":
                this.emit("move-player", [backward]);
                break;
            case "d":
                this.emit("move-player", [right]);
                break;
            case " ":
                this.emit("move-player", [up]);
                break;
            default:
                break;
        }
    }
}
