import * as THREE from "three";
import * as CANNON from "cannon-es";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

import Experience from "../core/experience.js";

export default class Enemy {
    constructor(position) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.position = position;
        this.resource = this.resources.items.characterEnemyModel;
        this.world = this.experience.world;
        this.inputHandler = this.experience.inputHandler;
        this.soundHandler = this.experience.soundHandler;
        this.physicsWorld = this.experience.physicsWorld;
        this.time = this.experience.time;
        this.clock = this.experience.clock;
        this.camera = this.experience.camera;
        this.debug = this.experience.debug;

        this.health = 100;
        this.isDeath = false;

        this.initModel();
        this.initPhysics();
        this.initAnimations();

        this.body.addEventListener("collide", (event) => {
            if (event.body.isBullet) {
                this.health -= 10;

                if (this.health <= 0) {
                    this.animation.play("death", false);

                    setTimeout(() => {
                        this.model.visible = false;
                        this.isDeath = true;
                    }, this.animation.actions.current._clip.duration * 1000 + 200);

                    return;
                }

                if (this.animation.actions.current.name == "hitReact") {
                    return;
                }

                this.animation.play("hitReact");

                setTimeout(() => {
                    this.animation.play("idle");
                }, 150);
            }
        });
    }

    initModel() {
        // clone model using skeleton utils
        this.model = SkeletonUtils.clone(this.resource.scene);

        this.model.position.copy(this.position);

        this.scene.add(this.model);
    }

    initPhysics() {
        const size = new THREE.Vector3(1, 2.4, 1);
        this.shape = new CANNON.Box(
            new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
        );
        this.body = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(
                this.position.x,
                this.position.y + size.y / 2,
                this.position.z
            ),
            shape: this.shape,
            linearDamping: 0.01,
            angularDamping: 0.01,
        });

        this.physicsWorld.instance.addBody(this.body);
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
            this.resource.animations[5]
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

        this.animation.actions.current = this.animation.actions.idle;
        this.animation.actions.current.play();

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
        };
    }

    update() {
        this.model.position.copy(this.body.position);
        this.model.position.y -= 1.2;

        this.model.quaternion.copy(this.body.quaternion);

        this.animation.mixer.update(this.time.delta * 0.001);
    }
}
