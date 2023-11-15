import * as CANNON from "cannon";
import Experience from "../core/experience";

export default class ShippingContainerStructure {
    constructor(position = { x: 0, y: 0, z: 0 }) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.world = this.experience.world;
        this.resource = this.resources.items.shippingContainerStructureModel;
        this.position = position;

        this.initModel();
        this.initPhysics();
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

    initPhysics() {
        this.shape = new CANNON.Box(new CANNON.Vec3(2, 2, 2));
        this.body = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(
                this.position.x,
                this.position.y,
                this.position.z
            ),
            shape: this.shape,
        });

        this.world.physicsWorld.addBody(this.body);
    }
}
