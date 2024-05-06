precision mediump float;
#define PI2 6.28318530718
#define PI 3.14159265359

varying vec2 v_uv;
uniform sampler2D u_texture;
uniform sampler2D u_colorTable;
uniform float u_innerRadius;
uniform float u_colorTableWidth;

void main() {
    vec2 center = vec2(0.5);
    vec2 toCenter = v_uv - center;

    float dist = length(toCenter) * 2.;
    float dist1 = max((dist - u_innerRadius) / (1.-u_innerRadius), 0.);
    float angle = (atan(toCenter.y, toCenter.x) + PI) / PI2;
    angle = 1.-fract(angle + .25); // Shift - mirror the samples

    vec2 indexUv = vec2(dist1, angle);
    float index = texture2D(u_texture, indexUv).r * 255.;
    vec3 color = texture2D(u_colorTable, vec2(index / u_colorTableWidth, 0.0)).rgb;
    float alpha = step(index, u_colorTableWidth-0.001) * step(dist, 1.0) * step(u_innerRadius, dist);

    gl_FragColor = vec4(color, alpha);
}