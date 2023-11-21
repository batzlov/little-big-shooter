import * as THREE from "three";
import * as CANNON from "cannon-es";
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
        this.resource =
            this.models[Math.floor(Math.random() * this.models.length)];
        this.position = position;
        this.physicsWorld = this.experience.physicsWorld;

        this.initModel();
        this.initPhysics();
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
        this.scene.add(this.model);
    }

    initPhysics() {
        this.shape = new CANNON.Box(new CANNON.Vec3(0.3, 2.5, 0.3));
        this.body = new CANNON.Body({
            mass: 500,
            position: new CANNON.Vec3(
                this.position.x,
                this.position.y + 2.5,
                this.position.z
            ),
            shape: this.shape,
            linearDamping: 0.01,
            angularDamping: 0.01,
        });

        this.physicsWorld.instance.addBody(this.body);
    }

    update() {}
}
