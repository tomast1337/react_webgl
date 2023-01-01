import * as React from "react";
import * as glM from "gl-matrix";
import { keysType } from "./gc-entities";
import { Camera, createDefaultCamera } from "./gc-entities/Camera";
import { hslToRgba } from "./gc-entities/ColorUtil";
import { createShader } from "./gc-entities/Shader";

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
        uniform mat4 in_projection;
        uniform mat4 in_view;
        uniform mat4 in_model;
        void main() {
            gl_Position = in_projection * in_view * in_model * vec4(position, 0.0, 1.0);
        }
        `;

    const fragmentShaderSource = `#version 300 es
        precision mediump float;
        out vec4 color;
        uniform vec4 in_color;
        void main() {
            color = in_color;
        }
        `;

    const shader = createShader(
      this.gl,
      vertexShaderSource,
      fragmentShaderSource
    );

    const drawQuad = (x: number, y: number, w: number, h: number) => {
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
      const vbo = this.gl.createBuffer();
      if (!vbo) {
        throw new Error("Failed to create buffer");
      }
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
      this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(0);
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
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
    // resize canvas
    window.addEventListener("resize", resizeCanvas);
    const renderFunc = () => {
      updateCamera();

      //this.gl.clearColor(background.r, background.g, background.b, 1);
      shader.use((program) => {
        shader.setUniformMat4("in_projection", this.camera.projectionMatrix);
        shader.setUniformMat4("in_view", this.camera.viewMatrix);
        shader.setUniformMat4("in_model", glM.mat4.create());
      });

      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      background.r = Math.sin(Date.now() / 1000) / 2 + 0.5;
      background.g = Math.cos(Date.now() / 1000) / 4 - 0.5;
      background.b = Math.sin(Date.now() / 1000) / 6 + 0.5;

      Array.from({ length: 100 }).forEach((_, i) => {
        const x = Math.sin(Date.now() / 1000 + i) / 1.09;
        const y = Math.cos(Date.now() / 1000 + i) / 1.09;
        //console.log((i / 360) * 360);
        shader.use((program) => {
          shader.setUniformVec4(
            "in_color",
            hslToRgba([(i / 360) * 360, 50, 50], 1)
          );
        });
        drawQuad(x, y, 0.1, 0.1);
      });
    };
    this.renderFunc = renderFunc;
  }
  render() {
    this.renderFunc();
    requestAnimationFrame(this.render.bind(this));
  }
}
