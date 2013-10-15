attribute vec2 a_position;
attribute vec4 aVertexColor;

varying vec4 vColor;

void main() {
  gl_Position = vec4(a_position, 0, 1);
  vColor = aVertexColor;
}
