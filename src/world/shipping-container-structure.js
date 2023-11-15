import * as THREE from "three";
import * as CANNON from "cannon-es";
import Experience from "../core/experience";

export default class ShippingContainerStructure {
    constructor(position = { x: 0, y: 0, z: 0 }) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.world = this.experience.world;
        this.physicsWorld = this.experience.physicsWorld;
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
        const modelBox = new THREE.Box3().setFromObject(this.resource.scene);
        const modelBoxSize = modelBox.getSize(new THREE.Vector3());

        this.shape = new CANNON.Box(
            new CANNON.Vec3(
                modelBoxSize.x / 2,
                modelBoxSize.y / 2,
                modelBoxSize.z / 2
            )
        );
        this.body = new CANNON.Body({
            mass: 500,
            position: new CANNON.Vec3(
                this.position.x,
                // FIXME: this is a hack to fix the model's position
                this.position.y + modelBoxSize.y / 2,
                this.position.z
            ),
            shape: this.shape,
            linearDamping: 0.01,
            angularDamping: 0.01,
        });
        // this.body.updateMassProperties();
        // this.body.aabbNeedsUpdate = true;

        this.physicsWorld.instance.addBody(this.body);
    }

    update() {
        this.model.position.copy(this.body.position);
        // FIXME: this is a hack to fix the model's position
        this.model.position.y -= this.shape.halfExtents.y;

        this.model.quaternion.copy(this.body.quaternion);
    }
}
