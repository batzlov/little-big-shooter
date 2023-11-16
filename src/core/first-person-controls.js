import * as THREE from "three";
import * as CANNON from "cannon-es";

import Experience from "./experience";

export default class FirstPersonControls extends THREE.EventDispatcher {
    constructor(camera, playerBody) {
        super();

        this.camera = camera;
        this.playerBody = playerBody;

        this.experience = new Experience();
        this.inputHandler = this.experience.inputHandler;

        this.mouseEnabled = true;
        this.velocityFactor = 0.2;
        this.jumpVelocity = 10;

        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(camera);

        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = 2;
        this.yawObject.add(this.pitchObject);

        this.quaternion = new THREE.Quaternion();

        this.canJump = false;

        this.velocity = this.playerBody.velocity;
        this.inputVelocity = new THREE.Vector3();
        this.euler = new THREE.Euler();

        this.initHandleJumping();

        this.lockEvent = { type: "lock" };
        this.unlockEvent = { type: "unlock" };
        this.lockPointer = false;
        document.addEventListener(
            "pointerlockchange",
            this.onPointerlockChange
        );
        document.addEventListener("pointerlockerror", this.onPointerlockError);
    }

    initHandleJumping() {
        const contactNormal = new CANNON.Vec3();
        const upAxis = new CANNON.Vec3(0, 1, 0);
        this.playerBody.addEventListener("collide", (event) => {
            const { contact } = event;

            if (contact.bi.id === this.playerBody.id) {
                contact.ni.negate(contactNormal);
            } else {
                contactNormal.copy(contact.ni);
            }

            if (contactNormal.dot(upAxis) > 0.5) {
                this.canJump = true;
            }
        });
    }

    getObject() {
        return this.yawObject;
    }

    getDirection() {
        const vector = new CANNON.Vec3(0, 0, -1);
        vector.applyQuaternion(this.quaternion);
        return vector;
    }

    update(delta) {
        if (!this.inputHandler.lockPointer) {
            return;
        }
        console.log(this.inputHandler.lockPointer);

        if (this.inputHandler.lockPointer !== this.lockPointer) {
            this.lockPointer = this.inputHandler.lockPointer;

            if (this.lockPointer) {
                this.lock();
            } else {
                this.unlock();
            }
        }

        this.updateRotation();

        this.inputVelocity.set(0, 0, 0);
        delta *= 1000;
        delta *= 0.1;

        const { left, right, forward, backward, up } =
            this.inputHandler.movements;

        if (forward) {
            this.inputVelocity.z = -this.velocityFactor * delta;
        }

        if (backward) {
            this.inputVelocity.z = this.velocityFactor * delta;
        }

        if (left) {
            this.inputVelocity.x = -this.velocityFactor * delta;
        }

        if (right) {
            this.inputVelocity.x = this.velocityFactor * delta;
        }

        if (up && this.canJump) {
            this.velocity.y = this.jumpVelocity;
            this.canJump = false;
        }

        this.euler.x = this.pitchObject.rotation.x;
        this.euler.y = this.yawObject.rotation.y;
        this.euler.order = "XYZ";
        this.quaternion.setFromEuler(this.euler);
        this.inputVelocity.applyQuaternion(this.quaternion);

        this.velocity.x += this.inputVelocity.x;
        this.velocity.z += this.inputVelocity.z;

        this.yawObject.position.copy(this.playerBody.position);
    }

    updateRotation() {
        if (!this.mouseEnabled) {
            return;
        }

        const { movementX, movementY } = this.inputHandler.mouseMovements;

        this.yawObject.rotation.y -= movementX * 0.002;
        this.pitchObject.rotation.x -= movementY * 0.002;

        this.pitchObject.rotation.x = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, this.pitchObject.rotation.x)
        );
    }

    // TODO: not the right place
    lock() {
        document.body.requestPointerLock();
    }

    unlock() {
        document.exitPointerLock();
    }

    onPointerlockChange = () => {
        if (document.pointerLockElement) {
            this.dispatchEvent(this.lockEvent);

            this.isLocked = true;
        } else {
            this.dispatchEvent(this.unlockEvent);

            this.isLocked = false;
        }
    };

    onPointerlockError = () => {
        console.error("Unable to use Pointer Lock-API");
    };
}
