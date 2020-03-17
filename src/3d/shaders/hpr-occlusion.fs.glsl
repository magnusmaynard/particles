#version 300 es
precision mediump float;
precision mediump sampler2DArray;

int uPyramidTextureCount = 8;
uniform sampler2DArray uPyramidTextures;

const float OCCLUSION_THRESHOLD = 0.1;
const vec3 HOLE_COLOR = vec3(1.0);
const vec3 VISIBLE_COLOR = vec3(0.0);

out vec4 color;

/*  
    Returns the occlussion value between the current point (x)
    and a neighbouring point(y). The smaller the number, the more
    x is occluded by y.

    Formula:
           y-x      -y
    1 -  ------- o ----- 
         ||y-x||   ||y||
*/
float CalculateOcclusion(vec3 x, vec3 y) {
    return 1.0 - dot((y-x)/normalize(y-x), -y/normalize(y));
}

/*
    # Occlusion map algorithm
    for each pixel
        for each neighbour
            for each level in neigbourhood
                calculate occlusion value
            select lowest occlusion value
        calculate mean of all neighbour occlusion values
        if mean < 0.1:
            is hole
        else:
            visible

    # Layout of neightbours:
    tl t tr
    l  s  r
    bl b br
*/
void main() {
    vec3 current = texelFetch(uPyramidTextures, ivec3(gl_FragCoord.xy, 0), 0).rgb;

    float occMax = 10000.0;
    float occBL = occMax;
    float occL  = occMax;
    float occTL = occMax;
    float occT  = occMax;
    float occTR = occMax;
    float occR  = occMax;
    float occBR = occMax;
    float occB  = occMax;

    for (int level = 1; level <= uPyramidTextureCount; level++) {
        // Choose sample in bottomleft of each cell in next level.
        ivec2 pix = ivec2(gl_FragCoord.xy);
        ivec2 pixBL = ivec2(pix.x - 1, pix.y - 2) / 2;
        ivec2 pixL  = ivec2(pix.x - 1, pix.y - 1) / 2;
        ivec2 pixTL = ivec2(pix.x - 1, pix.y + 0) / 2;
        ivec2 pixT  = ivec2(pix.x + 0, pix.y + 0) / 2;
        ivec2 pixTR = ivec2(pix.x + 1, pix.y + 0) / 2;
        ivec2 pixR  = ivec2(pix.x + 1, pix.y - 1) / 2;
        ivec2 pixBR = ivec2(pix.x + 1, pix.y - 2) / 2;
        ivec2 pixB  = ivec2(pix.x + 0, pix.y + 2) / 2;

        // Get neighbouing pixels in the level.
        vec3 neiBL = texelFetch(uPyramidTextures, ivec3(pixBL, level), 0).rgb;
        vec3 neiL  = texelFetch(uPyramidTextures, ivec3(pixL, level), 0).rgb;
        vec3 neiTL = texelFetch(uPyramidTextures, ivec3(pixTL, level), 0).rgb;
        vec3 neiT  = texelFetch(uPyramidTextures, ivec3(pixT, level), 0).rgb;
        vec3 neiTR = texelFetch(uPyramidTextures, ivec3(pixTR, level), 0).rgb;
        vec3 neiR  = texelFetch(uPyramidTextures, ivec3(pixR, level), 0).rgb;
        vec3 neiBR = texelFetch(uPyramidTextures, ivec3(pixBR, level), 0).rgb;
        vec3 neiB  = texelFetch(uPyramidTextures, ivec3(pixB, level), 0).rgb;

        // Calculate the occlusion values for every neighbour in the level.
        occBL   = min(occBL, CalculateOcclusion(current, neiBL));
        occL    = min(occL, CalculateOcclusion(current, neiL));
        occTL   = min(occTL, CalculateOcclusion(current, neiTL));
        occT    = min(occT, CalculateOcclusion(current, neiT));
        occTR   = min(occTR, CalculateOcclusion(current, neiTR));
        occR    = min(occR, CalculateOcclusion(current, neiR));
        occBR   = min(occBR, CalculateOcclusion(current, neiBR));
        occB    = min(occB, CalculateOcclusion(current, neiB));
    }

    // Label pixel as hole or visible.
    float mean = (occBL + occL + occTL + occT + occTR + occR + occBR + occB) / 8.0;
    if(mean < OCCLUSION_THRESHOLD) {
        color = vec4(HOLE_COLOR, 1.0);
    } else {
        color = vec4(VISIBLE_COLOR, 1.0);
    }
}



// void main() {
//     color = vec4(1.0, 0.0, 0.0, 1.0);
// }