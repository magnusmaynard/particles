export default class GeometryBuffer{
    private gl: WebGL2RenderingContext;
    private colorTexture: WebGLTexture | null;
    private depthTexture: WebGLTexture | null;
    private frameBuffer: WebGLFramebuffer | null;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.frameBuffer = null;
        this.colorTexture = this.createColorTexture();
        this.depthTexture = this.createDepthTexture();

        this.createFrameBuffer();
    }

    bind = () => {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    }

    getColorTexture = () => {
        return this.colorTexture;
    }

    getDepthTexture = () => {
        return this.depthTexture;
    }

    private createColorTexture = () => {
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

    private createDepthTexture = () => {
        let depthTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, depthTexture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.DEPTH_COMPONENT16,
            this.gl.canvas.width,
            this.gl.canvas.height,
            0,
            this.gl.DEPTH_COMPONENT,
            this.gl.UNSIGNED_SHORT,
            null);
        
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        return depthTexture;
    }

    private createFrameBuffer = () => {
        this.frameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    
        // Color attachment.
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0,
            this.gl.TEXTURE_2D,
            this.colorTexture,
            0);

        // Depth attachment.
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.DEPTH_ATTACHMENT,
            this.gl.TEXTURE_2D,
            this.depthTexture,
            0);
            
    }
}