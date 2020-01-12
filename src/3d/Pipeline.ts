import ShaderProgram from './ShaderProgram';
import { mat4 } from 'gl-matrix'

export default class Pipeline {
    private gl: WebGL2RenderingContext;
    private program: ShaderProgram;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.program = new ShaderProgram(this.gl, this.readVS(),  this.readFS());
    }

    bind = () => {
        this.program.bind();
    }

    updateUniform = (name: string, value: mat4) => {
        this.program.updateUniform(name, value);
    }

    private getTextFromElement(id: string) {
        let element = document.getElementById("main-vs");
        if(element != null){
            return element.innerText;
        }
        return "";
    }

    // TODO: import from file using webpack loader.
    private readVS = () => {
        return `#version 300 es
            layout(location = 0) in vec3 aPosition;

            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uModelMatrix;

            void main(void) {
                gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
            }
        `;
    }

    private readFS = () => {
        return `#version 300 es
            precision mediump float;

            out vec4 color;

            void main(void) {
                color = vec4(1.0, 1.0, 0, 1.0);
            }
        `;
    }
}
