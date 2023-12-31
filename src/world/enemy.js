import * as THREE from "three";
import * as CANNON from "cannon-es";
import * as YUKA from "yuka";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

import Experience from "../core/experience.js";

import Bullet from "./bullet.js";

export default class Enemy {
    constructor(position, obstacles) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.position = position;
        this.obstacles = obstacles;
        this.resource = this.resources.items.characterEnemyModel;
        this.world = this.experience.world;
        this.inputHandler = this.experience.inputHandler;
        this.soundHandler = this.experience.soundHandler;
        this.yukaEntityManager = this.experience.yukaEntityManager;
        this.physicsWorld = this.experience.physicsWorld;
        this.player = this.experience.player;
        this.time = this.experience.time;
        this.clock = this.experience.clock;
        this.camera = this.experience.camera;
        this.debug = this.experience.debug;

        this.health = 100;
        this.isDeath = false;
        this.maxVelocity = Math.floor(Math.random() * 3) + 6;
        this.bullets = [];

        this.lastShotFired = new Date().getTime();
        // 600 shots per minute
        this.shotFrequency = 60000 / 200;

        this.initModel();
        this.initPhysics();
        this.initYukaVehicle();
        this.initAnimations();

        this.body.addEventListener("collide", (event) => {
            if (event.body.isBullet && !event.body.shotByEnemy) {
                this.health -= 10;

                if (this.health <= 0) {
                    this.animation.play("death", false);

                    setTimeout(() => {
                        this.model.visible = false;
                        this.isDeath = true;
                        this.soundHandler.backgroundSound.stop();
                    }, this.animation.actions.current._clip.duration * 1000 + 200);

                    return;
                }

                if (this.animation.actions.current.name == "hitReact") {
                    return;
                }

                this.animation.play("hitReact");

                setTimeout(() => {
                    this.animation.play("run");
                }, 150);
            }
        });
    }

    initModel() {
        // clone model using skeleton utils
        this.model = SkeletonUtils.clone(this.resource.scene);
        this.model.matrixAutoUpdate = false;

        this.model.position.copy(this.position);

        this.scene.add(this.model);
    }

    initPhysics() {
        const radius = 1.0;
        this.shape = new CANNON.Sphere(radius);
        this.body = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(
                this.position.x,
                this.position.y + 2.4 / 2,
                this.position.z
            ),
            shape: this.shape,
            material: new CANNON.Material("physics"),
            linearDamping: 0.9,
        });

        this.physicsWorld.instance.addBody(this.body);
    }

    initYukaVehicle() {
        this.path = new YUKA.Path();

        // start position of enemy
        this.path.add(
            new YUKA.Vector3(this.position.x, this.position.y, this.position.z)
        );

        // position of player
        this.path.add(
            new YUKA.Vector3(
                this.player.model.position.x,
                this.player.model.position.y,
                this.player.model.position.z
            )
        );

        this.vehicle = new YUKA.Vehicle();
        this.vehicle.position.copy(this.model.position);
        this.vehicle.maxSpeed = this.maxVelocity;

        this.vehicle.setRenderComponent(this.model, this.sync);
        this.vehicle.smoother = new YUKA.Smoother(5);

        this.yukaEntityManager.add(this.vehicle);

        this.obstacleAvoidanceBehavior = new YUKA.ObstacleAvoidanceBehavior(
            this.obstacles
        );
        this.vehicle.steering.add(this.obstacleAvoidanceBehavior);

        this.followPathBehavior = new YUKA.FollowPathBehavior(this.path);
        this.vehicle.steering.add(this.followPathBehavior);
    }

    initAnimations() {
        this.animation = {};

        this.animation.mixer = new THREE.AnimationMixer(this.model);
        this.animation.actions = {};

        this.animation.actions.death = this.animation.mixer.clipAction(
            this.resource.animations[1]
        );
        this.animation.actions.duck = this.animation.mixer.clipAction(
            this.resource.animations[2]
        );
        this.animation.actions.hitReact = this.animation.mixer.clipAction(
            this.resource.animations[3]
        );
        this.animation.actions.idle = this.animation.mixer.clipAction(
            this.resource.animations[0]
        );
        this.animation.actions.idleShoot = this.animation.mixer.clipAction(
            this.resource.animations[4]
        );
        this.animation.actions.jump = this.animation.mixer.clipAction(
            this.resource.animations[6]
        );
        this.animation.actions.jumpIdle = this.animation.mixer.clipAction(
            this.resource.animations[7]
        );
        this.animation.actions.jumpLand = this.animation.mixer.clipAction(
            this.resource.animations[8]
        );
        this.animation.actions.no = this.animation.mixer.clipAction(
            this.resource.animations[9]
        );
        this.animation.actions.punch = this.animation.mixer.clipAction(
            this.resource.animations[10]
        );
        this.animation.actions.run = this.animation.mixer.clipAction(
            this.resource.animations[11]
        );
        this.animation.actions.runGun = this.animation.mixer.clipAction(
            this.resource.animations[12]
        );
        this.animation.actions.wave = this.animation.mixer.clipAction(
            this.resource.animations[13]
        );
        this.animation.actions.yes = this.animation.mixer.clipAction(
            this.resource.animations[14]
        );

        this.animation.play = (name, loop = true) => {
            const newAction = this.animation.actions[name];
            const oldAction = this.animation.actions.current;

            if (!loop) {
                newAction.loop = THREE.LoopOnce;
            }

            newAction.reset();
            newAction.play();
            newAction.crossFadeFrom(oldAction, 0.5);

            this.animation.actions.current = newAction;
            this.animation.actions.currentName = name;
        };

        this.animation.actions.current = this.animation.actions.run;
        this.animation.play("run");
    }

    shoot() {
        if (this.experience.isPaused) {
            return;
        }

        // get shooting direction from model position and player body position
        const shootDirection = new THREE.Vector3();
        shootDirection
            .subVectors(this.player.body.position, this.vehicle.position)
            .normalize();

        const bullet = new Bullet({ x: 0, y: 0, z: 0 }, true);

        const x =
            this.vehicle.position.x +
            shootDirection.x *
                (this.body.shapes[0].radius * 1.02 +
                    bullet.body.shapes[0].radius);
        const y =
            this.vehicle.position.y +
            shootDirection.y *
                (this.body.shapes[0].radius * 1.02 +
                    bullet.body.shapes[0].radius) +
            (this.camera.instance.position.y - 0.2);

        const z =
            this.vehicle.position.z +
            shootDirection.z *
                (this.body.shapes[0].radius * 1.02 +
                    bullet.body.shapes[0].radius);

        const bulletPosition = new THREE.Vector3(x, y, z);
        bullet.updatePosition(bulletPosition);

        // handle rotation of bullet
        bullet.model.lookAt(
            new THREE.Vector3(
                this.player.body.position.x,
                this.player.body.position.y,
                this.player.body.position.z
            )
        );
        bullet.model.rotation.y += Math.PI;

        this.bullets.push(bullet);

        const shootVelocity = 50;
        bullet.body.velocity.set(
            shootDirection.x * shootVelocity,
            // smaller values so the bullet flies more straight
            // shootDirection.y * (shootVelocity / 4),
            0,
            shootDirection.z * shootVelocity
        );
    }

    update() {
        const distanceToPlayer = this.vehicle.position.distanceTo(
            new THREE.Vector3(
                this.player.body.position.x,
                this.player.body.position.y,
                this.player.body.position.z
            )
        );
        const triggerActionDistance = 20;
        const stopWalkingDistance = 15;

        // TODO: needs some refactoring
        if (
            distanceToPlayer < triggerActionDistance &&
            this.animation.actions.current !== this.animation.actions.idleShoot
        ) {
            this.animation.play("idleShoot");
            this.soundHandler.playBackgroundSound(
                this.resources.items.burstSound
            );
        } else if (distanceToPlayer < stopWalkingDistance) {
            this.vehicle.velocity.set(
                this.vehicle.velocity.x * 0.1,
                this.vehicle.velocity.y,
                this.vehicle.velocity.z * 0.1
            );

            const now = new Date().getTime();
            if (now - this.lastShotFired > this.shotFrequency) {
                this.shoot();
                this.lastShotFired = now;
            }
        } else if (
            distanceToPlayer > triggerActionDistance &&
            this.animation.actions.current !== this.animation.actions.run
        ) {
            this.animation.play("run");
            this.vehicle.maxSpeed = this.maxVelocity;
            this.soundHandler.backgroundSound.stop();
        }

        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].destroyed) {
                this.bullets.splice(i, 1);
            } else {
                this.bullets[i].update();
            }
        }

        this.body.position.x = this.vehicle.position.x;
        this.body.position.z = this.vehicle.position.z;

        // update path to follow player
        this.path._waypoints[0].x = this.model.position.x;
        this.path._waypoints[0].z = this.model.position.z;
        this.path._waypoints[1].x = this.player.body.position.x;
        this.path._waypoints[1].z = this.player.body.position.z;

        this.animation.mixer.update(this.time.delta * 0.001);
    }

    sync(entity, renderComponent) {
        renderComponent.matrix.copy(entity.worldMatrix);
    }
}
