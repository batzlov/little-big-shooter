import * as THREE from "three";

import Experience from "../core/experience";

export default class Car {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.carModel;

        this.startPosition = new THREE.Vector3(-6, 0.01, 0);
        this.endPosition = new THREE.Vector3(6, 0.01, 0);

        this.initModel();
    }

    initModel() {
        this.model = this.resource.scene;
        this.model.position.set(
            this.startPosition.x,
            this.startPosition.y,
            this.startPosition.z
        );
        this.model.scale.set(0.01, 0.01, 0.01);
        this.model.rotateY(Math.PI / 2);
        this.scene.add(this.model);
    }

    update() {
        // restart animation if car reaches end position
        if (this.model.position.x > this.endPosition.x) {
            this.model.position.x = this.startPosition.x;
        }

        // animate from start to end position
        this.model.position.x += 0.05;
    }
}
