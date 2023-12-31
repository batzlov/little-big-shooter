import * as THREE from "three";
import * as CANNON from "cannon-es";

import CannonDebugger from "cannon-es-debugger";
import Experience from "../core/experience.js";

import { level1 } from "../constants/levels.js";
import colors from "../constants/colors.js";

import Environment from "./environment.js";
import Ground from "./ground.js";
import Tree from "./tree.js";
import Obstacle from "./obstacle.js";
import MetalFence from "./metal-fence.js";
import Enemy from "./enemy.js";

export default class World {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.renderer = this.experience.renderer;
        this.resources = this.experience.resources;
        this.debug = this.experience.debug;
        this.time = this.experience.time;
        this.camera = this.experience.camera;
        this.physicsWorld = this.experience.physicsWorld;
        this.yukaEntityManager = this.experience.yukaEntityManager;
        this.firstPersonControls = this.experience.firstPersonControls;

        this.level = level1;
        this.initWorld();
    }

    initWorld() {
        this.ground = new Ground();
        this.environment = new Environment();

        this.obstacles = [];
        this.yukaObstacles = [];

        this.initSkybox();
        this.initWorldBoundaries();
        this.initTrees();
        this.initObstacles();
        this.initEnemies();
    }

    initPhysics() {
        this.physicsWorld = new CANNON.World();
        this.physicsWorld.instancegravity.set(0, -9.82, 0);
        this.physicsWorldDebugger = new CannonDebugger(
            this.scene,
            this.physicsWorld
        );
    }

    initSkybox() {
        this.scene.background = new THREE.Color(colors.skyBlue);
    }

    initWorldBoundaries() {
        const boundaries = new THREE.Box3().setFromObject(this.scene);
        const fenceParts = [];

        const fenceWidth = 3.54;

        const startX = boundaries.min.x;
        const endX = boundaries.max.x - fenceWidth;
        const startZ = boundaries.min.z;
        const endZ = boundaries.max.z - fenceWidth;

        for (let i = startX; i < endX; i += 3.54) {
            let fencePart = new MetalFence({
                x: i + fenceWidth / 2,
                y: 0,
                z: startZ,
            });
            fenceParts.push(fencePart);

            fencePart = new MetalFence(
                {
                    x: i + fenceWidth / 2,
                    y: 0,
                    z: -startZ,
                },
                {
                    x: 0,
                    y: Math.PI,
                    z: 0,
                }
            );
            fenceParts.push(fencePart);
        }

        for (let i = startZ; i < endZ; i += 3.54) {
            let fencePart = new MetalFence(
                {
                    x: startX,
                    y: 0,
                    z: i + fenceWidth / 2,
                },
                {
                    x: 0,
                    y: Math.PI / 2,
                    z: 0,
                }
            );
            fenceParts.push(fencePart);

            fencePart = new MetalFence(
                {
                    x: -startX,
                    y: 0,
                    z: i + fenceWidth / 2,
                },
                {
                    x: 0,
                    y: Math.PI / 2,
                    z: 0,
                }
            );
            fenceParts.push(fencePart);
        }
    }

    initTrees() {
        this.level.trees.forEach((treePosition) => {
            const tree = new Tree(treePosition);
            this.yukaObstacles.push(tree.yukaGameEntity);
            this.scene.add(tree.model);
        });
    }

    initObstacles() {
        this.level.obstacles.forEach((obstacle) => {
            const resourceName = obstacle.type + "Model";
            const ressource = this.resources.items[resourceName];

            const obstacleInstance = new Obstacle(
                ressource,
                obstacle.position,
                obstacle.rotation,
                obstacle.scale
            );
            this.obstacles.push(obstacleInstance);
            this.yukaObstacles.push(obstacleInstance.yukaGameEntity);
        });
    }

    initEnemies() {
        this.enemies = [];

        for (let i = 0; i < this.level.enemyCount; i++) {
            this.enemies.push(
                new Enemy(
                    {
                        x: this.randomNumber(-80, 80),
                        y: 0,
                        z: this.randomNumber(-80, 80),
                    },
                    this.yukaObstacles
                )
            );
        }
    }

    update() {
        if (this.experience.isPaused) {
            return;
        }

        if (this.obstacles) {
            this.obstacles.forEach((obstacle) => {
                if (obstacle.update) {
                    obstacle.update();
                }
            });
        }

        this.enemies.forEach((enemy) => {
            if (enemy.isDeath) {
                this.scene.remove(enemy.model);
                this.physicsWorld.instance.removeBody(enemy.body);
                this.yukaEntityManager.remove(enemy.vehicle);
                this.enemies.splice(this.enemies.indexOf(enemy), 1);
            }

            if (enemy.update) {
                enemy.update();
            }
        });

        if (this.enemies.length < this.level.enemyCount) {
            this.enemies.push(
                new Enemy({
                    x: this.randomNumber(-80, 80),
                    y: 0,
                    z: this.randomNumber(-80, 80),
                })
            );
        }
    }

    randomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }
}
