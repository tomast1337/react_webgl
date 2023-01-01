import * as React from "react";
import * as glM from "gl-matrix";
import { keysType } from "./gc-entities";
import { Camera, createDefaultCamera } from "./gc-entities/Camera";
import { createShader } from "./gc-entities/Shader";
import { Texture } from "./gc-entities/Texture";

export default () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    if (canvasRef.current) {
      const render = new Render(canvasRef.current);
      render.render();
    }
  }, [canvasRef]);

  // lock mouse, esq unlocks the mouse
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.exitPointerLock();
    } else {
      canvasRef.current?.requestPointerLock();
    }
  });

  return (
    <>
      <canvas
        style={{
          width: "100%",
          height: "100%",
          position: "fixed",
          top: 0,
          left: 0,
        }}
        ref={canvasRef}
      />
      <div
        style={{
          margin: "auto",
          width: "50%",
          padding: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: -1,
        }}
      >
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi rhoncus
          aliquam dapibus. Sed eget feugiat nunc. Nullam vel faucibus ipsum.
          Proin at diam turpis. Mauris semper sapien lacus, a imperdiet orci
          pellentesque pharetra. Cras mi libero, pellentesque sit amet elit eu,
          congue molestie nisi. Suspendisse potenti. Pellentesque venenatis eget
          tortor nec feugiat. Pellentesque eu dolor felis. Aenean malesuada at
          ligula id condimentum. Curabitur egestas turpis ut fermentum
          sollicitudin. Vestibulum tincidunt diam nec varius congue.
        </p>
        <p>
          Vivamus euismod, odio in blandit fringilla, est ex feugiat magna, sed
          molestie urna tortor at orci. Vivamus a pretium neque, in ultrices
          tortor. Proin malesuada nunc leo. Ut sit amet leo non ipsum semper
          pulvinar. Nullam pharetra, lacus ut euismod vestibulum, ex nulla
          pretium elit, ac bibendum metus odio finibus purus. Nulla quis dui at
          odio molestie vehicula ut non nunc. Donec vulputate purus erat, sit
          amet pharetra augue vestibulum et.
        </p>
        <p>
          Duis congue faucibus finibus. Integer ante lacus, semper tempor massa
          aliquam, viverra suscipit dolor. Donec ultrices sapien velit, et
          maximus mi suscipit id. Morbi lobortis mi ex, vitae tempus quam
          hendrerit nec. Aenean viverra volutpat nulla, non pellentesque lectus
          congue vitae. Proin mattis, nisi sed porttitor suscipit, lorem massa
          ultrices justo, eget vulputate quam odio sagittis risus. Proin
          feugiat, ex vel accumsan hendrerit, nunc diam maximus mi, non lobortis
          odio orci et libero. Fusce luctus accumsan lectus, a faucibus turpis
          sodales a. Donec ullamcorper justo turpis, et hendrerit metus interdum
          venenatis. In interdum et lacus ornare sagittis.
        </p>
        <p>
          Sed sit amet aliquet sem. Cras tristique dui a urna viverra luctus.
          Etiam eleifend magna eget lorem sodales suscipit at a lacus. Integer
          ac nisl ut nunc interdum ultricies ac ut nisl. Orci varius natoque
          penatibus et magnis dis parturient montes, nascetur ridiculus mus.
          Maecenas eleifend sem id massa laoreet ultricies. Donec quis interdum
          nunc, quis posuere nulla. Etiam sed tortor at mauris suscipit
          interdum. Vestibulum luctus nunc at risus viverra condimentum vitae ac
          purus.
        </p>
        <p>
          Maecenas nec placerat tellus. Cras hendrerit pharetra tellus vel
          finibus. Praesent fermentum elit vel nibh faucibus, et rutrum eros
          congue. Suspendisse facilisis mattis turpis, eget commodo lectus
          interdum ut. Ut metus tellus, convallis vel porttitor a, pellentesque
          at mi. Pellentesque eu ornare neque. Vestibulum ante ipsum primis in
          faucibus orci luctus et ultrices posuere cubilia curae;
        </p>
      </div>
    </>
  );
};

class Render {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  camera: Camera;

  renderFunc: () => void;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    if (!canvas.getContext("webgl2")) {
      throw new Error("WebGL2 not supported");
    }
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      throw new Error("WebGL2 not supported");
    }
    this.gl = gl;

    this.camera = createDefaultCamera(
      this.gl.canvas.width,
      this.gl.canvas.height
    );

    const vertexShaderSource = `#version 300 es
        in vec2 position;
        in vec2 uv;
        uniform mat4 in_projection;
        uniform mat4 in_view;
        uniform mat4 in_model;
        out vec2 out_uv; // send uv to fragment shader
        void main() {
            gl_Position = in_projection * in_view * in_model * vec4(position, 0.0, 1.0);
        
            out_uv = uv;
        }
        `;

    const fragmentShaderSource = `#version 300 es
        precision mediump float;
        in vec2 out_uv; // receive uv from vertex shader
        out vec4 color; // send color to the gpu to be rendered
        // texture
        uniform sampler2D in_texture; // select texture slot
        void main() {
            color = texture(in_texture, out_uv); // sample texture
        }
        `;

    const shader = createShader(
      this.gl,
      vertexShaderSource,
      fragmentShaderSource
    );

    const drawQuad = (x: number, y: number, w: number, h: number) => {
      // vertex buffer
      const vertices = new Float32Array([
        x,
        y,
        x + w,
        y,
        x,
        y + h,
        x + w,
        y + h,
      ]);
      // index buffer
      const indices = new Uint16Array([0, 1, 2, 2, 1, 3]);
      // uv buffer
      const uvs = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
      // create vao vertex array object
      const vao = this.gl.createVertexArray();
      if (!vao) {
        throw new Error("Failed to create vao");
      }
      this.gl.bindVertexArray(vao);
      // create vertex buffer object
      const vbo = this.gl.createBuffer();
      if (!vbo) {
        throw new Error("Failed to create buffer");
      }
      // create index buffer object
      const ibo = this.gl.createBuffer();
      if (!ibo) {
        throw new Error("Failed to create buffer");
      }
      // create uv buffer object
      const uvbo = this.gl.createBuffer();
      if (!uvbo) {
        throw new Error("Failed to create buffer");
      }
      // bind buffer objects
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvbo);
      // set buffer data
      this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
      this.gl.bufferData(
        this.gl.ELEMENT_ARRAY_BUFFER,
        indices,
        this.gl.STATIC_DRAW
      );
      this.gl.bufferData(this.gl.ARRAY_BUFFER, uvs, this.gl.STATIC_DRAW);
      // set vertex attributes
      this.gl.enableVertexAttribArray(0);
      this.gl.enableVertexAttribArray(1);
      this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
      this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 0, 0);
      // draw
      this.gl.drawElements(
        this.gl.TRIANGLES,
        indices.length,
        this.gl.UNSIGNED_SHORT,
        0
      );
      // unbind this destructs the vao
      this.gl.bindVertexArray(null);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    };
    const background = {
      r: 0,
      g: 0,
      b: 0,
    };

    const mouse = {
      x: 0,
      y: 0,
    };

    // update mouse position
    this.canvas.addEventListener("mousemove", (e) => {
      this.camera.processMouseMovement(e.movementX, e.movementY);
    });

    // update keyboard
    const keys: keysType = {};
    window.addEventListener("keydown", (e) => {
      keys[e.key] = true;
    });
    window.addEventListener("keyup", (e) => {
      keys[e.key] = false;
    });

    const updateCamera = () => {
      this.camera.processKeyboard(keys);
    };

    const resizeCanvas = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

      // update projection matrix
      this.camera.updateProjectionMatrixAspect(
        this.canvas.width,
        this.canvas.height
      );
    };
    resizeCanvas();

    const texturePng = new Texture(this.gl, "/textures/wall.png");
    const textureJpg = new Texture(this.gl, "/textures/test.jpg");
    const textureTranparent = new Texture(this.gl, "/textures/glass.png","transparent");

    // resize canvas
    window.addEventListener("resize", resizeCanvas);
    const renderFunc = () => {
      updateCamera();

      //this.gl.clearColor(background.r, background.g, background.b, 1);
      shader.use((program) => {
        shader.setUniformMat4("in_projection", this.camera.projectionMatrix);
        shader.setUniformMat4("in_view", this.camera.viewMatrix);
      });

      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      background.r = Math.sin(Date.now() / 1000) / 2 + 0.5;
      background.g = Math.cos(Date.now() / 1000) / 4 - 0.5;
      background.b = Math.sin(Date.now() / 1000) / 6 + 0.5;

      shader.use((program) => {
        const modelMatrix = glM.mat4.create();
        glM.mat4.translate(modelMatrix, modelMatrix, [-1, 0, -1]);
        shader.setUniformMat4("in_model", modelMatrix);
        shader.setUniformTexture("in_texture", texturePng, 0);
      });
      drawQuad(0, 0, 0.1, 0.1);

      shader.use((program) => {
        const modelMatrix = glM.mat4.create();
        glM.mat4.translate(modelMatrix, modelMatrix, [0, 0, -1]);
        shader.setUniformMat4("in_model", modelMatrix);
        shader.setUniformTexture("in_texture", textureJpg, 0);
      });
      drawQuad(0.1, 0, 0.1, 0.1);
      shader.use((program) => {
        const modelMatrix = glM.mat4.create();
        glM.mat4.translate(modelMatrix, modelMatrix, [1, 0, -1]);
        shader.setUniformMat4("in_model", modelMatrix);
        shader.setUniformTexture("in_texture", textureTranparent, 0);
      });
      drawQuad(0.2, 0, 0.1, 0.1);
    };
    this.renderFunc = renderFunc;
  }
  render() {
    this.renderFunc();
    requestAnimationFrame(this.render.bind(this));
  }
}
