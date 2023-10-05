import * as THREE from "three";
import Experience from "../core/experience";

export default class Tree {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.treeModel;

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
        this.model.scale.set(randomScale, randomScale, randomScale);
        this.scene.add(this.model);
    }
}
