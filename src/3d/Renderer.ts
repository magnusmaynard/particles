import IApp from './IApp';
import Camera from './camera/Camera';
import Pipeline from './Pipeline';
import PointCloud from './renderables/PointCloud';
import Scene from './Scene';
import TextureDebugger from './debug/TextureDebugger';
import Stats from "stats.js"
import ICameraController from './camera/ICameraController';
import FirstPersonCameraController from './camera/FirstPersonCameraController';

export class Renderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private pipeline: Pipeline;
    private _renderCount: number;
    private app: IApp;
    private _camera: Camera;
    private cameraController: ICameraController;
    private stats: Stats;

    public scene: Scene;

    constructor(canvas: HTMLCanvasElement, app: IApp) {
        const context: WebGL2RenderingContext | null = canvas.getContext('webgl2');
        if (context == null) {
            throw new Error("WebGL context is null.");
        }

        this.canvas = canvas;
        this.gl = context;
        this._renderCount = 0;
        this.app = app;

        this._camera = new Camera(
            0.1,
            10000,
            this.canvas.width,
            this.canvas.height,
            45);
        this.cameraController = new FirstPersonCameraController(this.gl, this.camera);

        this.initState();
        this.initExtensions();
        this.updateSize();

        this.pipeline = new Pipeline(this.gl);
        this.scene = new Scene();
        this.app.onStartup(this);

        // Create frame interval counter.
        this.stats = new Stats();
        this.stats.showPanel(1);
        document.body.appendChild(this.stats.dom);

        requestAnimationFrame(this.render);
    }

    get camera(): Camera {
        return this._camera;
    }

    get renderCount(): number {
        return this._renderCount;
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

    private initState = () => {
        this.gl.clearColor(0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.disable(this.gl.CULL_FACE);
    }

    private initExtensions = () => {
        const ext = (
            // Allows rendering to float textures for the pyramids.
            this.gl.getExtension("EXT_color_buffer_float")
        );

        if(!ext) {
            console.error("Error: Missing extension!");
        }
    }

    private renderPointCloud = (pointCloud: PointCloud) => {
        this.pipeline.updateUniformMat4("uModelMatrix", pointCloud.getModelMatrix());

        if (pointCloud.vao == null) {
            //TODO: Only remake if dirty.
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
        this.pipeline.updateUniformMat4("uProjectionMatrix", this.camera.projectionMatrix);
        this.pipeline.updateUniformMat4("uViewMatrix", this.camera.viewMatrix);

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
        const start = performance.now();
        this.stats.begin();

        this.app.onUpdate(this);

        this.updateSize();

        this.geometryPass();

        this.pipeline.hprGeneratePyramids(this.camera.projectionMatrix);

        this.pipeline.hprGenerateOcclusionMask();
        
        this.postProcessingPass();

        TextureDebugger.Draw2D(this.gl, this.pipeline.pyramidBuffer.getTexture(5), 0);
        TextureDebugger.Draw2D(this.gl, this.pipeline.occlusionBuffer.getTexture(), 1); 

        this._renderCount++;
        this.stats.end();
        const end = performance.now();
        this.cameraController.update(end - start);

        requestAnimationFrame(this.render);
    }
}
