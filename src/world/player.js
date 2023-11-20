import * as THREE from "three";
import * as CANNON from "cannon-es";

import Experience from "../core/experience";

export default class Player {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.ak47Model;
        this.world = this.experience.world;
        this.physicsWorld = this.experience.physicsWorld;
        this.firstPersonControls = this.experience.firstPersonControls;
        this.time = this.experience.time;
        this.clock = this.experience.clock;
        this.camera = this.experience.camera;
        this.debug = this.experience.debug;

        this.debugObject = {
            offsetX: 0,
            offsetY: -0.25,
            offsetZ: 0,
        };
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder("player");
            this.debugFolder
                .add(this.debugObject, "offsetX")
                .min(-10)
                .max(10)
                .step(0.01)
                .name("offsetX");
            this.debugFolder
                .add(this.debugObject, "offsetY")
                .min(-10)
                .max(10)
                .step(0.01)
                .name("offsetY");
            this.debugFolder
                .add(this.debugObject, "offsetZ")
                .min(-10)
                .max(10)
                .step(0.01)
                .name("offsetZ");
        }

        // input handling
        this.keysPressed = this.experience.inputHandler.keysPressed;
        this.mouseKeysPressed = this.experience.inputHandler.mouseKeysPressed;
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
            newAction.crossFadeFrom(oldAction, 0.5);

            this.animation.actions.current = newAction;
        };
    }

    update() {}

    hideModelPart(name) {
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.name.includes(name)) {
                    child.visible = false;
                }
            }
        });
    }

    showModelPart(name) {
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.name.includes(name)) {
                    child.visible = true;
                }
            }
        });
    }
}
