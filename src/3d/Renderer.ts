import IApp from './IApp';
import Camera from './Camera';
import Pipeline from './Pipeline';
import PointCloud from './renderables/PointCloud';
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
            throw new Error("WebGL context is null.");
        }

        this.canvas = canvas;
        this.gl = context;

        this.renderCount = 0;
        this.app = app;
        this.camera = new Camera(
            0.1,
            10000,
            this.canvas.width,
            this.canvas.height,
            45);
        this.initState();
        this.updateSize();

        this.pipeline = new Pipeline(this.gl);
    
        this.scene = new Scene();

        this.app.onStartup(this);

        requestAnimationFrame(this.render);
    }

    getCamera = () => {
        return this.camera;
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

    private initState = () => {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.disable(this.gl.CULL_FACE);
    }

    private renderPointCloud = (pointCloud: PointCloud) => {
        this.pipeline.updateUniformMat4("uModelMatrix", pointCloud.getModelMatrix());

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

    private geometryPass = () => {
        this.pipeline.setupGeometryPass();

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Update uniforms.
        this.pipeline.updateUniformMat4("uProjectionMatrix", this.camera.getProjectionMatrix());
        this.pipeline.updateUniformMat4("uViewMatrix", this.camera.getViewMatrix());

        // Render scene.
        this.scene.getPointClouds().forEach(pointcloud => {
            this.renderPointCloud(pointcloud);
        });
    }

    private postProcessingPass = () => {
        this.pipeline.setupPostProcessingPass();

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Render fullscreen quad.
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    private render = () => {
        this.app.onUpdate(this);

        this.updateSize();

        this.geometryPass();

        this.pipeline.hiddenPointRemoval(this.camera.getProjectionMatrix());
        
        // this.postProcessingPass();

        this.renderCount++;
        requestAnimationFrame(this.render);
    }
}
