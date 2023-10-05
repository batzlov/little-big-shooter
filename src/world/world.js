import * as THREE from "three";

import Experience from "../core/experience.js";

import colors from "../constants/colors.js";

import Environment from "./environment.js";
import Ground from "./ground.js";
import Tree from "./tree.js";
import Road from "./road.js";
import Car from "./car.js";
import Player from "./player.js";

export default class World {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;

        this.resources.on("ready", () => {
            this.initWorld();

            this.player = new Player();
        });
    }

    initWorld() {
        this.ground = new Ground();
        this.environment = new Environment();
        // this.car = new Car();

        this.initSkybox();
        // this.initStreet();

        // this.tree = new Tree();
    }

    initSkybox() {
        // TODO: replace with cube texture in the future
        this.scene.background = new THREE.Color(colors.skyBlue);
    }

    initForrest() {
        const numberOfTrees = 5;
        for (let i = 0; i < numberOfTrees; i++) {
            const tree = new Tree();

            tree.model.position.x = THREE.MathUtils.randFloat(-5, 5);
            tree.model.position.z = THREE.MathUtils.randFloat(-5, 5);

            this.scene.add(tree.model);
        }
    }

    initStreet() {
        const numberOfStreetSegments = 10;
        for (let i = 0; i < numberOfStreetSegments; i++) {
            const road = new Road();

            // FIXME: seems wrong, but works for now
            road.model.position.x = -1 * (i + 1);

            this.scene.add(road.model);
        }
    }

    update() {
        if (this.player) {
            this.player.update();
        }
    }
}
