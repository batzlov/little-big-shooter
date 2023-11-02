import * as THREE from "three";

import Experience from "../core/experience.js";

import colors from "../constants/colors.js";

import Environment from "./environment.js";
import Ground from "./ground.js";
import Tree from "./tree.js";
import ShippingContainer from "./shipping-container.js";
import ShippingContainerStructure from "./shipping-container-structure.js";
import MetalFence from "./metal-fence.js";
import Player from "./player.js";

export default class World {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.camera = this.experience.camera;

        this.resources.on("ready", () => {
            this.initWorld();

            this.player = new Player();
        });
    }

    initWorld() {
        this.ground = new Ground();
        this.environment = new Environment();

        this.obstacles = [];
        this.obstacles.push(
            new ShippingContainerStructure({ x: 10, y: 0, z: -20 }),
            new ShippingContainerStructure({ x: -10, y: 0, z: -20 }),
            new ShippingContainer({ x: 16, y: 0, z: -20 })
        );

        this.initSkybox();
        this.initWorldBoundaries();
        this.initTrees();
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
        const boundaries = new THREE.Box3().setFromObject(this.scene);
        const numberOfTrees = 30;
        for (let i = 0; i < numberOfTrees; i++) {
            const tree = new Tree({
                x: THREE.MathUtils.randFloat(
                    boundaries.min.x,
                    boundaries.max.x
                ),
                y: 0,
                z: THREE.MathUtils.randFloat(
                    boundaries.min.z,
                    boundaries.max.z
                ),
            });

            this.scene.add(tree.model);
        }
    }

    update() {
        if (this.player) {
            this.player.update();
        }
    }
}
