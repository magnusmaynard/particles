import ShaderProgram from "../ShaderProgram";

//@ts-ignore
import raw from "raw.macro";

const vs = String(raw("../shaders/texture-debugger.vs.glsl"));
const fs = String(raw("../shaders/texture-debugger.fs.glsl"));
let program: ShaderProgram | null = null

export default class TextureDebugger {
    public static Draw2D(gl: WebGL2RenderingContext, texture: WebGLTexture|null, corner=0) {
        if (program == null) {
            program = new ShaderProgram(gl, "texure-debugger", vs, fs);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        program.bind();

        program.updateUniformFloat("uCorner", corner); // 0=TL, 1=TR
        program.updateUniformFloat("uWidthScale", 0.3);
        program.updateUniformFloat("uScreenWidth", gl.canvas.width);
        program.updateUniformFloat("uScreenHeight", gl.canvas.height);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
      
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}