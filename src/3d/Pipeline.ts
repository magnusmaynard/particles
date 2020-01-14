import ShaderProgram from './ShaderProgram';
import { mat4 } from 'gl-matrix'
import GeometryBuffer from './GeometryBuffer';

//@ts-ignore
import raw from "raw.macro";
 
// Import shaders.
const defaultVS = String(raw("./shaders/default.vs.glsl"));
const defaultFS = String(raw("./shaders/default.fs.glsl"));
const postProcessingVS = String(raw("./shaders/post-processing.vs.glsl"));
const postProcessingFS = String(raw("./shaders/post-processing.fs.glsl"));

export default class Pipeline {
    private gl: WebGL2RenderingContext;
    private geometryBuffer: GeometryBuffer;
    private geometryProgram: ShaderProgram;
    private postProcessingProgram: ShaderProgram;
    private activeProgram: ShaderProgram;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.geometryBuffer = new GeometryBuffer(this.gl);
        this.geometryProgram = new ShaderProgram(this.gl, defaultVS,  defaultFS);
        this.postProcessingProgram = new ShaderProgram(this.gl, postProcessingVS,  postProcessingFS);

        this.activeProgram = this.geometryProgram;
    }

    setupGeometryPass = () => {
        this.activeProgram = this.geometryProgram;
        this.activeProgram.bind();

        this.geometryBuffer.bind();
    }

    setupPostProcessingPass = () => {
        this.activeProgram = this.postProcessingProgram;
        this.activeProgram.bind();

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

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

    updateUniform = (name: string, value: mat4) => {
        this.activeProgram .updateUniform(name, value);
    }
}
