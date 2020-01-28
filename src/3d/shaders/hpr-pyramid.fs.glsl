#version 300 es
precision mediump float;

uniform sampler2D uPyramidTexture;

in vec2 textureCoords;

out vec4 color;

// Returns the closest of the 4 provided points.
vec3 findClosestPoint(vec3 a, vec3 b, vec3 c, vec3 d){
    // TODO: optimise by removing loop.
    const int count = 4;
    vec3 points[count] = vec3[](a, b, c, d);
    int closestIndex = 0;
    for(int i = 1; i < count; i++){
        // Largest z is closest, as depth is negative.
        if(points[i].z > points[closestIndex].z){
            closestIndex = i;
        }
    }
    return points[closestIndex];
}

// Select closest point in previous pyramid level.
void main(){
    vec2 pos = gl_FragCoord.xy;
    ivec2 blPos = ivec2(pos.x * 2.0 + 0.0, pos.y * 2.0 + 0.0);
    ivec2 brPos = ivec2(pos.x * 2.0 + 1.0, pos.y * 2.0 + 0.0);
    ivec2 tlPos = ivec2(pos.x * 2.0 + 0.0, pos.y * 2.0 + 1.0);
    ivec2 trPos = ivec2(pos.x * 2.0 + 1.0, pos.y * 2.0 + 1.0);

    vec3 bl = texelFetch(uPyramidTexture, blPos, 0).rgb;
    vec3 br = texelFetch(uPyramidTexture, brPos, 0).rgb;
    vec3 tl = texelFetch(uPyramidTexture, tlPos, 0).rgb;
    vec3 tr = texelFetch(uPyramidTexture, trPos, 0).rgb;

    color = vec4(findClosestPoint(bl, br, tl, tr), 1.0);
}