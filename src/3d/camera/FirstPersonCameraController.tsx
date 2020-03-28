import Camera from "./Camera";
import ICameraController from "./ICameraController";
import { vec2, vec3, mat4 } from "gl-matrix";
import VecEx from "../math/VecEx";

enum Direction {
    NONE = 0,
    FORWARD = 1 << 0,
    BACKWARD = 1 << 1,
    LEFT = 1 << 2,
    RIGHT = 1 << 3,
};

export default class FirstPersonCameraController implements ICameraController {
    private gl: WebGL2RenderingContext;
    private _camera: Camera;
    private _lastMousePos: vec2;
    private _lookSpeed: number;
    private _moveSpeed: number;
    private _direction: Direction;
    private _velocity: vec3;
    private _friction: number;

    constructor(gl: WebGL2RenderingContext, camera: Camera) {
        this.gl = gl;
        this._camera = camera;
        this._lastMousePos = vec2.fromValues(0, 0);
        this._lookSpeed = 0.005;
        this._moveSpeed = 0.02;
        this._direction = Direction.NONE;
        this._velocity = vec3.create();
        this._friction = 0.7;

        this.addEventListener(document.body, "mousedown", this.mouseDown);
        this.addEventListener(document.body, "mouseup", this.mouseUp);
        this.addEventListener(document.body, "mouseleave", this.mouseUp);
        this.addEventListener(document.body, "mousemove", this.mouseMove);
        this.addEventListener(document.body, "keydown", this.keyDown);
        this.addEventListener(document.body, "keyup", this.keyUp);
    }
    
    update(timeDelta: number): void {
        // Add movement direction to velocity.
        let movement = vec3.create();
        if((this._direction & Direction.FORWARD) === Direction.FORWARD){
            vec3.add(movement, movement, this._camera.forward);
        }
        if((this._direction & Direction.BACKWARD) === Direction.BACKWARD){
            vec3.sub(movement, movement, this._camera.forward);
        }
        if((this._direction & Direction.LEFT) === Direction.LEFT){
            vec3.add(movement, movement, this._camera.left);
        }
        if((this._direction & Direction.RIGHT) === Direction.RIGHT){
            vec3.sub(movement, movement, this._camera.left);
        }
        vec3.add(this._velocity, this._velocity, VecEx.multiply(movement, this._moveSpeed));

        // Reduce velocity over time.
        if(vec3.len(this._velocity) < 0.01) {
            this._velocity = vec3.create();
        } else {
            this._velocity = VecEx.multiply(this._velocity, this._friction);
        }

        // Update position by velocity.
        this._camera.position = vec3.add(this._camera.position, this._camera.position, this._velocity);
    }

    private addEventListener<T extends EventTarget, E extends Event>(
        element: T, type: string, handler: (this: T, evt: E) => void) {
        element.addEventListener(type, handler as (evt: Event) => void);
    }

    private mouseDown = (event: MouseEvent) => {
        //Do nothing.
    }

    private mouseUp = (event: MouseEvent) => {
        //Do nothing.
    }

    private mouseMove = (event: MouseEvent) => {
        const out = vec2.create();
        let mousePosition = vec2.fromValues(event.x, event.y);
        let delta = vec2.sub(out, mousePosition, this._lastMousePos);
        this._lastMousePos = mousePosition;        

        let rotUp = mat4.create();
        let rotLeft = mat4.create();
        mat4.fromRotation(rotUp, -delta[0] * this._lookSpeed, this._camera.up);
        mat4.fromRotation(rotLeft, delta[1] * this._lookSpeed, this._camera.left);
    
        let forward = vec3.create();
        vec3.transformMat4(forward, this._camera.forward, rotUp);
        vec3.transformMat4(forward, forward, rotLeft);
        this._camera.forward = forward;
    }

    private keyDown = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        switch(key){
            case "w":
                this._direction |= Direction.FORWARD;
                break;
            case "s":
                this._direction |= Direction.BACKWARD;
                break;
            case "a":
                this._direction |= Direction.LEFT;
                break;
            case "d":
                this._direction |= Direction.RIGHT;
                break;
        }
    }

    private keyUp = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        switch(key){
            case "w":
                this._direction &= ~Direction.FORWARD;
                break;
            case "s":
                this._direction &= ~Direction.BACKWARD;
                break;
            case "a":
                this._direction &= ~Direction.LEFT;
                break;
            case "d":
                this._direction &= ~Direction.RIGHT;
                break;
        }
    }
}