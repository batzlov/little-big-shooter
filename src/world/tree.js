import * as THREE from "three";
import Experience from "../core/experience";

export default class Tree {
    constructor(position = { x: 0, y: 0, z: 0 }) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.models = [
            this.resources.items.treeModel,
            this.resources.items.treeModel2,
            this.resources.items.treeModel3,
            this.resources.items.treeModel4,
        ];
        console.log(
            this.models,
            Math.floor(Math.random() * this.models.length)
        );
        this.resource =
            // this.models[Math.floor(Math.random() * this.models.length)];
            this.models[2];
        this.position = position;

        this.initModel();
    }

    initModel() {
        const reasonableScaleRange = [0.004, 0.006];
        const randomScale = THREE.MathUtils.randFloat(
            reasonableScaleRange[0],
            reasonableScaleRange[1]
        );

        // clone model
        this.model = this.resource.scene.clone();
        this.model.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        // this.model.scale.set(randomScale, randomScale, randomScale);
        this.scene.add(this.model);
    }
}
