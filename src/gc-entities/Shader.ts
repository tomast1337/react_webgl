import * as glM from "gl-matrix";
export class Shader {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  constructor(
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string
  ) {
    this.gl = gl;
    this.program = this.gl.createProgram() as WebGLProgram;
    if (!this.program) {
      throw new Error("Failed to create program");
    }
    // Compile shaders
    // Compile vertex shader
    const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    if (!vertexShader) {
      throw new Error("Failed to create vertex shader");
    }
    this.gl.shaderSource(vertexShader, vertexShaderSource);
    this.gl.compileShader(vertexShader);
    if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
      throw new Error("Failed to compile vertex shader");
    }
    // Compile fragment shader
    const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    if (!fragmentShader) {
      throw new Error("Failed to create fragment shader");
    }
    this.gl.shaderSource(fragmentShader, fragmentShaderSource);
    this.gl.compileShader(fragmentShader);
    if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
      throw new Error("Failed to compile fragment shader");
    }
    // Link shaders
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      throw new Error("Failed to link program");
    }
  }
  use(callback: (program: WebGLProgram) => void) {
    this.gl.useProgram(this.program);
    callback(this.program);
  }
  setUniformVec4(name: string, value: glM.vec4) {
    this.gl.uniform4fv(this.gl.getUniformLocation(this.program, name), value);
  }
  setUniformMat4(name: string, value: glM.mat4) {
    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(this.program, name),
      false,
      value
    );
  }
  setUniformVec3(name: string, value: glM.vec3) {
    this.gl.uniform3fv(this.gl.getUniformLocation(this.program, name), value);
  }
  setUniformFloat(name: string, value: number) {
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, name), value);
  }
  setUniformInt(name: string, value: number) {
    this.gl.uniform1i(this.gl.getUniformLocation(this.program, name), value);
  }
}

export const createShader = (
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
): Shader => {
  return new Shader(gl, vertexShaderSource, fragmentShaderSource);
};
