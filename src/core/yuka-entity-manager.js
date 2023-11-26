import * as YUKA from "yuka";

export default class YUKAEntityManager {
    constructor() {
        this.instance = new YUKA.EntityManager();
        this.time = new YUKA.Time();
    }

    add(entity) {
        this.instance.add(entity);
    }

    remove(entity) {
        this.instance.remove(entity);
    }

    update() {
        this.instance.update(this.time.update().getDelta());
    }
}
