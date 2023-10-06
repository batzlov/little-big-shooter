import Experience from "../core/experience";

export default class ShippingContainer {
    constructor(position = { x: 0, y: 0, z: 0 }) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.shippingContainerModel;
        this.position = position;

        this.initModel();
    }

    initModel() {
        this.model = this.resource.scene.clone();
        this.model.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        this.scene.add(this.model);
    }
}
