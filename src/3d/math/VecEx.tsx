import { vec3 } from "gl-matrix";

export default class VecEx{
    static multiply(v: vec3, scalar: number){
        return vec3.fromValues(v[0] * scalar, v[1] * scalar, v[2] * scalar);
    }
    static divide(v: vec3, scalar: number){
        return vec3.fromValues(v[0] / scalar, v[1] / scalar, v[2] / scalar);
    }
}