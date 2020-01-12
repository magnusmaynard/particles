import { mat4, vec3 } from 'gl-matrix'

export default class PointCloud {
    static nextId = 0;

    private id: number;
    private positions: Float32Array;
    private translation: vec3;
    private model: mat4;
    private modelIsDirty: boolean;

    // TODO: move gl code to seperate renderable class.
    public vao: WebGLVertexArrayObject | null;
    public positionBuffer: WebGLBuffer | null;
    public positionsIsDirty: boolean;

    constructor(positions: Float32Array) {
        this.id = PointCloud.nextId++;
        this.positions = positions;
        this.translation = vec3.create();
        this.model = mat4.create();
        this.modelIsDirty = true;

        this.vao = null;
        this.positionBuffer = null;
        this.positionsIsDirty = true;
    }

    private updateModel() {
        if (this.modelIsDirty) {
            mat4.translate(this.model, mat4.create(), this.translation);
        }
    }

    public getId() {
        return this.id;
    }

    public setTranslation(translation: vec3) {
        this.translation = translation;
        this.modelIsDirty = true;
    }

    public getModelMatrix = () => {
        this.updateModel();
        return this.model;
    }

    public getPositions = () => {
        return this.positions;
    }
}