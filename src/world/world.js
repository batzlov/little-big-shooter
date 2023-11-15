import * as THREE from "three";
import * as CANNON from "cannon";

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
        this.renderer = this.experience.renderer;
        this.resources = this.experience.resources;
        this.debug = this.experience.debug;
        this.time = this.experience.time;
        this.camera = this.experience.camera;

        this.resources.on("ready", () => {
            this.initPhysics();
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
        this.initCrosshair();
        this.initWorldBoundaries();
        this.initTrees();
    }

    initPhysics() {
        this.physicsWorld = new CANNON.World();
        this.physicsWorld.gravity.set(0, -9.82, 0);
    }

    initSkybox() {
        // TODO: replace with cube texture in the future
        this.scene.background = new THREE.Color(colors.skyBlue);
    }

    initCrosshair() {
        const crosshairTexture = this.resources.items.crosshairTexture;
        crosshairTexture.anisotropy =
            this.renderer.instance.capabilities.getMaxAnisotropy();

        this.crosshair = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: crosshairTexture,
                color: 0xffffff,
                fog: false,
                depthTest: false,
                depthWrite: false,
            })
        );
        this.crosshair.scale.set(1, 1, 1);
        this.crosshair.position.set(0, 0, -10);

        this.scene.add(this.crosshair);
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
        const treePositions = [
            {
                x: -42,
                y: 0,
                z: 7,
            },
            {
                x: -36,
                y: 0,
                z: 14,
            },
            {
                x: -44,
                y: 0,
                z: 14,
            },
            {
                x: -37,
                y: 0,
                z: 7,
            },
            {
                x: -28,
                y: 0,
                z: -59,
            },
            {
                x: -25,
                y: 0,
                z: -52,
            },
            {
                x: -22,
                y: 0,
                z: -59,
            },
            {
                x: -18,
                y: 0,
                z: -52,
            },
            {
                x: 32,
                y: 0,
                z: 17,
            },
            {
                x: 35,
                y: 0,
                z: 9,
            },
            {
                x: 30,
                y: 0,
                z: 9,
            },
            {
                x: 27,
                y: 0,
                z: 17,
            },
            {
                x: 37,
                y: 0,
                z: 17,
            },
            {
                x: 9,
                y: 0,
                z: 27,
            },
            {
                x: 5,
                y: 0,
                z: 19,
            },
            {
                x: 13,
                y: 0,
                z: 22,
            },
            {
                x: 14,
                y: 0,
                z: 27,
            },
            {
                x: 4,
                y: 0,
                z: 27,
            },
            {
                x: -35,
                y: 0,
                z: 69,
            },
            {
                x: -43,
                y: 0,
                z: 66,
            },
            {
                x: -41,
                y: 0,
                z: 60,
            },
            {
                x: -35,
                y: 0,
                z: 60,
            },
            {
                x: 29,
                y: 0,
                z: -12,
            },
            {
                x: 31,
                y: 0,
                z: -18,
            },
            {
                x: 26,
                y: 0,
                z: -21,
            },
            {
                x: 36,
                y: 0,
                z: -22,
            },
            {
                x: 36,
                y: 0,
                z: -17,
            },
            {
                x: 36,
                y: 0,
                z: -12,
            },
            {
                x: -7,
                y: 0,
                z: -45,
            },
            {
                x: -13,
                y: 0,
                z: -36,
            },
            {
                x: -12,
                y: 0,
                z: -43,
            },
            {
                x: -5,
                y: 0,
                z: -39,
            },
            {
                x: 34,
                y: 0,
                z: 55,
            },
            {
                x: 26,
                y: 0,
                z: 56,
            },
            {
                x: 33,
                y: 0,
                z: 62,
            },
            {
                x: 28,
                y: 0,
                z: 63,
            },
            {
                x: -41,
                y: 0,
                z: -40,
            },
            {
                x: -41,
                y: 0,
                z: -35,
            },
            {
                x: -36,
                y: 0,
                z: -33,
            },
            {
                x: -36,
                y: 0,
                z: -38,
            },
            {
                x: -46,
                y: 0,
                z: -41,
            },
            {
                x: -46,
                y: 0,
                z: -33,
            },
            {
                x: -3,
                y: 0,
                z: -53,
            },
            {
                x: 3,
                y: 0,
                z: -53,
            },
            {
                x: 5,
                y: 0,
                z: -59,
            },
            {
                x: -2,
                y: 0,
                z: -61,
            },
            {
                x: 58,
                y: 0,
                z: 31,
            },
            {
                x: 53,
                y: 0,
                z: 27,
            },
            {
                x: 58,
                y: 0,
                z: 25,
            },
            {
                x: 53,
                y: 0,
                z: 33,
            },
            {
                x: 22,
                y: 0,
                z: -64,
            },
            {
                x: 29,
                y: 0,
                z: -67,
            },
            {
                x: 28,
                y: 0,
                z: -60,
            },
            {
                x: 24,
                y: 0,
                z: -69,
            },
            {
                x: 23,
                y: 0,
                z: -59,
            },
            {
                x: -13,
                y: 0,
                z: 25,
            },
            {
                x: -9,
                y: 0,
                z: 18,
            },
            {
                x: -16,
                y: 0,
                z: 18,
            },
            {
                x: -18,
                y: 0,
                z: 27,
            },
            {
                x: -35,
                y: 0,
                z: -8,
            },
            {
                x: -40,
                y: 0,
                z: -9,
            },
            {
                x: -42,
                y: 0,
                z: -2,
            },
            {
                x: -33,
                y: 0,
                z: -3,
            },
            {
                x: -32,
                y: 0,
                z: -19,
            },
            {
                x: -33,
                y: 0,
                z: -28,
            },
            {
                x: -28,
                y: 0,
                z: -28,
            },
            {
                x: -37,
                y: 0,
                z: -19,
            },
            {
                x: -27,
                y: 0,
                z: -23,
            },
            {
                x: 50,
                y: 0,
                z: -28,
            },
            {
                x: 24,
                y: 0,
                z: 39,
            },
            {
                x: 41,
                y: 0,
                z: 39,
            },
            {
                x: 6,
                y: 0,
                z: -5,
            },
            {
                x: 66,
                y: 0,
                z: 47,
            },
            {
                x: 23,
                y: 0,
                z: -45,
            },
            {
                x: 58,
                y: 0,
                z: -32,
            },
            {
                x: -70,
                y: 0,
                z: -4,
            },
            {
                x: 18,
                y: 0,
                z: 41,
            },
            {
                x: 53,
                y: 0,
                z: 54,
            },
            {
                x: 27,
                y: 0,
                z: 18,
            },
            {
                x: 18,
                y: 0,
                z: -15,
            },
            {
                x: 57,
                y: 0,
                z: 17,
            },
            {
                x: 20,
                y: 0,
                z: -60,
            },
            {
                x: 58,
                y: 0,
                z: -49,
            },
            {
                x: 56,
                y: 0,
                z: -10,
            },
            {
                x: -64,
                y: 0,
                z: -37,
            },
            {
                x: 42,
                y: 0,
                z: 14,
            },
            {
                x: -61,
                y: 0,
                z: 5,
            },
            {
                x: 40,
                y: 0,
                z: -8,
            },
            {
                x: 59,
                y: 0,
                z: 38,
            },
            {
                x: 7,
                y: 0,
                z: -25,
            },
            {
                x: 20,
                y: 0,
                z: 14,
            },
            {
                x: 21,
                y: 0,
                z: -57,
            },
            {
                x: 44,
                y: 0,
                z: -51,
            },
            {
                x: 55,
                y: 0,
                z: 19,
            },
            {
                x: 36,
                y: 0,
                z: 61,
            },
            {
                x: 1,
                y: 0,
                z: -60,
            },
            {
                x: -54,
                y: 0,
                z: 14,
            },
            {
                x: 31,
                y: 0,
                z: 48,
            },
        ];

        treePositions.forEach((treePosition) => {
            const tree = new Tree(treePosition);
            this.scene.add(tree.model);
        });
    }

    update() {
        if (this.player) {
            this.player.update();
        }

        if (this.crosshair) {
            this.updateCrosshair();
        }

        if (this.physicsWorld) {
            this.physicsWorld.step(1 / 60, this.time.delta, 3);
        }
    }

    updateCrosshair() {
        const target = new THREE.Vector3(0, 0, -12)
            .applyQuaternion(this.camera.instance.quaternion)
            .add(this.camera.instance.position);

        this.crosshair.position.x = target.x;
        this.crosshair.position.y = target.y;
        this.crosshair.position.z = target.z;
    }
}
