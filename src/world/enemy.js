import * as THREE from "three";
import * as CANNON from "cannon-es";
import * as YUKA from "yuka";
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
        this.yukaEntityManager = this.experience.yukaEntityManager;
        this.physicsWorld = this.experience.physicsWorld;
        this.player = this.experience.player;
        this.time = this.experience.time;
        this.clock = this.experience.clock;
        this.camera = this.experience.camera;
        this.debug = this.experience.debug;

        this.health = 100;
        this.isDeath = false;

        this.initModel();
        this.initPhysics();
        this.initYukaVehicle();
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
        this.model.matrixAutoUpdate = false;

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
        // random speed between 1 and 4
        this.vehicle.maxSpeed = Math.random() * (4 - 1) + 1;

        this.vehicle.setRenderComponent(this.model, this.sync);
        this.vehicle.smoother = new YUKA.Smoother(5);

        this.yukaEntityManager.add(this.vehicle);

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

        this.animation.actions.current = this.animation.actions.run;
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
