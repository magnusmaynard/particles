import ShaderProgram from './ShaderProgram';
import { mat4, vec3, vec2 } from 'gl-matrix'
import GeometryBuffer from './buffers/GeometryBuffer';
import PyramidBuffer from './buffers/PyramidBuffer';
import OcclusionBuffer from './buffers/OcclusionBuffer';

//@ts-ignore
import raw from "raw.macro";
 
// Import shaders.
const defaultVS = String(raw("./shaders/default.vs.glsl"));
const fullscreenQuadVS = String(raw("./shaders/fullscreen-quad.vs.glsl"));

const defaultFS = String(raw("./shaders/default.fs.glsl"));
const hprReprojectFS = String(raw("./shaders/hpr-reproject.fs.glsl"));
const hprPyramidFS = String(raw("./shaders/hpr-pyramid.fs.glsl"));
const hprOcclusionFS = String(raw("./shaders/hpr-occlusion.fs.glsl"));
const postProcessingFS = String(raw("./shaders/post-processing.fs.glsl"));

export default class Pipeline {
    private gl: WebGL2RenderingContext;
    private activeProgram: ShaderProgram;

    private geometryBuffer: GeometryBuffer;
    public pyramidBuffer: PyramidBuffer;
    public occlusionBuffer: OcclusionBuffer;

    private geometryProgram: ShaderProgram;
    private postProcessingProgram: ShaderProgram;
    private hprReprojectProgram: ShaderProgram;
    private hprPyramidProgram: ShaderProgram;
    private hprOcclusionProgram: ShaderProgram;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.geometryBuffer = new GeometryBuffer(this.gl);
        this.pyramidBuffer = new PyramidBuffer(this.gl);
        this.occlusionBuffer = new OcclusionBuffer(this.gl);
        
        this.geometryProgram = new ShaderProgram(this.gl, "geometry", defaultVS, defaultFS);
        this.postProcessingProgram = new ShaderProgram(this.gl, "post-processing", fullscreenQuadVS, postProcessingFS);
        this.hprReprojectProgram = new ShaderProgram(this.gl, "hpr-project", fullscreenQuadVS, hprReprojectFS);
        this.hprPyramidProgram = new ShaderProgram(this.gl, "hpr-pyramid", fullscreenQuadVS, hprPyramidFS);
        this.hprOcclusionProgram = new ShaderProgram(this.gl, "hpr-occlusion", fullscreenQuadVS, hprOcclusionFS)

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

    hprGeneratePyramids = (projectionMatrix: mat4) => {
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
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        }
    }

    hprGenerateOcclusionMask = () => {
        this.useProgram(this.hprOcclusionProgram);
        this.occlusionBuffer.bind();


        // let divide = (a: vec3, b: number) => {
        //     return vec3.fromValues(a[0]/b, a[1]/b, a[2]/b);
        // }
    
        // Alternative version.
        // let out = vec3.create();
        // let x = vec3.fromValues(0, 5, 10);
        // let y = vec3.fromValues(0, 0, 1);

        // let occ = 1 - (vec3.dot(
        //     divide(
        //         vec3.sub(out, y, x),
        //         vec3.len(vec3.sub(out, y, x))),
        //     divide(
        //         vec3.negate(out, y),
        //         vec3.len(y))));


        // Returns NaN?
        // let occ = 1 - (vec3.dot(
        //     vec3.divide(out,
        //         vec3.sub(out, y, x),
        //         vec3.normalize(out, vec3.sub(out, y, x))),
        //     vec3.divide(out,
        //         vec3.inverse(out, y),
        //         vec3.normalize(out, y))));

        // console.log(occ);

        this.activeProgram.updateUniformInt("uPyramidTextureCount", this.pyramidBuffer.getLevelCount());

        // Bind all pyramid textures.
        for (let level = 0; level < this.pyramidBuffer.getLevelCount(); level++) {
            let pyramidLocation = this.activeProgram.getUniformLocation(`uPyramidTextures[${level}]`);
            this.gl.uniform1i(pyramidLocation, level);
            this.gl.activeTexture(this.gl.TEXTURE0 + level);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.pyramidBuffer.getTexture(level));
        }

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
    }
}
