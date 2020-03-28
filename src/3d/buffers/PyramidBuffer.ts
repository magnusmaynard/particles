import Debug from "../debug/Debug";

export default class PyramidBuffer {
    private gl: WebGL2RenderingContext;
    // Each pyramid level must be seperate texture for the following:
    // TEXTURE_2D_ARRAY or TEXTURE_2D using mipmap will not work as one
    // layer must be written to, whilst another layer is being read from.
    // This is not allow in this version of webgl. This could be resolved
    // by copying or by ping-ponging between two set of textures, which
    // is expensive. Also note that the layers in TEXTURE_ARRAY_2D, must
    // all be the same size which wastes memory.
    private textures: WebGLTexture[];
    //TODO: Can this be a single framebuffer with multiple attachments?
    private framebuffers: WebGLFramebuffer[]; 
    private textureSizes: number[];
    private textureSize: number;
    private levelCount: number;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.textures = [];
        this.framebuffers = [];
        this.textureSizes = [];        

        // Force to use a square power of 2 texture.
        this.textureSize = Math.max(
            this.nextPowerOf2(this.gl.canvas.width),
            this.nextPowerOf2(this.gl.canvas.height));
        this.levelCount = 1 + Math.floor(Math.log2(this.textureSize));

        this.createTextures();
        this.createFrameBuffers();
    }

    private nextPowerOf2(value: number) {
        let power = 1;
        while (power < value) {
            power *= 2;
        }
        return power;
    }

    bind = (level: number) => {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers[level]);
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
        let size = this.textureSize;

        for (let level = 0; level < this.levelCount; level++) {
            let texture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

            const level = 0;
            const internalFormat = this.gl.RGBA32F;
            const border = 0;
            const format = this.gl.RGBA;
            const type = this.gl.FLOAT;
            const data = null;

            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                level,
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

            this.textureSizes.push(size);
            this.textures.push(texture);
            size /= 2.0;
        }
    }

    private createFrameBuffers = () => {
        for (let level = 0; level < this.levelCount; level++) {
            const framebuffer = this.gl.createFramebuffer();
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
            this.gl.framebufferTexture2D(
                this.gl.FRAMEBUFFER,
                this.gl.COLOR_ATTACHMENT0,
                this.gl.TEXTURE_2D,
                this.textures[level],
                0);

            Debug.CheckFramebuffer(this.gl);

            if (framebuffer) {
                this.framebuffers.push(framebuffer);
            }
        }
    }

}