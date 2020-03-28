#version 300 es
precision mediump float;
precision mediump sampler2D;

#define MAX_PYRAMID_TEXTURE_COUNT 20
uniform sampler2D uPyramidTextures[MAX_PYRAMID_TEXTURE_COUNT];
uniform int uPyramidTextureCount;

const float OCCLUSION_THRESHOLD = 0.1;
const vec3 OCCLUSION_COLOR = vec3(0, 1, 0);
const vec3 VISIBLE_COLOR = vec3(1, 0, 0);

out vec4 color;

/*  
    Returns the occlussion value between the current point (x)
    and a neighbouring point(y). The smaller the number, the more
    x is occluded by y.

    Formula:
          y-x    -y
    1 -  ----- . ---
         |y-x|   |y|

    Note: The original formula in the paper is incorrect. It states
    the divisors should be normalised, but this causes undefined
    behaviour as it can divide by zero. Instead calculate the
    magnitude of the divisors.
*/
float CalculateOcclusion(vec3 x, vec3 y) {
    return 1.0 - dot((y-x)/length(y-x), (-y)/length(y));
}

// Dynamic indexing of textures is not supported.
// Have to do this. Perhaps it will be better the dynamically
// create the shader depending on the number of levels to avoid
// these if statements.
vec3 fetch(int level, ivec2 pos) {
    if(level == 0) {
        return texelFetch(uPyramidTextures[0], pos, 0).rgb;
    } else if(level == 1) {
        return texelFetch(uPyramidTextures[1], pos, 0).rgb;
    } else if(level == 2) {
        return texelFetch(uPyramidTextures[2], pos, 0).rgb;
    } else if(level == 3) {
        return texelFetch(uPyramidTextures[3], pos, 0).rgb;
    } else if(level == 4) {
        return texelFetch(uPyramidTextures[4], pos, 0).rgb;
    } else if(level == 5) {
        return texelFetch(uPyramidTextures[5], pos, 0).rgb;
    } else if(level == 6) {
        return texelFetch(uPyramidTextures[6], pos, 0).rgb;
    } else if(level == 7) {
        return texelFetch(uPyramidTextures[7], pos, 0).rgb;
    } else if(level == 8) {
        return texelFetch(uPyramidTextures[8], pos, 0).rgb;
    } else if(level == 9) {
        return texelFetch(uPyramidTextures[9], pos, 0).rgb;
    } else if(level == 10) {
        return texelFetch(uPyramidTextures[10], pos, 0).rgb;
    } else if(level == 11) {
        return texelFetch(uPyramidTextures[11], pos, 0).rgb;
    } else if(level == 12) {
        return texelFetch(uPyramidTextures[12], pos, 0).rgb;
    } else if(level == 13) {
        return texelFetch(uPyramidTextures[13], pos, 0).rgb;
    } else if(level == 14) {
        return texelFetch(uPyramidTextures[14], pos, 0).rgb;
    } else if(level == 15) {
        return texelFetch(uPyramidTextures[15], pos, 0).rgb;
    } else if(level == 16) {
        return texelFetch(uPyramidTextures[16], pos, 0).rgb;
    } else if(level == 17) {
        return texelFetch(uPyramidTextures[17], pos, 0).rgb;
    } else if(level == 18) {
        return texelFetch(uPyramidTextures[18], pos, 0).rgb;
    } else if(level == 19) {
        return texelFetch(uPyramidTextures[19], pos, 0).rgb;
    }
    return vec3(0);
}

/*
    # Occlusion map algorithm:
    for each pixel
        for each level
            for each each neighbour in level
                calculate occlusion value
            select lowest occlusion across all the levels for each neighbour.
        calculate mean of all occlusion values
        if mean < 0.1:
            occluded
        else:
            visible

    # Layout of neighbours:
    tl t tr
    l  s  r
    bl b br
*/
void main() {
    float occMax = 10000.0;
    float occBL = occMax;
    float occL  = occMax;
    float occTL = occMax;
    float occT  = occMax;
    float occTR = occMax;
    float occR  = occMax;
    float occBR = occMax;
    float occB  = occMax;

    ivec2 pix = ivec2(gl_FragCoord.xy);
    vec3 current = fetch(0, pix);

    for (int level = 0; level < uPyramidTextureCount; level++) {
        // Choose sample in bottomleft of each cell in next level.
        // ivec2 pixBL = ivec2(pix.x - 1, pix.y - 1);
        // ivec2 pixL  = ivec2(pix.x - 1, pix.y + 0);
        // ivec2 pixTL = ivec2(pix.x - 1, pix.y + 1);
        // ivec2 pixT  = ivec2(pix.x + 0, pix.y + 1);
        // ivec2 pixTR = ivec2(pix.x + 1, pix.y + 1);
        // ivec2 pixR  = ivec2(pix.x + 1, pix.y + 0);
        // ivec2 pixBR = ivec2(pix.x + 1, pix.y - 1);
        // ivec2 pixB  = ivec2(pix.x + 0, pix.y - 1);
        ivec2 pixBL = ivec2(pix.x - 1, pix.y - 1);
        ivec2 pixL  = ivec2(pix.x - 1, pix.y + 0);
        ivec2 pixTL = ivec2(pix.x - 1, pix.y + 1);
        ivec2 pixT  = ivec2(pix.x + 0, pix.y + 1);
        ivec2 pixTR = ivec2(pix.x + 1, pix.y + 1);
        ivec2 pixR  = ivec2(pix.x + 1, pix.y + 0);
        ivec2 pixBR = ivec2(pix.x + 1, pix.y - 1);
        ivec2 pixB  = ivec2(pix.x + 0, pix.y - 1);

        // Get neighbouring pixels in the level.
        vec3 neiBL = fetch(level, pixBL);
        vec3 neiL  = fetch(level, pixL);
        vec3 neiTL = fetch(level, pixTL);
        vec3 neiT  = fetch(level, pixT);
        vec3 neiTR = fetch(level, pixTR);
        vec3 neiR  = fetch(level, pixR);
        vec3 neiBR = fetch(level, pixBR);
        vec3 neiB  = fetch(level, pixB);

        // Calculate the occlusion values for every neighbour in the level.
        occBL   = min(occBL, CalculateOcclusion(current, neiBL));
        occL    = min(occL, CalculateOcclusion(current, neiL));
        occTL   = min(occTL, CalculateOcclusion(current, neiTL));
        occT    = min(occT, CalculateOcclusion(current, neiT));
        occTR   = min(occTR, CalculateOcclusion(current, neiTR));
        occR    = min(occR, CalculateOcclusion(current, neiR));
        occBR   = min(occBR, CalculateOcclusion(current, neiBR));
        occB    = min(occB, CalculateOcclusion(current, neiB));

        pix = pix / 2;
    }

    // Label pixel as occluded or visible.
    float mean = (occBL + occL + occTL + occT + occTR + occR + occBR + occB) / 8.0;
    // color = vec4(mean);
    if(mean < OCCLUSION_THRESHOLD) {
        color = vec4(OCCLUSION_COLOR, 1.0);
    } else {
        color = vec4(VISIBLE_COLOR, 1.0);
    }
}
