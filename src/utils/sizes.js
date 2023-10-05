import EventEmitter from "./event-emitter.js";

export default class Sizes extends EventEmitter {
    constructor() {
        super();

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.devicePixelRatio = Math.min(window.devicePixelRatio, 2);

        window.addEventListener("resize", () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.devicePixelRatio = Math.min(window.devicePixelRatio, 2);

            this.emit("resize");
        });
    }
}
