import ShaderProgram from './ShaderProgram';
import { mat4 } from 'gl-matrix'

//@ts-ignore
import raw from "raw.macro";
 
// Import shaders.
const defaultVS = String(raw("./shaders/default.vs.glsl"));
const defaultFS = String(raw("./shaders/default.fs.glsl"));

export default class Pipeline {
    private gl: WebGL2RenderingContext;
    private program: ShaderProgram;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.program = new ShaderProgram(this.gl, defaultVS,  defaultFS);
    }

    bind = () => {
        this.program.bind();
    }

    updateUniform = (name: string, value: mat4) => {
        this.program.updateUniform(name, value);
    }
}
