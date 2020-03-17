export default class GeometryBuffer{
    private gl: WebGL2RenderingContext;
    private occlusionTexture: WebGLTexture | null;
    private frameBuffer: WebGLFramebuffer | null;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.frameBuffer = null;
        this.occlusionTexture = this.createOcclusionTexture();

        this.createFrameBuffer();
    }

    bind = () => {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    }

    getOcclusionTexture = () => {
        return this.occlusionTexture;
    }

    private createOcclusionTexture = () => {
        // TODO: make only 1 component.
        let colorTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, colorTexture);
        
        const level = 0;
        const internalFormat = this.gl.RGBA;
        const border = 0;
        const format = this.gl.RGBA;
        const type = this.gl.UNSIGNED_BYTE;
        const data = null;

        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            level,
            internalFormat,
            this.gl.canvas.width,
            this.gl.canvas.height,
            border,
            format,
            type,
            data);
        
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        return colorTexture;
    }

    private createFrameBuffer = () => {
        this.frameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    
        // Color attachment.
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0,
            this.gl.TEXTURE_2D,
            this.occlusionTexture,
            0);
    }
}