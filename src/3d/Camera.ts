import { mat4, vec3 } from 'gl-matrix'

export default class Camera {
    private near: number;
    private far: number;
    private width: number;
    private height: number;
    private fov: number;

    private position: vec3;
    private forward: vec3;
    private up: vec3;

    private projection: mat4;
    private view: mat4;
    private projectionIsDirty: boolean;
    private viewIsDirty: boolean;

    constructor(
        near: number,
        far: number,
        width: number,
        height: number,
        fov: number) {

        this.near = near;
        this.far = far;
        this.width = width;
        this.height = height;
        this.fov = fov;

        this.position = vec3.fromValues(0, 0, 0);
        this.forward = vec3.fromValues(0, 0, 1);
        this.up = vec3.fromValues(0, 1, 0);

        this.projection = mat4.create();
        this.view = mat4.create();
        this.projectionIsDirty = true;
        this.viewIsDirty = true;
    }

    private updateProjection = () => {
        if (this.projectionIsDirty) {
            mat4.perspective(
                this.projection,
                this.fov,
                this.width / this.height,
                this.near,
                this.far);
        }
    }

    private updateView = () => {
        if (this.viewIsDirty) {
            const at = vec3.create();
            vec3.add(at, this.position, this.forward);

            mat4.lookAt(
                this.view,
                this.position,
                at,
                this.up);
        }
    }

    setPosition(position: vec3) {
        this.position = position;
        this.viewIsDirty = true;
    }

    setForward(forward: vec3) {
        this.forward = forward;
        this.viewIsDirty = true;
    }

    resize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.projectionIsDirty = true;
    }

    getProjectionMatrix() {
        this.updateProjection();
        return this.projection;
    }

    getViewMatrix() {
        this.updateView();
        return this.view;
    }
}