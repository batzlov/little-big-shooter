import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import EventEmitter from "./event-emitter.js";

export default class Resources extends EventEmitter {
    constructor(sources) {
        super();

        this.sources = sources;

        this.items = {};
        this.toLoad = this.sources.length;
        this.loaded = 0;

        this.initLoaders();
    }

    initLoaders() {
        this.loaders = {};

        this.loaders.gltfLoader = new GLTFLoader();
        this.loaders.textureLoader = new THREE.TextureLoader();
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
    }

    loaderAsync(path, loader) {
        return new Promise((resolve, reject) => {
            loader.load(
                path,
                (data) => resolve(data),
                null,
                (error) => reject(error)
            );
        });
    }

    gltfLoaderAsync(path) {
        return this.loaderAsync(path, this.loaders.gltfLoader);
    }

    textureLoaderAsync(path) {
        return this.loaderAsync(path, this.loaders.textureLoader);
    }

    startLoading() {
        // if there are no sources, skip loading
        if (this.finishedLoading()) {
            // this is a hack to make sure emit is called after we started listening to the event when there are no sources to load
            window.requestAnimationFrame(() => {
                this.emit("ready");
            });
            return;
        }

        for (const source of this.sources) {
            let loader = null;

            switch (source.type) {
                case "gltf":
                    loader = this.loaders.gltfLoader;
                    break;
                case "texture":
                    loader = this.loaders.textureLoader;
                    break;
                case "cubeTexture":
                    loader = this.loaders.cubeTextureLoader;
                    break;
                default:
                    console.error("Unhandled source type...");
                    break;
            }

            loader.load(source.path, (file) => {
                this.sourceLoaded(source, file);
            });
        }
    }

    async load() {
        try {
            for (const source of this.sources) {
                let loader = null;

                switch (source.type) {
                    case "gltf":
                        loader = this.loaders.gltfLoader;
                        break;
                    case "texture":
                        loader = this.loaders.textureLoader;
                        break;
                    case "cubeTexture":
                        loader = this.loaders.cubeTextureLoader;
                        break;
                    default:
                        console.error("Unhandled source type...");
                        break;
                }

                const file = await this.loaderAsync(source.path, loader);
                this.items[source.name] = file;
            }
        } catch (error) {
            console.error(error);
        }
    }

    finishedLoading() {
        return this.toLoad === this.loaded;
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file;

        this.loaded++;

        if (this.finishedLoading()) {
            this.emit("ready");
        }
    }
}
