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
    console.log(this);
  }

  draw() {
    this.texture.bind();
    this.gl.bindVertexArray(this.vao);
    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.elementCount,
      this.gl.UNSIGNED_SHORT,
      //this.gl.UNSIGNED_INT,
      0
    );
    this.gl.bindVertexArray(null);
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
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        throw new Error("Could not create vertex buffer");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(
        0,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );
    const uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
        throw new Error("Could not create uv buffer");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(
        1,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    const indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        throw new Error("Could not create index buffer");
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    return new Mesh(gl, vao, indices.length, texture);
  }
  static createPlane(
    gl: WebGL2RenderingContext,
    width: number = 1,
    height: number = 1,
    texture: Texture,
    shader: Shader
  ) {
    const vertices = [ // 4 vertices
        0, 0, 0, // 0
        width, 0, 0, // 1
        width, height, 0, // 2
        0, height, 0, // 3
    ];
    const indices = [0, 1, 2, 0, 2, 3]; // 2 triangles
    const uvs = [0, 0, 1, 0, 1, 1, 0, 1]; // 4 uvs
    return Mesh.create(gl, vertices, indices, uvs, texture, shader);
  }

  static createCube(
    gl: WebGL2RenderingContext,
    width: number = 1,
    height: number = 1,
    depth: number = 1,
    texture: Texture,
    shader: Shader
  ) {
    // 8 vertices
    const cube_vertices = [
      0,
      0,
      0, // 0
      width,
      0,
      0, // 1
      width,
      height,
      0, // 2
      0,
      height,
      0, // 3
      0,
      0,
      depth, // 4
      width,
      0,
      depth, // 5
      width,
      height,
      depth, // 6
      0,
      height,
      depth, // 7
    ];
    // 12 triangles
    const cube_indices = [
      0,
      1,
      2,
      0,
      2,
      3, // front
      1,
      5,
      6,
      1,
      6,
      2, // right
      5,
      4,
      7,
      5,
      7,
      6, // back
      4,
      0,
      3,
      4,
      3,
      7, // left
      3,
      2,
      6,
      3,
      6,
      7, // top
      4,
      5,
      1,
      4,
      1,
      0, // bottom
    ];
    // 4 * 6 = 24 uvs
    const cube_uvs = [
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1, // front
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1, // right
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1, // back
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1, // left
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1, // top
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1, // bottom
    ];
    console.log({
      cube_vertices,
      cube_indices,
      cube_uvs,
    });
    return Mesh.create(
      gl,
      cube_vertices,
      cube_indices,
      cube_uvs,
      texture,
      shader
    );
  }
  static createSphere(
    gl: WebGL2RenderingContext,
    radius: number,
    slices: number,
    stacks: number,
    texture: Texture,
    shader: Shader
  ) {
    let latitude = 0;
    let longitude = 0;
    let vertices = [];
    let indices = [];
    let tex_coords = [];
    let normals = [];

    for (let i = 0; i <= stacks; i++) {
      latitude = (i * Math.PI) / stacks;
      let sinLatitude = Math.sin(latitude);
      let cosLatitude = Math.cos(latitude);

      for (let j = 0; j <= slices; j++) {
        longitude = (j * 2 * Math.PI) / slices;
        let sinLongitude = Math.sin(longitude);
        let cosLongitude = Math.cos(longitude);

        let x = cosLongitude * sinLatitude;
        let y = cosLatitude;
        let z = sinLongitude * sinLatitude;
        let u = 1 - j / slices;
        let v = 1 - i / stacks;

        normals.push(x);
        normals.push(y);
        normals.push(z);
        tex_coords.push(u);
        tex_coords.push(v);
        vertices.push(radius * x);
        vertices.push(radius * y);
        vertices.push(radius * z);
      }
    }

    for (let i = 0; i < stacks; i++) {
      for (let j = 0; j < slices; j++) {
        let first = i * (slices + 1) + j;
        let second = first + slices + 1;
        indices.push(first);
        indices.push(second);
        indices.push(first + 1);

        indices.push(second);
        indices.push(second + 1);
        indices.push(first + 1);
      }
    }

    return Mesh.create(gl, vertices, indices, tex_coords, texture, shader);
  }
}
