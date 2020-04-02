import ShaderProgram, { Uniform } from './ShaderProgram';

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
    private geometryProgram: ShaderProgram;
    private hprReprojectProgram: ShaderProgram;
    private hprPyramidProgram: ShaderProgram;
    private hprOcclusionProgram: ShaderProgram;
    private postProcessingProgram: ShaderProgram;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        
        // Setup shader programs.
        this.geometryProgram = new ShaderProgram(this.gl, "geometry", defaultVS, defaultFS)
            .addUniform("uModelMatrix")
            .addUniform("uProjectionMatrix")
            .addUniform("uViewMatrix");
        this.hprReprojectProgram = new ShaderProgram(this.gl, "hpr-reproject", fullscreenQuadVS, hprReprojectFS)
            .addUniform("uInverseProjectionMatrix")
            .addUniform("uDepthTexture");
        this.hprPyramidProgram = new ShaderProgram(this.gl, "hpr-pyramid", fullscreenQuadVS, hprPyramidFS)
            .addUniform("uPyramidTexture");
        this.hprOcclusionProgram = new ShaderProgram(this.gl, "hpr-occlusion", fullscreenQuadVS, hprOcclusionFS)
            .addUniform("uPyramidTextureCount");
        this.postProcessingProgram = new ShaderProgram(this.gl, "post-processing", fullscreenQuadVS, postProcessingFS)
            .addUniform("uEnableHPR")
            .addUniform("uColorTexture")
            .addUniform("uDepthTexture")
            .addUniform("uOcclusionTexture");
        
        for (let level = 0; level < 20; level++) {
            this.hprOcclusionProgram.addUniform(`uPyramidTextures[${level}]`);
        }

        this.activeProgram = this.geometryProgram;
    }

    private useProgram = (program: ShaderProgram) => {
        this.activeProgram = program;
        this.activeProgram.bind();
    }

    getUniform = (name: string): Uniform => {
        return this.activeProgram.getUniform(name);
    }

    geometryStage = () => {
        this.useProgram(this.geometryProgram);
    }
    
    hprReprojectStage = () => {
        this.useProgram(this.hprReprojectProgram);
    }

    hprPyramidStage = () => {
        this.useProgram(this.hprPyramidProgram);
    }

    hprOcclusionStage = () => {
        this.useProgram(this.hprOcclusionProgram);
    }

    postProcessingStage = () => {
        this.useProgram(this.postProcessingProgram);
    }

}
