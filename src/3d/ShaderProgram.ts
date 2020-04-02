import { mat4 } from 'gl-matrix'

export class Uniform {
    private gl: WebGL2RenderingContext;
    private _program: WebGLProgram;
    private _name: string;
    private _location: WebGLUniformLocation | null;

    constructor(gl: WebGL2RenderingContext, program: WebGLProgram, name: string) {
        this.gl = gl;
        this._program = program;
        this._name = name;
        this._location = this.gl.getUniformLocation(this._program, this._name);
    }

    get location(): WebGLUniformLocation | null {
        return this._location;
    }

    updateInt(value: number) {
        this.gl.uniform1i(this._location, value);
    }

    updateFloat(value: number) {
        this.gl.uniform1f(this._location, value);
    }

    updateMat4(value: mat4) {
        this.gl.uniformMatrix4fv(this._location, false, value);
    }
};

interface IUniforms {
    [key:string]: Uniform;
}

export default class ShaderProgram {
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram | null;
    private _uniforms: IUniforms;

    constructor(
        gl: WebGL2RenderingContext,
        name: string,
        vertexShaderSource: string,
        fragmentShaderSource: string) {
        this.gl = gl;
        this.program = this.createProgram(name, vertexShaderSource, fragmentShaderSource);
        this._uniforms = {};
    }

    private createProgram = (name: string, vsSource: string, fsSource: string) => {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);
        if (vertexShader == null || fragmentShader == null) {
            console.error(`Failed to create shader program: ${name}`);
            return null;
        }

        const program = this.gl.createProgram();
        if (program == null) {
            console.error(`Failed to create shader program: ${name}`);
            return null;
        }

        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error(
                `Failed to initialize the shader program ${name}:\n {this.gl.getProgramInfoLog(program)}`)
            return null;
        }

        return program;
    }

    private createShader = (type: GLenum, source: string) => {
        const shader = this.gl.createShader(type);
        if (shader == null) {
            console.error("Failed to create shader of type: " + type);
            return null;
        }

        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            let name = "Unknown type";
            if(type === this.gl.VERTEX_SHADER){
                name = "VERTEX_SHADER";
            } else if(type === this.gl.FRAGMENT_SHADER){
                name = "FRAGMENT_SHADER";
            }
            console.error(`Failed to compile the shader of type: ${name}\n ${this.gl.getShaderInfoLog(shader)}`);
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    getUniform(name: string) {
        return this._uniforms[name];
    }

    addUniform(name: string) {
        if(this.program == null) {
            console.error("Error: Program is null");
        } else {
            this._uniforms[name] = new Uniform(this.gl, this.program, name);
        }
        return this;
    }

    bind() {
        this.gl.useProgram(this.program);
    }
    
    // updateUniformInt = (name: string, value: number) => {
    //     if (this.program != null) {
    //         this.gl.uniform1i(
    //             this.gl.getUniformLocation(this.program, name),
    //             value);
    //     }
    // }
    
    // updateUniformFloat = (name: string, value: number) => {
    //     if (this.program != null) {
    //         this.gl.uniform1f(
    //             this.gl.getUniformLocation(this.program, name),
    //             value);
    //     }
    // }

    // updateUniformMat4 = (name: string, value: mat4) => {
    //     if (this.program != null) {
    //         this.gl.uniformMatrix4fv(
    //             this.gl.getUniformLocation(this.program, name),
    //             false,
    //             value);
    //     }
    // }

    getUniformLocation = (name: string) => {
        if (this.program != null) {
            return this.gl.getUniformLocation(this.program, name);
        }
        return null;
    }
}