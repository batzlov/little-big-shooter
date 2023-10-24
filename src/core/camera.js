import * as THREE from "three";
import Experience from "./experience.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Camera {
    constructor() {
        this.experience = new Experience();

        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.time = this.experience.time;
        this.inputHandler = this.experience.inputHandler;

        // first person view
        this.rotation = new THREE.Quaternion();
        this.translation = new THREE.Vector3(0, 1.8, 15);
        this.phi = 0;
        this.phiSpeed = 6;
        this.theta = 0;
        this.thetaSpeed = 5;
        this.headBobActive = false;
        this.headBobTimer = 0;

        this.initInstance();
        // this.initControls();
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
        this.instance.position.set(
            this.translation.x,
            this.translation.y,
            this.translation.z
        );
        // this.instance.rotation.y = 2 * Math.PI;

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
        this.updateRotation();
        this.updateTranslation();
        this.updateCamera();
        // this.controls.update();
    }

    updateRotation() {
        const xh =
            this.inputHandler.currentMouseState.mouseXDelta /
            window.innerHeight;
        const yh =
            this.inputHandler.currentMouseState.mouseYDelta /
            window.innerHeight;

        this.phi += -xh * this.phiSpeed;
        this.theta = this.clamp(
            this.theta + -yh * this.thetaSpeed,
            -Math.PI / 3,
            Math.PI / 3
        );

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
        const qz = new THREE.Quaternion();
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta);

        const q = new THREE.Quaternion();
        q.multiply(qx);
        q.multiply(qz);

        this.rotation.copy(q);
    }

    updateTranslation() {
        if (Object.keys(this.inputHandler.keysPressed).length === 0) {
            return;
        }

        const forwardVelocity =
            (this.inputHandler.keysPressed.w ? 1 : 0) +
            (this.inputHandler.keysPressed.s ? -1 : 0);
        const strafeVelocity =
            (this.inputHandler.keysPressed.a ? 1 : 0) +
            (this.inputHandler.keysPressed.d ? -1 : 0);

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);

        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(qx);
        forward.multiplyScalar(forwardVelocity * this.time.delta * 0.001 * 10);

        const left = new THREE.Vector3(-1, 0, 0);
        left.applyQuaternion(qx);
        left.multiplyScalar(strafeVelocity * this.time.delta * 0.001 * 10);

        this.translation.add(forward);
        this.translation.add(left);

        // const forwardVelocity =
        //     (this.input_.key(KEYS.w) ? 1 : 0) +
        //     (this.input_.key(KEYS.s) ? -1 : 0);
        // const strafeVelocity =
        //     (this.input_.key(KEYS.a) ? 1 : 0) +
        //     (this.input_.key(KEYS.d) ? -1 : 0);

        // const qx = new THREE.Quaternion();
        // qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);

        // const forward = new THREE.Vector3(0, 0, -1);
        // forward.applyQuaternion(qx);
        // forward.multiplyScalar(forwardVelocity * timeElapsedS * 10);

        // const left = new THREE.Vector3(-1, 0, 0);
        // left.applyQuaternion(qx);
        // left.multiplyScalar(strafeVelocity * timeElapsedS * 10);

        // this.translation_.add(forward);
        // this.translation_.add(left);

        // if (forwardVelocity != 0 || strafeVelocity != 0) {
        //     this.headBobActive_ = true;
        // }
    }

    updateCamera() {
        this.instance.quaternion.copy(this.rotation);
        this.instance.position.copy(this.translation);
    }

    clamp(x, a, b) {
        return Math.min(Math.max(x, a), b);
    }
}
