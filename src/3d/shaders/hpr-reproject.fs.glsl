#version 300 es
precision mediump float;

uniform sampler2D uDepthTexture;
uniform mat4 uInverseProjectionMatrix;

in vec2 textureCoords;

out vec4 color;

// Reproject pixel position with depth from screenspace into
// camera space coordinates.
void main(){
    // Get clipspace position.
    vec4 clipSpacePos;
    clipSpacePos.xy = textureCoords * 2.0 - 1.0;
    clipSpacePos.z = texture(uDepthTexture, textureCoords).x * 2.0 - 1.0;
    clipSpacePos.w = 1.0;

    // Convert position to view space.
    vec4 viewSpacePos = uInverseProjectionMatrix * clipSpacePos;

    // Perspective divide.
    viewSpacePos /= viewSpacePos.w;

    color = vec4(viewSpacePos.x, viewSpacePos.y, viewSpacePos.z, 1.0);

    // //TODO: DEBUG!
    // if(color.b > -0.9){
    //     color = vec4(0.0, 1.0, color.b, 1.0);
    // }
}