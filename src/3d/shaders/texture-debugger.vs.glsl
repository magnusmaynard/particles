#version 300 es
out vec2 textureCoords;

uniform float uScreenWidth;
uniform float uScreenHeight;
uniform float uWidthScale;

void main() {
    float width = uWidthScale;
    float height = (uScreenWidth * uWidthScale) / uScreenHeight; //Make square.
    float x = (1.0 - width) * 2.0 - 1.0;
    float y = (1.0 - height) * 2.0 - 1.0;

    vec2 positions[4] = vec2[](
        vec2(x, y),
        vec2(1.0, y),
        vec2(x, 1.0),
        vec2(1.0, 1.0)
        // vec2(-1, -1),
        // vec2(+1, -1),
        // vec2(-1, +1),
        // vec2(+1, +1)
    );
    const vec2 coords[4] = vec2[](
        vec2(0, 0),
        vec2(1, 0),
        vec2(0, 1),
        vec2(1, 1)
    );

    textureCoords = coords[gl_VertexID];
    gl_Position = vec4(positions[gl_VertexID], -0.9, 1.0);
}
