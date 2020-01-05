export class Renderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;

    constructor(canvas: HTMLCanvasElement) {
        const context: WebGLRenderingContext | null = canvas.getContext('webgl');
        if (context == null) {
            throw new Error("WebGL context is null");
        }

        this.canvas = canvas;
        this.gl = context;

        requestAnimationFrame(this.render);
    }

    resize = (width: number, height: number) => {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    private render = () => {
        let gl = this.gl;

        gl.viewport(0, 0, this.canvas.width , this.canvas.height );
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //TODO: render stuff...

        requestAnimationFrame(this.render);
    }
}
