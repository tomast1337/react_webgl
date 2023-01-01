import { Shader } from "./Shader";
import { Texture } from "./Texture";

export class Mesh {
    gl: WebGL2RenderingContext;
    vao: WebGLVertexArrayObject;
    elementCount: number;
    texture: Texture;
    constructor(
      gl: WebGL2RenderingContext,
      vao: WebGLVertexArrayObject,
      elementCount: number,
      texture: Texture
    ) {
      this.gl = gl;
      this.vao = vao;
      this.texture = texture;
      this.elementCount = elementCount;
    }
  
    draw() {
      this.texture.bind();
      this.gl.bindVertexArray(this.vao);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elementCount);
    }
    static create(
      gl: WebGL2RenderingContext,
      vertices: number[],
      indices: number[],
      uvs: number[],
      texture: Texture,
      shader: Shader
    ) {
      const vao = gl.createVertexArray();
      if (!vao) {
        throw new Error("Could not create VAO");
      }
      gl.bindVertexArray(vao);
      // Create buffers
      // create vertex buffer object
      const vertexBuffer = gl.createBuffer();
      if (!vertexBuffer) {
        throw new Error("Could not create vertex buffer");
      }
      // create index buffer object
      const indexBuffer = gl.createBuffer();
      if (!indexBuffer) {
        throw new Error("Could not create index buffer");
      }
      // create uv buffer object
      const uvBuffer = gl.createBuffer();
      if (!uvBuffer) {
        throw new Error("Could not create uv buffer");
      }
      // bind vertex buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      // bind index buffer
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      // bind uv buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      // set vertex data
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      // set index data
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      // set uv data
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
      // set vertex attributes
      const positionAttributeLocation = gl.getAttribLocation(
        shader.program,
        "in_position"
      );
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      // set uv attributes
      const uvAttributeLocation = gl.getAttribLocation(shader.program, "in_uv");
      gl.enableVertexAttribArray(uvAttributeLocation);
      gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      return new Mesh(gl, vao, indices.length, texture);
    }
    static createPlane(
      gl: WebGL2RenderingContext,
      width: number,
      height: number,
      texture: Texture,
      shader: Shader
    ) {
      const vertices = [
        0,
        0,
        width,
        0,
        width,
        height,
        0,
        0,
        width,
        height,
        0,
        height,
      ];
      const indices = [0, 1, 2, 3, 4, 5];
      const uvs = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1];
      return Mesh.create(gl, vertices, indices, uvs, texture, shader);
    }
  }