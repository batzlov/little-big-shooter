import * as THREE from "three";
import * as CANNON from "cannon";

import Experience from "../core/experience";

export default class Player {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.characterSoldierModel;
        this.world = this.experience.world;
        this.time = this.experience.time;
        this.clock = this.experience.clock;
        this.camera = this.experience.camera;
        this.debug = this.experience.debug;

        if (true) {
            this.debugFolder = this.debug.ui.addFolder("player");
            this.debugObject = {
                offsetX: 0,
                offsetY: -0.25,
                offsetZ: 0,
            };
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

        // TODO: implement player movement
        this.walkDirection = new THREE.Vector3(0, 0, 0);
        this.rotateAngle = new THREE.Vector3(0, 1, 0);
        this.rotateQuaternion = new THREE.Quaternion();
        this.cameraTarget = new THREE.Vector3();
        this.fadeDuration = 0.2;
        this.velocity = 5;

        this.initModel();
        this.initPhysics();
        this.initAnimations();
    }

    initModel() {
        this.model = this.resource.scene;
        this.model.position.y = 0.01;
        // this.model.position.y = 10;
        this.model.rotation.y = Math.PI;
        this.scene.add(this.model);

        // hide weapons that are initially visible
        this.hideModelPart("Revolver");
        this.hideModelPart("Revolver_Small");
        this.hideModelPart("Sniper");
        this.hideModelPart("Sniper_2");
        this.hideModelPart("Shotgun");
        this.hideModelPart("ShortCannon");
        this.hideModelPart("SMG");
        this.hideModelPart("Pistol");
        this.hideModelPart("GrenadeLauncher");
        this.hideModelPart("Shovel");
        this.hideModelPart("Knife_1");
        this.hideModelPart("Knife_2");
        this.hideModelPart("RocketLauncher");

        // hide character parts that disturbs the camera view
        this.hideModelPart("Head_2");
        this.hideModelPart("Head_3");
        this.hideModelPart("Head_4");
    }

    initPhysics() {
        this.shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
        this.body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 0, 0),
            shape: this.shape,
        });

        this.world.physicsWorld.addBody(this.body);
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

    update() {
        this.model.position.copy(this.camera.instance.position);

        const handleRotationOfPlayer = () => {
            // player offset
            this.model.position.y = this.debugObject.offsetY;
            this.model.position.z += this.debugObject.offsetZ;

            this.model.rotation.y = this.camera.instance.rotation.y + Math.PI;
        };
        handleRotationOfPlayer();

        const directions = ["w", "a", "s", "d"];
        const directionIsPressed = directions.some(
            (key) => this.keysPressed[key] == true
        );
        // set the right animation
        if (
            this.mouseKeysPressed.left &&
            this.animation.actions.current !== this.animation.actions.idleShoot
        ) {
            this.animation.play("idleShoot");
        } else if (
            directionIsPressed &&
            Object.keys(this.mouseKeysPressed).length === 0 &&
            this.animation.actions.current !== this.animation.actions.run
        ) {
            this.animation.play("run");
        } else if (
            !directionIsPressed &&
            Object.keys(this.mouseKeysPressed).length === 0 &&
            this.animation.actions.current !== this.animation.actions.idle
        ) {
            this.animation.play("idle");
        }

        this.animation.mixer.update(this.time.delta * 0.001);

        // copy physics
        this.body.position.copy(this.model.position);
    }

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
