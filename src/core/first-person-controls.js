import * as THREE from "three";
import * as CANNON from "cannon-es";

import Experience from "./experience";

export default class FirstPersonControls extends THREE.EventDispatcher {
    constructor(camera, player) {
        super();

        this.camera = camera;
        this.player = player;
        this.playerBody = player.body;

        this.experience = new Experience();
        this.resources = this.experience.resources;
        this.renderer = this.experience.renderer;
        this.scene = this.experience.scene;
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

        this.initCrosshair();
        this.initPlayer();
        // this.initWeapon();
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

    async initCrosshair() {
        const crosshairTexture = await this.resources.textureLoaderAsync(
            "crosshair.png"
        );
        crosshairTexture.anisotropy =
            this.renderer.instance.capabilities.getMaxAnisotropy();

        this.crosshair = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: crosshairTexture,
                color: 0xffffff,
                fog: false,
                depthTest: false,
                depthWrite: false,
            })
        );
        this.crosshair.scale.set(0.5, 0.5, 0.5);

        this.scene.add(this.crosshair);
    }

    initPlayer() {
        this.player.model.position.y = 0;
        this.pitchObject.add(this.player.model);
    }

    async initWeapon() {
        const weaponModel = await this.resources.gltfLoaderAsync(
            "models/toon-shooter-game-kit/ak47.glb"
        );
        weaponModel.scene.rotation.y += 1.5 * Math.PI;

        weaponModel.scene.position.x = 0.25;
        weaponModel.scene.position.y -= 0.5;
        weaponModel.scene.position.z = -0.5;

        this.scene.add(weaponModel.scene);
        this.pitchObject.add(weaponModel.scene);
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

        const pitchObjectCameraIndex = 0;
        const pitchObjectPlayerIndex = 1;
        if (this.player.isCurrentlyReloading()) {
            this.pitchObject.children[pitchObjectPlayerIndex].visible = false;
        } else if (!this.pitchObject.children[1].visible) {
            this.pitchObject.children[pitchObjectPlayerIndex].visible = true;
        }

        // FIXME: update camera position when moving, so we dont have glitching
        let positionVectorMovement = new THREE.Vector3(
            this.pitchObject.children[pitchObjectCameraIndex].position.x,
            1.55,
            this.pitchObject.children[pitchObjectCameraIndex].position.z
        );
        let positionVectorIdle = new THREE.Vector3(
            this.pitchObject.children[pitchObjectCameraIndex].position.x,
            1.45,
            this.pitchObject.children[pitchObjectCameraIndex].position.z
        );
        if (forward || backward || left || right) {
            this.pitchObject.children[pitchObjectCameraIndex].position.lerp(
                positionVectorMovement,
                0.3
            );
        } else {
            this.pitchObject.children[pitchObjectCameraIndex].position.lerp(
                positionVectorIdle,
                0.3
            );
        }

        if (this.crosshair) {
            this.updateCrosshair();
        }
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

        this.player.bulletRotation.y = this.yawObject.rotation.y;
        this.player.bulletRotation.x = this.pitchObject.rotation.x;
    }

    updateCrosshair() {
        const target = new THREE.Vector3(0, 0, -12)
            .applyQuaternion(this.pitchObject.quaternion)
            .applyQuaternion(this.yawObject.quaternion)
            .add(this.playerBody.position);

        this.crosshair.position.x = target.x;
        this.crosshair.position.y = target.y;
        this.crosshair.position.z = target.z;

        this.player.crosshairPosition = this.crosshair.position;
    }

    // TODO: not the right place
    lock() {
        document.body.requestPointerLock();
        document.body.style.cursor = "none";
    }

    unlock() {
        document.exitPointerLock();
        document.body.style.cursor = "default";
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
