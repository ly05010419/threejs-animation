import * as THREE from 'three'

export class ResourceTracker {
    resources
    constructor() {
        this.resources = new Set();
    }
    track(resource: any) {
        if (!resource) {
            return resource;
        }
        // 判断如果传来的是数组，则遍历一遍重新执行一下这个方法
        if (Array.isArray(resource)) {
            resource.forEach(resource => this.track(resource));
            return resource;
        }
        if (resource.dispose || resource instanceof THREE.Object3D) {
            this.resources.add(resource);
        }
        if (resource instanceof THREE.Object3D) {
            this.track(resource.geometry);
            this.track(resource.material);
            this.track(resource.children);

        } else if (resource instanceof THREE.Material) {
            for (const value of Object.values(resource)) {
                if (value instanceof THREE.Texture) {
                    this.track(value);
                }
            }

            if (resource.uniforms) {

                for (const value of Object.values(resource.uniforms)) {

                    if (value) {

                        const uniformValue = value.value;
                        if (uniformValue instanceof THREE.Texture ||
                            Array.isArray(uniformValue)) {

                            this.track(uniformValue);

                        }

                    }

                }

            }

        }

        return resource;

    }
    untrack(resource) {

        this.resources.delete(resource);

    }
    // 销毁
    dispose() {
        for (const resource of this.resources) {

            if (resource instanceof THREE.Object3D) {

                if (resource.parent) {

                    resource.parent.remove(resource);

                }

            }

            if (resource.dispose) {

                resource.dispose();

            }

        }

        this.resources.clear();

    }

}
