#version 300 es
precision mediump float;

uniform sampler2D uColorTexture;
uniform sampler2D uDepthTexture;
in vec2 textureCoords;

out vec4 color;

void main(void) {
    vec3 c = texture(uColorTexture, textureCoords).rgb;
    float z = texture(uDepthTexture, textureCoords).x;

    float n = 0.1;
    float f = 10000.0;
    float linearDepth = (2.0 * n) / (f + n - z * (f - n));

    // color = vec4(c, 1.0);
    color = vec4(linearDepth, linearDepth, linearDepth, 1.0);
}