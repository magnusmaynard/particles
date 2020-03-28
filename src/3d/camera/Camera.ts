import { mat4, vec3 } from 'gl-matrix'

export default class Camera {
    private _near: number;
    private _far: number;
    private _width: number;
    private _height: number;
    private _fov: number;
    private _verticalLookLimit: number;

    private _position: vec3;
    private _forward: vec3;
    private _up: vec3;

    private _projection: mat4;
    private _view: mat4;
    private _projectionIsDirty: boolean;
    private _viewIsDirty: boolean;

    constructor(
        near: number,
        far: number,
        width: number,
        height: number,
        fov: number) {

        this._near = near;
        this._far = far;
        this._width = width;
        this._height = height;
        this._fov = fov;
        this._verticalLookLimit = 0.95;

        this._position = vec3.fromValues(0, 0, -1);
        this._forward = vec3.fromValues(0, 0, 1);
        this._up = vec3.fromValues(0, 1, 0);

        this._projection = mat4.create();
        this._view = mat4.create();
        this._projectionIsDirty = true;
        this._viewIsDirty = true;
    }

    set forward(value: vec3) {
        if(Math.abs(vec3.dot(this.up, value)) < this._verticalLookLimit) {
            this._forward = value;
            this._viewIsDirty = true;
        }
    }

    get forward(): vec3 {
        return this._forward;
    }

    set up(value: vec3) {
        this._up = value;
        this._viewIsDirty = true;
    }

    get up(): vec3 {
        return this._up;
    }

    get left(): vec3 {
        let l = vec3.create();
        vec3.cross(l, this.up, this.forward);
        return l;
    }

    set position(value: vec3) {
        this._position = value;
        this._viewIsDirty = true;
    }

    get position(): vec3 {
        return this._position;
    }

    get projectionMatrix() : mat4 {
        this.updateProjection();
        return this._projection;
    }

    get viewMatrix(): mat4  {
        this.updateView();
        return this._view;
    }

    private updateProjection = () => {
        if (this._projectionIsDirty) {
            mat4.perspective(
                this._projection,
                this._fov,
                this._width / this._height,
                this._near,
                this._far);
        }
    }

    private updateView = () => {
        if (this._viewIsDirty) {
            const at = vec3.create();
            vec3.add(at, this.position, this.forward);

            mat4.lookAt(
                this._view,
                this.position,
                at,
                this.up);
        }
    }

    resize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._projectionIsDirty = true;
    }
}