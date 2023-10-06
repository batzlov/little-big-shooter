import * as THREE from "three";
import Experience from "./experience.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Camera {
    constructor() {
        this.experience = new Experience();

        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;

        this.initInstance();
        this.initControls();
    }

    initInstance() {
        this.instance = new THREE.PerspectiveCamera(
            75,
            this.sizes.width / this.sizes.height,
            0.1,
            1000
        );
        // third person camera
        // this.instance.position.set(0, 8, 10);

        // first person camera
        this.instance.position.set(0, 1.7, -0.15);

        this.scene.add(this.instance);
    }

    initControls() {
        this.controls = new OrbitControls(this.instance, this.canvas);
        this.controls.enableDamping = true;
        this.controls.target.y += 1;
        this.controls.target.z -= 2;

        // orbit control can be used for debugging
        this.controls.enabled = false;
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    update() {
        this.controls.update();
    }
}
