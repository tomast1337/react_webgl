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
    normals: number[],
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
      0, // attribute location in shader
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
      1, // attribute location
      2,
      gl.FLOAT,
      false,
      0,
      0
    );
    const normalBuffer = gl.createBuffer();
    if (!normalBuffer) {
      throw new Error("Could not create normal buffer");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(
      2, // location
      3,
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
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    );
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
    const vertices = [
      // 4 vertices
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
    ];
    const indices = [0, 1, 2, 0, 2, 3]; // 2 triangles
    const uvs = [0, 0, 1, 0, 1, 1, 0, 1]; // 4 uvs
    const normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    return Mesh.create(gl, vertices, indices, uvs, normals, texture, shader);
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
    // front
    0,          0,     0, // 0
    width,      0,     0, // 1
    width, height,     0, // 2
    0,     height,     0, // 3
    // left
    0,          0,      0, // 4
    0,     height,      0, // 5
    0,     height,  depth, // 6
    0,          0,  depth, // 7
    // back
    0,          0,  depth, // 8
    0,     height,  depth, // 9
    width, height,  depth, // 10
    width,      0,  depth, // 11
    // right
    width,      0,  depth, // 12
    width, height,  depth, // 13
    width, height,      0, // 14
    width,      0,      0, // 15
    // top
    0,      height,     0, // 16
    width,  height,     0, // 17
    width,  height, depth, // 18
    0,      height, depth, // 19
    // bottom
    0,          0,      0, // 20
    0,          0,      depth, // 21s
    width,      0,      depth, // 22
    width,      0,      0, // 23
    ];
    // 12 triangles
    const cube_indices = [
      // front
        0,  1,  2,
        0,  2,  3,
        // left
        4,  5,  6,
        4,  6,  7,
        // back
        8,  9, 10,
        8, 10, 11,
        // right
        12, 13, 14,
        12, 14, 15,
        // top
        16, 17, 18,
        16, 18, 19,
        // bottom
        20, 21, 22,
        20, 22, 23,
    ];
    // 4 * 6 = 24 uvs
    // TODO: fix uvs
    const cube_uvs = [
        // front
        0, 0, 1, 0, 1, 1, 0, 1,
        // left
        0, 0, 1, 0, 1, 1, 0, 1,
        // back
        0, 0, 1, 0, 1, 1, 0, 1,
        // right
        0, 0, 1, 0, 1, 1, 0, 1,
        // top
        0, 0, 1, 0, 1, 1, 0, 1,
        // bottom
        0, 0, 1, 0, 1, 1, 0, 1,
    ];
    const cube_normals = [
      // front
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      // right
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
      // back
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
      // left
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
      // top
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
      // bottom
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
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
      cube_normals,
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

        normals.push(-x);
        normals.push(-y);
        normals.push(-z);
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

    return Mesh.create(
      gl,
      vertices,
      indices,
      tex_coords,
      normals,
      texture,
      shader
    );
  }
}
