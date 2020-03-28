#version 300 es
out vec2 textureCoords;

uniform float uScreenWidth;
uniform float uScreenHeight;
uniform float uWidthScale;
uniform float uCorner;

void main() {
    float width = uWidthScale;
    float height = (uScreenWidth * uWidthScale) / uScreenHeight; //Make square.
    float x = width * 2.0 - 1.0;
    float y = height * 2.0 - 1.0;
    float xInv = (1.0 - width) * 2.0 - 1.0;
    float yInv = (1.0 - height) * 2.0 - 1.0;

    vec2 positionsTR[4] = vec2[](
        vec2(xInv, yInv),
        vec2(1.0, yInv),
        vec2(xInv, 1.0),
        vec2(1.0, 1.0)
    );
    vec2 positionsTL[4] = vec2[](
        vec2(-1.0, yInv),
        vec2(x, yInv),
        vec2(-1.0, 1.0),
        vec2(x, 1.0)
    );

    const vec2 coords[4] = vec2[](
        vec2(0, 0),
        vec2(1, 0),
        vec2(0, 1),
        vec2(1, 1)
    );

    vec2 uv = vec2(0);
    if(int(uCorner) == 0) {
        uv = positionsTL[gl_VertexID];
    } else if(int(uCorner) == 1) {
        uv = positionsTR[gl_VertexID];
    } else {
        //TODO: implement.
    }

    textureCoords = coords[gl_VertexID];
    gl_Position = vec4(uv, -0.9, 1.0);
}
