import * as THREE from "three";
import * as CANNON from "cannon-es";
import Experience from "./experience.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

        // first person view
        this.rotation = new THREE.Quaternion();
        this.translation = new THREE.Vector3(0, 1.5, 15);
        this.phi = 0;
        this.phiSpeed = 6;
        this.theta = 0;
        this.thetaSpeed = 5;
        this.headBobActive = false;
        this.headBobTimer = 0;

        if (this.debug.active) {
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

        this.initInstance();
        this.initPhysics();
        this.initControls();
        // this.initControls();
    }

    initInstance() {
        this.instance = new THREE.PerspectiveCamera(
            90,
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
        this.instance.rotation.reorder("YXZ");
        // this.instance.rotation.y = 2 * Math.PI;

        this.scene.add(this.instance);
    }

    initPhysics() {
        this.shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
        this.body = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(
                this.translation.x,
                this.translation.y,
                this.translation.z
            ),
            shape: this.shape,
            material: new CANNON.Material("physics"),
            linearDamping: 0.9,
        });

        this.physicsWorld.instance.addBody(this.body);

        this.body.addEventListener("collide", (event) => {
            console.log("collided");
        });
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
    }

    updateCamera() {
        this.body.quaternion.copy(this.rotation);
        this.body.velocity.set(
            this.translation.x,
            this.translation.y,
            this.translation.z
        );
        this.body.position.copy(this.translation);

        this.instance.quaternion.copy(this.body.quaternion);
        this.instance.position.copy(this.body.position);
    }

    clamp(x, a, b) {
        return Math.min(Math.max(x, a), b);
    }
}
