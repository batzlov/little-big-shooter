import * as THREE from "three";

import Experience from "../core/experience";

export default class Player {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.characterSoldierModel;
        this.time = this.experience.time;
        this.clock = this.experience.clock;
        this.camera = this.experience.camera;
        this.keysPressed = this.experience.keyEventHandler.keysPressed;

        // TODO: implement player movement
        this.walkDirection = new THREE.Vector3(0, 0, 0);
        this.rotateAngle = new THREE.Vector3(0, 1, 0);
        this.rotateQuaternion = new THREE.Quaternion();
        this.cameraTarget = new THREE.Vector3();
        this.fadeDuration = 0.2;
        this.velocity = 5;

        this.initModel();
        this.initAnimations();
    }

    initModel() {
        this.model = this.resource.scene;
        // this.model.scale.set(0.7, 0.7, 0.7);
        this.model.position.y = 0.01;
        this.model.rotation.y = Math.PI;
        this.scene.add(this.model);
    }

    initAnimations() {
        this.animation = {};

        this.animation.mixer = new THREE.AnimationMixer(this.model);
        this.animation.actions = {};

        this.animation.actions.death = this.animation.mixer.clipAction(
            this.resource.animations[0]
        );
        this.animation.actions.duck = this.animation.mixer.clipAction(
            this.resource.animations[1]
        );
        this.animation.actions.hitReact = this.animation.mixer.clipAction(
            this.resource.animations[2]
        );
        this.animation.actions.idle = this.animation.mixer.clipAction(
            this.resource.animations[3]
        );
        this.animation.actions.idleShoot = this.animation.mixer.clipAction(
            this.resource.animations[4]
        );
        this.animation.actions.jump = this.animation.mixer.clipAction(
            this.resource.animations[5]
        );
        this.animation.actions.jumpIdle = this.animation.mixer.clipAction(
            this.resource.animations[6]
        );
        this.animation.actions.jumpLand = this.animation.mixer.clipAction(
            this.resource.animations[7]
        );
        this.animation.actions.no = this.animation.mixer.clipAction(
            this.resource.animations[8]
        );
        this.animation.actions.punch = this.animation.mixer.clipAction(
            this.resource.animations[9]
        );
        this.animation.actions.run = this.animation.mixer.clipAction(
            this.resource.animations[10]
        );
        this.animation.actions.runGun = this.animation.mixer.clipAction(
            this.resource.animations[11]
        );
        this.animation.actions.wave = this.animation.mixer.clipAction(
            this.resource.animations[12]
        );
        this.animation.actions.yes = this.animation.mixer.clipAction(
            this.resource.animations[13]
        );

        this.animation.actions.current = this.animation.actions.idle;
        this.animation.actions.current.play();

        this.animation.play = (name) => {
            const newAction = this.animation.actions[name];
            const oldAction = this.animation.actions.current;

            newAction.reset();
            newAction.play();
            newAction.crossFadeFrom(oldAction, 1);

            this.animation.actions.current = newAction;
        };
    }

    update() {
        const directions = ["w", "a", "s", "d"];
        const diagonalDirections = ["wa", "wd", "sa", "sd"];
        const directionIsPressed = directions.some(
            (key) => this.keysPressed[key] == true
        );
        const diagonalDirectionIsPressed = diagonalDirections.some(
            (key) => this.keysPressed[key] == true
        );

        // set the right animation
        if (
            directionIsPressed &&
            this.animation.actions.current !== this.animation.actions.run
        ) {
            this.animation.play("run");
        } else if (
            !directionIsPressed &&
            this.animation.actions.current !== this.animation.actions.idle
        ) {
            this.animation.play("idle");
        }

        this.animation.mixer.update(this.time.delta * 0.001);

        if (!directionIsPressed) {
            return;
        }

        const clockDelta = this.clock.getDelta();

        const angleYCameraDirection = Math.atan2(
            this.camera.instance.position.x - this.model.position.x,
            this.camera.instance.position.z - this.model.position.z
        );
        const directionOffset = this.directionOffset(this.keysPressed);

        this.rotateQuaternion.setFromAxisAngle(
            this.rotateAngle,
            angleYCameraDirection + directionOffset * -1 // this fixes left and right
        );
        this.model.quaternion.rotateTowards(this.rotateQuaternion, 0.2);

        this.camera.instance.getWorldDirection(this.walkDirection);
        this.walkDirection.y = 0;
        this.walkDirection.normalize();
        this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

        const moveX = this.walkDirection.x * this.velocity * clockDelta;
        const moveZ = -this.walkDirection.z * this.velocity * clockDelta;
        this.model.position.x += moveX;
        this.model.position.z += moveZ;
        this.updateCameraTarget(moveX, moveZ);
    }

    updateCameraTarget(moveX, moveZ) {
        // move camera
        this.camera.instance.position.x += moveX;
        this.camera.instance.position.z += moveZ;

        // update camera target
        this.cameraTarget.x = this.model.position.x;
        this.cameraTarget.y = this.model.position.y + 1;
        this.cameraTarget.z = this.model.position.z;
        this.camera.controls.target = this.cameraTarget;
    }

    directionOffset(keysPressed = {}) {
        var directionOffset = 0;

        if (keysPressed.w && keysPressed.a) {
            directionOffset = Math.PI / 4 + Math.PI / 2;
        } else if (keysPressed.w && keysPressed.d) {
            directionOffset = -Math.PI / 4 - Math.PI / 2;
        } else if (keysPressed.s && keysPressed.a) {
            directionOffset = Math.PI / 4;
        } else if (keysPressed.s && keysPressed.d) {
            directionOffset = -Math.PI / 4;
        } else if (keysPressed.w) {
            directionOffset = Math.PI; // w and s are changed from default
        } else if (keysPressed.s) {
            directionOffset = 0;
        } else if (keysPressed.a) {
            directionOffset = Math.PI / 2;
        } else if (keysPressed.d) {
            directionOffset = -Math.PI / 2;
        }

        return directionOffset;
    }
}
