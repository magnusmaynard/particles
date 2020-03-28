export default class Debug {
    public static CheckFramebuffer(gl: WebGL2RenderingContext, ) {
        let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.log("Incomplete framebuffer: ", status);
        }
    }
}