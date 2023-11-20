import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import Experience from "./experience";

export default class PhysicsWorld {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.time = this.experience.time;
        this.debug = false;

        this.initInstance();

        if (this.debug) {
            this.debugger = new CannonDebugger(this.scene, this.instance);
        }
    }

    initInstance() {
        this.instance = new CANNON.World();
        this.instance.gravity.set(0, -9.82, 0);
        this.instance.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.instance.defaultContactMaterial.contactEquationRelaxation = 4;

        const solver = new CANNON.GSSolver();
        solver.iterations = 7;
        solver.tolerance = 0.1;
        this.instance.solver = new CANNON.SplitSolver(solver);

        this.instance.addContactMaterial(
            new CANNON.ContactMaterial(
                new CANNON.Material("physics"),
                new CANNON.Material("physics"),
                {
                    friction: 15.0,
                    restitution: 0.3,
                }
            )
        );
    }

    update() {
        this.instance.fixedStep();

        if (this.debug) {
            this.debugger.update();
        }
    }
}
