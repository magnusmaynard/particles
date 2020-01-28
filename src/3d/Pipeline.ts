import ShaderProgram from './ShaderProgram';
import { mat4 } from 'gl-matrix'
import GeometryBuffer from './buffers/GeometryBuffer';

//@ts-ignore
import raw from "raw.macro";
import PyramidBuffer from './buffers/PyramidBuffer';
 
// Import shaders.
const defaultVS = String(raw("./shaders/default.vs.glsl"));
const fullscreenQuadVS = String(raw("./shaders/fullscreen-quad.vs.glsl"));

const defaultFS = String(raw("./shaders/default.fs.glsl"));
const hprReprojectFS = String(raw("./shaders/hpr-reproject.fs.glsl"));
const hprPyramidFS = String(raw("./shaders/hpr-pyramid.fs.glsl"));
const postProcessingFS = String(raw("./shaders/post-processing.fs.glsl"));

export default class Pipeline {
    private gl: WebGL2RenderingContext;
    private activeProgram: ShaderProgram;

    private geometryBuffer: GeometryBuffer;
    private pyramidBuffer: PyramidBuffer;

    private geometryProgram: ShaderProgram;
    private postProcessingProgram: ShaderProgram;
    private hprReprojectProgram: ShaderProgram;
    private hprPyramidProgram: ShaderProgram;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.geometryBuffer = new GeometryBuffer(this.gl);
        this.pyramidBuffer = new PyramidBuffer(this.gl);
        
        this.geometryProgram = new ShaderProgram(this.gl, defaultVS, defaultFS);
        this.postProcessingProgram = new ShaderProgram(this.gl, fullscreenQuadVS, postProcessingFS);
        this.hprReprojectProgram = new ShaderProgram(this.gl, fullscreenQuadVS, hprReprojectFS);
        this.hprPyramidProgram = new ShaderProgram(this.gl, fullscreenQuadVS, hprPyramidFS);

        this.activeProgram = this.geometryProgram;
    }

    private useProgram = (program: ShaderProgram) => {
        this.activeProgram = program;
        this.activeProgram.bind();
    }

    private bindDefaultFrameBuffer() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    updateUniformInt= (name: string, value: number) => {
        this.activeProgram.updateUniformInt(name, value);
    }

    updateUniformFloat = (name: string, value: number) => {
        this.activeProgram.updateUniformFloat(name, value);
    }

    updateUniformMat4 = (name: string, value: mat4) => {
        this.activeProgram.updateUniformMat4(name, value);
    }

    setupGeometryPass = () => {
        this.useProgram(this.geometryProgram);
        this.geometryBuffer.bind();
    }

    setupPostProcessingPass = () => {
        this.useProgram(this.postProcessingProgram);
        this.bindDefaultFrameBuffer();

        // Set texture units.
        let colorLocation = this.activeProgram.getUniformLocation("uColorTexture");
        let depthLocation = this.activeProgram.getUniformLocation("uDepthTexture");
        this.gl.uniform1i(colorLocation, 0);
        this.gl.uniform1i(depthLocation, 1);

        // Bind geometry buffer textures.
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.geometryBuffer.getColorTexture());
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.geometryBuffer.getDepthTexture());
    }

    hiddenPointRemoval = (projectionMatrix: mat4) => {
        // Setup initial pyramid level.
        this.useProgram(this.hprReprojectProgram);
        this.pyramidBuffer.bind(0);

        let depthLocation = this.activeProgram.getUniformLocation("uDepthTexture");
        this.gl.uniform1i(depthLocation, 0);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.geometryBuffer.getDepthTexture());

        let invProjMatrix = mat4.create();
        mat4.invert(invProjMatrix, projectionMatrix);
        this.updateUniformMat4("uInverseProjectionMatrix", invProjMatrix);

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        // Recussively generate remaining pyramid levels.
        this.useProgram(this.hprPyramidProgram);
        for (let level = 1; level < this.pyramidBuffer.getLevelCount(); level++) {

            this.pyramidBuffer.bind(level);
            
            // Bind previous level texture.
            let pyramidLocation = this.activeProgram.getUniformLocation("uPyramidTexture");
            this.gl.uniform1i(pyramidLocation, 0);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.pyramidBuffer.getTexture(level-1));
            
            // Render to produce nearest points texture.
            let textureSize = this.pyramidBuffer.getTextureSizes(level);
            this.gl.viewport(0, 0, textureSize, textureSize);
            // this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        }
    }
}
