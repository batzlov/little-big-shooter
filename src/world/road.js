import * as THREE from "three";
import Experience from "../core/experience";

const roadKitIndexes = {
    straight: 13,
    leftTurn: 14,
    rightTurn: 15,
};

export default class Road {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.roadKitModel;

        this.initModel();
    }

    initModel() {
        console.log(
            this.scene.position.distanceTo(
                this.resource.scene.children[roadKitIndexes.straight].position
            )
        );
        this.model =
            this.resource.scene.children[roadKitIndexes.straight].clone();
        // fix offset of model resulting from multiple models in the scene
        this.model.position.set(-5.5, 0.01, -2);
        // this.model.position.set(0, 0.01, 0);
        this.scene.add(this.model);
    }
}
