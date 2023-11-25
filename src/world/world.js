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
        this.firstPersonControls = this.experience.firstPersonControls;

        this.level = level1;
        this.initWorld();
    }

    initWorld() {
        this.ground = new Ground();
        this.environment = new Environment();

        this.obstacles = [];

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
        // TODO: replace with cube texture in the future
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

            fencePart = new MetalFence({
                x: i + fenceWidth / 2,
                y: 0,
                z: -startZ,
            });
            fencePart.model.rotation.y = Math.PI;
            fenceParts.push(fencePart);
        }

        for (let i = startZ; i < endZ; i += 3.54) {
            let fencePart = new MetalFence({
                x: startX,
                y: 0,
                z: i + fenceWidth / 2,
            });
            fencePart.model.rotation.y = Math.PI / 2;
            fenceParts.push(fencePart);

            fencePart = new MetalFence({
                x: -startX,
                y: 0,
                z: i + fenceWidth / 2,
            });
            fencePart.model.rotation.y = -Math.PI / 2;
            fenceParts.push(fencePart);
        }
    }

    initTrees() {
        this.level.trees.forEach((treePosition) => {
            const tree = new Tree(treePosition);
            this.scene.add(tree.model);
        });
    }

    initObstacles() {
        this.level.obstacles.forEach((obstacle) => {
            const resourceName = obstacle.type + "Model";
            const ressource = this.resources.items[resourceName];

            this.obstacles.push(
                new Obstacle(
                    ressource,
                    obstacle.position,
                    obstacle.rotation,
                    obstacle.scale
                )
            );
        });
    }

    initEnemies() {
        this.enemies = [];
        this.enemies.push(new Enemy({ x: 0, y: 0, z: -10 }));
        this.enemies.push(new Enemy({ x: 0, y: 0, z: -20 }));
        this.enemies.push(new Enemy({ x: 0, y: 0, z: -30 }));
    }

    update() {
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
                // remove body from physics world
                this.physicsWorld.instance.removeBody(enemy.body);

                this.enemies.splice(this.enemies.indexOf(enemy), 1);
            }

            if (enemy.update) {
                enemy.update();
            }
        });
    }
}
