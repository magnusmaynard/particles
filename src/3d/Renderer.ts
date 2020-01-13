import IApp from './IApp';
import Camera from './Camera';
import Pipeline from './Pipeline';
import PointCloud from './PointCloud';
import Scene from './Scene';

export class Renderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private pipeline: Pipeline;
    private renderCount: number;
    private app: IApp;
    private camera: Camera;

    public scene: Scene;

    constructor(canvas: HTMLCanvasElement, app: IApp) {
        const context: WebGL2RenderingContext | null = canvas.getContext('webgl2');
        if (context == null) {
            throw new Error("WebGL context is null");
        }

        this.canvas = canvas;
        this.gl = context;
        this.pipeline = new Pipeline(this.gl);
        this.renderCount = 0;

        this.app = app;
        this.camera = new Camera(
            0.1,
            10000,
            this.canvas.width,
            this.canvas.height,
            45);
        this.scene = new Scene();

        this.app.onStartup(this);

        requestAnimationFrame(this.render);
    }

    updateSize = () => {
        let displayWidth = this.canvas.clientWidth;
        let displayHeight = this.canvas.clientHeight;

        if (this.canvas.width !== displayWidth ||
            this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;

            this.camera.resize(displayWidth, displayHeight);
        }
    }

    getRenderCount = () => {
        return this.renderCount;
    }

    private renderPointCloud = (pointCloud: PointCloud) => {
        this.pipeline.updateUniform("uModelMatrix", pointCloud.getModelMatrix());

        if (pointCloud.vao == null) {
            //TODO: remake if dirty.
            console.debug("Constructing buffers");

            pointCloud.vao = this.gl.createVertexArray();
            this.gl.bindVertexArray(pointCloud.vao);

            pointCloud.positionBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, pointCloud.positionBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, pointCloud.getPositions(), this.gl.STATIC_DRAW);
            this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(0);
        }

        this.gl.bindVertexArray(pointCloud.vao);
        this.gl.drawArrays(this.gl.POINTS, 0, pointCloud.getPositions().length / 3.0);
    }

    private render = () => {
        this.app.onUpdate(this);

        this.updateSize();
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.pipeline.bind();

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.disable(this.gl.CULL_FACE);

        this.pipeline.updateUniform("uProjectionMatrix", this.camera.getProjectionMatrix());
        this.pipeline.updateUniform("uViewMatrix", this.camera.getViewMatrix());

        this.scene.getPointClouds().forEach(pointcloud => {
            this.renderPointCloud(pointcloud);
        });

        this.renderCount++;
        requestAnimationFrame(this.render);
    }
}
