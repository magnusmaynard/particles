import { mat4 } from 'gl-matrix'

export default class ShaderProgram {
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram | null; //TODO:

    constructor(
        gl: WebGL2RenderingContext,
        vertexShaderSource: string,
        fragmentShaderSource: string) {
        this.gl = gl;
        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
    }

    private createProgram = (vsSource: string, fsSource: string) => {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);
        if (vertexShader == null || fragmentShader == null) {
            console.error("Failed to create shaders.");
            return null;
        }

        const program = this.gl.createProgram();
        if (program == null) {
            console.error("Failed to create shader program.");
            return null;
        }

        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error(
                "Failed to initialize the shader program: " +
                this.gl.getProgramInfoLog(program));
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
            console.error('Failed to compile the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    bind() {
        this.gl.useProgram(this.program);
    }
    
    updateUniformInt = (name: string, value: number) => {
        if (this.program != null) {
            this.gl.uniform1i(
                this.gl.getUniformLocation(this.program, name),
                value);
        }
    }
    
    updateUniformFloat = (name: string, value: number) => {
        if (this.program != null) {
            this.gl.uniform1f(
                this.gl.getUniformLocation(this.program, name),
                value);
        }
    }

    updateUniformMat4 = (name: string, value: mat4) => {
        if (this.program != null) {
            this.gl.uniformMatrix4fv(
                this.gl.getUniformLocation(this.program, name),
                false,
                value);
        }
    }

    getUniformLocation = (name: string) => {
        if (this.program != null) {
            return this.gl.getUniformLocation(this.program, name);
        }
        return null;
    }
}