import IApp from './IApp';
import Camera from './camera/Camera';
import Pipeline from './Pipeline';
import GeometryBuffer from './buffers/GeometryBuffer';
import PyramidBuffer from './buffers/PyramidBuffer';
import OcclusionBuffer from './buffers/OcclusionBuffer';
import PointCloud from './renderables/PointCloud';
import Scene from './Scene';
import TextureDebugger from './debug/TextureDebugger';
import Stats from "stats.js"
import ICameraController from './camera/ICameraController';
import FirstPersonCameraController from './camera/FirstPersonCameraController';
import { mat4 } from 'gl-matrix'
import dat from 'dat.gui';

class Settings {
    showOcclusionTexture = true;
    showPyramidTexture = true;
    pyramidTextureLevel = 0;
    enableHPR = true;
}

export class Renderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private _pipeline: Pipeline;
    private geometryBuffer: GeometryBuffer;
    private pyramidBuffer: PyramidBuffer;
    private occlusionBuffer: OcclusionBuffer;

    private _renderCount: number;
    private _app: IApp;
    private _camera: Camera;
    private _cameraController: ICameraController;
    private _stats: Stats;
    private _gui: dat.GUI;
    private _settings: Settings;
    public scene: Scene;

    constructor(canvas: HTMLCanvasElement, app: IApp) {
        const context: WebGL2RenderingContext | null = canvas.getContext('webgl2');
        if (context == null) {
            throw new Error("WebGL context is null.");
        }

        this.canvas = canvas;
        this.gl = context;
        this._renderCount = 0;
        this._app = app;

        this._camera = new Camera(
            0.1,
            10000,
            this.canvas.width,
            this.canvas.height,
            45);
        this._cameraController = new FirstPersonCameraController(this.gl, this.camera);

        this.initState();
        this.initExtensions();
        this.updateSize();

        this._pipeline = new Pipeline(this.gl);
        this.scene = new Scene();
        this._app.onStartup(this);

        // Create buffers.
        this.geometryBuffer = new GeometryBuffer(this.gl);
        this.pyramidBuffer = new PyramidBuffer(this.gl);
        this.occlusionBuffer = new OcclusionBuffer(this.gl);

        // Create frame interval counter.
        this._stats = new Stats();
        this._stats.showPanel(1);
        document.body.appendChild(this._stats.dom);

        // Create debug gui.
        this._settings = new Settings();
        this._gui = new dat.GUI();
        this._gui.add(this._settings, "showOcclusionTexture");
        this._gui.add(this._settings, "showPyramidTexture");
        this._gui.add(this._settings, "pyramidTextureLevel").min(0).max(20).step(1);
        this._gui.add(this._settings, "enableHPR");
        document.body.appendChild(this._gui.domElement);

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

        if (!ext) {
            console.error("Error: Missing extensions!");
        }
    }

    private renderPointCloud = (pointCloud: PointCloud) => {
        this._pipeline.getUniform("uModelMatrix").updateMat4(pointCloud.getModelMatrix());

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

    private bindDefaultFrameBuffer() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    private geometryPass = () => {
        this._pipeline.geometryStage();
        this.geometryBuffer.bind();

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Update uniforms.
        this._pipeline.getUniform("uProjectionMatrix").updateMat4(this.camera.projectionMatrix);
        this._pipeline.getUniform("uViewMatrix").updateMat4(this.camera.viewMatrix);

        // Render scene.
        this.scene.getPointClouds().forEach(pointcloud => {
            this.renderPointCloud(pointcloud);
        });
    }

    private hprPyramidsPass = () => {
        this._pipeline.hprReprojectStage();
        this.pyramidBuffer.bind(0);

        this.gl.uniform1i(this._pipeline.getUniform("uDepthTexture").location, 0);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.geometryBuffer.getDepthTexture());

        let invProjMatrix = mat4.create();
        mat4.invert(invProjMatrix, this.camera.projectionMatrix);
        this._pipeline.getUniform("uInverseProjectionMatrix").updateMat4(invProjMatrix);

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        // Recussively generate remaining pyramid levels.
        this._pipeline.hprPyramidStage();
        for (let level = 1; level < this.pyramidBuffer.getLevelCount(); level++) {

            this.pyramidBuffer.bind(level);

            // Bind previous level texture.
            this.gl.uniform1i(this._pipeline.getUniform("uPyramidTexture").location, 0);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.pyramidBuffer.getTexture(level-1));

            // Render to produce nearest points texture.
            let textureSize = this.pyramidBuffer.getTextureSizes(level);
            this.gl.viewport(0, 0, textureSize, textureSize);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        }
    }

    private hprOcclusionPass = () => {
        this._pipeline.hprOcclusionStage();
        this.occlusionBuffer.bind();

        this._pipeline.getUniform("uPyramidTextureCount").updateInt(this.pyramidBuffer.getLevelCount());

        // Bind all pyramid textures.
        for (let level = 0; level < this.pyramidBuffer.getLevelCount(); level++) {
            let pyramidLocation = this._pipeline.getUniform(`uPyramidTextures[${level}]`).location;
            this.gl.uniform1i(pyramidLocation, level);
            this.gl.activeTexture(this.gl.TEXTURE0 + level);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.pyramidBuffer.getTexture(level));
        }

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    private postProcessingPass = () => {
        this._pipeline.postProcessingStage();
        this.bindDefaultFrameBuffer();

        // Set texture units.
        this.gl.uniform1i(this._pipeline.getUniform("uColorTexture").location, 0);
        this.gl.uniform1i(this._pipeline.getUniform("uDepthTexture").location, 1);
        this.gl.uniform1i(this._pipeline.getUniform("uOcclusionTexture").location, 2);

        // Bind geometry buffer textures.
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.geometryBuffer.getColorTexture());
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.geometryBuffer.getDepthTexture());
        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.occlusionBuffer.getTexture());

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this._pipeline.getUniform("uEnableHPR").updateInt(this._settings.enableHPR ? 1 : 0);

        // Render fullscreen quad.
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    private render = () => {
        // Start performance stats.
        const start = performance.now();
        this._stats.begin();

        // Updates.
        this._app.onUpdate(this);
        this.updateSize();
    
        // Render passes.
        this.geometryPass();
        this.hprPyramidsPass();
        this.hprOcclusionPass();
        this.postProcessingPass();

        // Debug renders.
        if (this._settings.showPyramidTexture) {
            TextureDebugger.Draw2D(this.gl, this.pyramidBuffer.getTexture(this._settings.pyramidTextureLevel), 0);
        }
        if (this._settings.showOcclusionTexture) {
            TextureDebugger.Draw2D(this.gl, this.occlusionBuffer.getTexture(), 1);
        }

        // End performance stats.
        this._renderCount++;
        this._stats.end();
        const end = performance.now();
        this._cameraController.update(end - start);

        requestAnimationFrame(this.render);
    }
}
