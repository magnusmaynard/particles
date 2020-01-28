export default class PyramidBuffer {
    private gl: WebGL2RenderingContext;
    private textures: WebGLTexture[]; // TODO: Can this use LODs instead of multiple textures?
    private frameBuffers: WebGLFramebuffer[]; //TODO: Can this be a single framebuffer with multiple attachments?
    private textureSizes: number[];
    private levelCount: number;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.textures = [];
        this.frameBuffers = [];
        this.textureSizes = [];
        
        this.createTextures();
        this.levelCount = this.textures.length;
    }

    private nextPowerOf2(value: number) {
        let power = 1;
        while (power < value) {
            power *= 2;
        }
        return power;
    }

    bind = (level: number) => {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffers[level]);
    }

    getTexture = (level: number) => {
        return this.textures[level];
    }

    getTextureSizes = (level: number) => {
        return this.textureSizes[level];
    }

    getLevelCount = () => {
        return this.levelCount
    }

    private createTextures = () => {
        // Force to use a square power of 2 texture.
        let size = Math.max(
            this.nextPowerOf2(this.gl.canvas.width),
            this.nextPowerOf2(this.gl.canvas.height));

        // Use mipmap level calculation.
        const levelCount = 1 + Math.floor(Math.log2(size));

        for (let level = 0; level < levelCount; level++) {
            let texture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

            const internalFormat = this.gl.RGBA32F;
            const border = 0;
            const format = this.gl.RGBA;
            const type = this.gl.FLOAT;
            const data = null;

            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                internalFormat,
                size,
                size,
                border,
                format,
                type,
                data);

            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

            if (texture == null) {
                console.error("Pyramid texture is null for level: " + level.toString());
                return;
            }
    
            this.textures.push(texture);

            let frameBuffer = this.gl.createFramebuffer();
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);

            // Color attachment to level texture.
            this.gl.framebufferTexture2D(
                this.gl.FRAMEBUFFER,
                this.gl.COLOR_ATTACHMENT0,
                this.gl.TEXTURE_2D,
                this.textures[level],
                0);

            if (frameBuffer == null) {
                console.error("Pyramid framebuffer is null for level: " + level.toString());
                return;
            }

            this.frameBuffers.push(frameBuffer);
    
            this.textureSizes.push(size);
            size /= 2.0;
        }
    }
}