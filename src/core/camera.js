import * as THREE from "three";
import * as CANNON from "cannon-es";
import Experience from "./experience.js";

export default class Camera {
    constructor() {
        this.experience = new Experience();

        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.time = this.experience.time;
        this.physicsWorld = this.experience.physicsWorld;
        this.inputHandler = this.experience.inputHandler;
        this.debug = this.experience.debug;

        this.translation = new THREE.Vector3(0, 1.5, 15);

        if (this.debug.active) {
            this.initDebug();
        }

        this.initInstance();
    }

    initInstance() {
        this.instance = new THREE.PerspectiveCamera(
            75,
            this.sizes.width / this.sizes.height,
            0.1,
            1000
        );

        this.instance.position.y = 1.4;

        this.scene.add(this.instance);
    }

    initDebug() {
        this.debugFolder = this.debug.ui.addFolder("CAMERA");
        this.debugObject = {
            translationX: this.translation.x,
            translationY: this.translation.y,
            translationZ: this.translation.z,
        };
        this.debug.ui
            .add(this.debugObject, "translationX")
            .min(-20)
            .max(20)
            .step(0.1)
            .name("translationX");
        this.debug.ui
            .add(this.debugObject, "translationY")
            .min(-20)
            .max(20)
            .step(0.1)
            .name("translationY");
        this.debug.ui
            .add(this.debugObject, "translationZ")
            .min(-20)
            .max(20)
            .step(0.1)
            .name("translationZ");
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    update() {}
}
