import * as THREE from "three";
import CannonDebugger from "cannon-es-debugger";

import sources from "../constants/sources.js";

import Debug from "../utils/debug.js";
import Sizes from "../utils/sizes.js";
import Time from "../utils/time.js";
import Resources from "../utils/resources.js";
import InputHandler from "./input-handler.js";

import Camera from "../core/camera.js";
import Renderer from "../core/renderer.js";
import PhysicsWorld from "../core/physics-world.js";
import FirstPersonControls from "../core/first-person-controls.js";

import World from "../world/world.js";

let instance = null;

export default class Experience {
    constructor(canvas) {
        if (instance) {
            return instance;
        }

        instance = this;

        window.experience = this;

        this.canvas = canvas;

        this.debug = new Debug();
        this.sizes = new Sizes();
        this.time = new Time();
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.resources = new Resources(sources);
        this.inputHandler = new InputHandler();
        this.physicsWorld = new PhysicsWorld();
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.firstPersonControls = new FirstPersonControls(
            this.camera.instance,
            this.camera.body
        );
        this.world = new World();
        this.scene.add(this.firstPersonControls.getObject());

        this.initEvents();
    }

    initEvents() {
        this.sizes.on("resize", () => {
            this.resize();
        });

        this.time.on("tick", () => {
            this.update();
        });
    }

    destroyEvents() {
        this.sizes.off("resize");
        this.time.off("tick");
    }

    resize() {
        this.camera.resize();
        this.renderer.resize();
    }

    update() {
        this.camera.update();
        this.world.update();
        this.inputHandler.update();
        this.physicsWorld.update();
        this.firstPersonControls.update(this.clock.getDelta());
        this.renderer.update();
    }

    destroy() {
        this.destroyEvents();

        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();

                for (const key in child.material) {
                    const value = child.material[key];

                    if (value && typeof value.dispose === "function") {
                        value.dispose();
                    }
                }
            }
        });

        // this.camera.controls.dispose();
        this.renderer.instance.dispose();

        if (this.debug.active) {
            this.debug.ui.destroy();
        }
    }
}
