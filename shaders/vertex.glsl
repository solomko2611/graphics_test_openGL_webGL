uniform mat4 u_matrix;
attribute vec2 a_pos;
attribute vec2 a_uv;
varying vec2 v_uv;

void main() {
    v_uv = a_uv;
    gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);
}