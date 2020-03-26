#version 300 es
precision mediump float;

uniform sampler2D uTexture;
in vec2 textureCoords;

out vec4 color;

void main(void) {
    vec3 c = texture(uTexture, textureCoords).rgb;
    color = vec4(c, 1.0);
}