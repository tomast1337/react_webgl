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
    texture: Texture
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
    texture: Texture
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
    return Mesh.create(gl, vertices, indices, uvs, normals, texture);
  }

  static createCube(
    gl: WebGL2RenderingContext,
    width: number = 1,
    height: number = 1,
    depth: number = 1,
    texture: Texture
  ) {
    // 8 vertices
    const cube_vertices = [
      // front
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
      // left
      0,
      0,
      0, // 4
      0,
      height,
      0, // 5
      0,
      height,
      depth, // 6
      0,
      0,
      depth, // 7
      // back
      0,
      0,
      depth, // 8
      0,
      height,
      depth, // 9
      width,
      height,
      depth, // 10
      width,
      0,
      depth, // 11
      // right
      width,
      0,
      depth, // 12
      width,
      height,
      depth, // 13
      width,
      height,
      0, // 14
      width,
      0,
      0, // 15
      // top
      0,
      height,
      0, // 16
      width,
      height,
      0, // 17
      width,
      height,
      depth, // 18
      0,
      height,
      depth, // 19
      // bottom
      0,
      0,
      0, // 20
      0,
      0,
      depth, // 21s
      width,
      0,
      depth, // 22
      width,
      0,
      0, // 23
    ];
    // 12 triangles
    const cube_indices = [
      // front
      0, 1, 2, 0, 2, 3,
      // left
      4, 5, 6, 4, 6, 7,
      // back
      8, 9, 10, 8, 10, 11,
      // right
      12, 13, 14, 12, 14, 15,
      // top
      16, 17, 18, 16, 18, 19,
      // bottom
      20, 21, 22, 20, 22, 23,
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

    console.log(
      `cube_vertices: ${cube_vertices.length}, cube_indices: ${cube_indices.length}, cube_uvs: ${cube_uvs.length}, cube_normals: ${cube_normals.length}`
    );
    return Mesh.create(
      gl,
      cube_vertices,
      cube_indices,
      cube_uvs,
      cube_normals,
      texture
    );
  }
  static createSphere(
    gl: WebGL2RenderingContext,
    radius: number,
    slices: number,
    stacks: number,
    texture: Texture,
    invertNormals: boolean = false
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

        normals.push(invertNormals ? x : -x);
        normals.push(invertNormals ? y : -y);
        normals.push(invertNormals ? z : -z);
        tex_coords.push(-u);
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

    return Mesh.create(gl, vertices, indices, tex_coords, normals, texture);
  }

  static async LoadOBJ(
    gl: WebGL2RenderingContext,
    name: string,
    texture: Texture
  ) {
    let objFile;
    const root = "models/";
    try {
      objFile = await fetch(root + name).then((r) => r.text());
    } catch (e) {
      throw e;
    }
    let vertices = [];
    let indices = [];
    let tex_coords = [];
    let normals = [];

    const objLines = objFile.split("\n");

    for (let i = 0; i < objLines.length; i++) {
      const line = objLines[i].trim();
      const lineValues = line.split(" ");
      if (lineValues[0] === "v") {
        vertices.push(parseFloat(lineValues[1]));
        vertices.push(parseFloat(lineValues[2]));
        vertices.push(parseFloat(lineValues[3]));
      } else if (lineValues[0] === "vt") {
        console.log(lineValues);
        tex_coords.push(parseFloat(lineValues[1]));
        tex_coords.push(parseFloat(lineValues[2]));
      } else if (lineValues[0] === "vn") {
        normals.push(parseFloat(lineValues[1]));
        normals.push(parseFloat(lineValues[2]));
        normals.push(parseFloat(lineValues[3]));
      } else if (lineValues[0] === "f") {
        for (let j = 1; j < lineValues.length; j++) {
          const vertexValues = lineValues[j].split("/");
          indices.push(parseInt(vertexValues[0]) - 1);
          tex_coords.push(parseFloat(vertexValues[1]) - 1);
          normals.push(parseFloat(vertexValues[2]) - 1);
        }
      }
    }

    console.log(
      `Loaded ${vertices.length / 3} vertices, ${indices.length / 3} faces, ${
        tex_coords.length / 2
      } tex_coords,  ${normals.length / 3} normals`
    );

    return Mesh.create(gl, vertices, indices, tex_coords, normals, texture);
  }
}
