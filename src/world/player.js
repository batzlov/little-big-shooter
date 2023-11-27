import * as THREE from "three";
import * as CANNON from "cannon-es";

import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

import Experience from "../core/experience";
import Bullet from "./bullet";

export default class Player {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.characterSoldierModel;
        this.world = this.experience.world;
        this.inputHandler = this.experience.inputHandler;
        this.soundHandler = this.experience.soundHandler;
        this.physicsWorld = this.experience.physicsWorld;
        this.time = this.experience.time;
        this.clock = this.experience.clock;
        this.camera = this.experience.camera;
        this.debug = this.experience.debug;

        this.bulletRotation = new THREE.Euler();
        this.bulletsPerMagazine = 45;
        this.bulletsLeft = this.bulletsPerMagazine;

        this.health = 100;
        this.hitCost = 5;
        this.lastHit = new Date().getTime();
        this.regainHealthAfter = 5000;
        this.isDead = false;

        this.bullets = [];
        this.bulletBodys = [];
        this.bulletMeshes = [];

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

        this.initPhysics();
        this.initModel();
        this.initAnimations();

        // input handling
        this.keysPressed = this.experience.inputHandler.keysPressed;
        this.mouseKeysPressed = this.experience.inputHandler.mouseKeysPressed;

        this.inputHandler.on("shoot", () => {
            if (!this.inputHandler.lockPointer) {
                return;
            }

            this.soundHandler.playShootSound();
            this.shootBullet();
        });

        this.inputHandler.on("reload", () => {
            if (!this.inputHandler.lockPointer) {
                return;
            }

            this.experience.hideReloadInfo();
            this.soundHandler.playReloadSound();
            this.bulletsLeft = this.bulletsPerMagazine;

            setTimeout(() => {
                const bulletLeftInfo =
                    this.experience.weaponInfo.querySelector("#bullets-left");
                bulletLeftInfo.innerHTML = this.bulletsLeft;
            }, 1800);
        });

        this.body.addEventListener("collide", (event) => {
            if (event.body.isBullet && event.body.shotByEnemy) {
                this.regainHealth();

                if (this.health > 0) {
                    this.health -= this.hitCost;
                    this.lastHit = new Date().getTime();
                    this.experience.healthInfo.querySelector(
                        "#health-left"
                    ).innerHTML = this.health;
                }

                if (this.health == 0) {
                    clearInterval(this.regainHealthInterval);
                    this.experience.isPaused = true;
                    this.isDead = true;
                    this.soundHandler.backgroundSound.stop();
                    this.experience.gameOver();
                }

                if (this.soundHandler.currentlyPlaying() !== "hurtSound") {
                    this.soundHandler.playHurtSound();
                }
            }
        });
    }

    initModel() {
        this.model = this.resource.scene;
        this.model.position.y = 0.01;
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
        const radius = 1.0;
        this.shape = new CANNON.Sphere(radius);
        this.body = new CANNON.Body({
            mass: 500,
            position: new CANNON.Vec3(0, 0, 0),
            shape: this.shape,
            material: new CANNON.Material("physics"),
            linearDamping: 0.9,
        });

        this.physicsWorld.instance.addBody(this.body);
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

            // get the name of the key
            this.animation.previousActionName = Object.keys(
                this.animation.actions
            ).find((key) => {
                return this.animation.actions[key] === oldAction;
            });

            newAction.reset();
            newAction.play();
            newAction.crossFadeFrom(oldAction, 0.5);

            this.animation.actions.current = newAction;
        };
    }

    regainHealth() {
        if (this.health === 100) {
            return;
        }

        this.regainHealthInterval = setInterval(() => {
            const now = new Date().getTime();
            if (
                this.health === 100 ||
                now - this.lastHit < this.regainHealthAfter
            ) {
                return;
            }

            this.health += 5;
            this.experience.healthInfo.querySelector("#health-left").innerHTML =
                this.health;
        }, 3000);
    }

    getShootDirection() {
        const vector = new THREE.Vector3(0, 0, 1);
        vector.unproject(this.camera.instance);
        const ray = new THREE.Ray(
            this.body.position,
            vector.sub(this.body.position).normalize()
        );

        return ray.direction;
    }

    shootBullet() {
        if (this.bulletsLeft === 0) {
            this.soundHandler.playEmptySound();
            return;
        }

        const bullet = new Bullet();
        const shootDirection = this.getShootDirection();

        const x =
            this.body.position.x +
            shootDirection.x *
                (this.body.shapes[0].radius * 1.02 +
                    bullet.body.shapes[0].radius);
        const y =
            this.body.position.y +
            shootDirection.y *
                (this.body.shapes[0].radius * 1.02 +
                    bullet.body.shapes[0].radius) +
            (this.camera.instance.position.y - 0.2);

        const z =
            this.body.position.z +
            shootDirection.z *
                (this.body.shapes[0].radius * 1.02 +
                    bullet.body.shapes[0].radius);

        const bulletPosition = new THREE.Vector3(x, y, z);
        bullet.updatePosition(bulletPosition);
        bullet.updateRotation(this.bulletRotation);

        this.bullets.push(bullet);

        const shootVelocity = 50;
        bullet.body.velocity.set(
            shootDirection.x * shootVelocity,
            // smaller values so the bullet flies more straight
            // shootDirection.y * (shootVelocity / 4),
            0,
            shootDirection.z * shootVelocity
        );

        this.bulletsLeft--;

        const bulletLeftInfo =
            this.experience.weaponInfo.querySelector("#bullets-left");
        bulletLeftInfo.innerHTML = this.bulletsLeft;
    }

    update() {
        if (this.bulletsLeft < 5) {
            this.experience.showReloadInfo();
        }

        if (
            this.inputHandler.mouseKeysPressed.left &&
            this.inputHandler.mouseKeysPressed.leftPressedClock.getElapsedTime() >
                0.1 &&
            this.time.delta >= 17
        ) {
            if (this.soundHandler.currentlyPlaying() !== "burstSound") {
                this.soundHandler.playBurstSound();
            }

            this.shootBullet();
        } else if (
            this.soundHandler.currentlyPlaying() === "burstSound" &&
            !this.inputHandler.mouseKeysPressed.left
        ) {
            this.soundHandler.stop();
        }

        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].destroyed) {
                this.bullets.splice(i, 1);
            } else {
                this.bullets[i].update();
            }
        }

        const directions = ["w", "a", "s", "d"];
        const directionIsPressed = directions.some(
            (key) => this.keysPressed[key] == true
        );

        // set the right animation
        if (
            this.mouseKeysPressed.left &&
            this.animation.actions.current !==
                this.animation.actions.idleShoot &&
            this.bulletsLeft > 0
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
    }

    isCurrentlyReloading() {
        return this.soundHandler.currentlyPlaying() === "reloadSound";
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
