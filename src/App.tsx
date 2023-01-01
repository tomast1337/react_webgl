import * as React from "react";
import * as glM from "gl-matrix";
import { keysType } from "./gc-entities";
import { Camera, createDefaultCamera } from "./gc-entities/Camera";

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
    const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    if (!vertexShader) {
      throw new Error("Failed to create vertex shader");
    }
    this.gl.shaderSource(
      vertexShader,
      `#version 300 es
        in vec2 position;
        uniform mat4 in_projection;
        uniform mat4 in_view;
        uniform mat4 in_model;
        void main() {
            gl_Position = in_projection * in_view * in_model * vec4(position, 0.0, 1.0);
        }
        `
    );
    this.gl.compileShader(vertexShader);
    if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
      throw new Error("Failed to compile vertex shader");
    }

    const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    if (!fragmentShader) {
      throw new Error("Failed to create fragment shader");
    }
    this.gl.shaderSource(
      fragmentShader,
      `#version 300 es
        precision mediump float;
        out vec4 color;
        uniform vec4 in_color;
        void main() {
            color = in_color;
        }
        `
    );
    this.gl.compileShader(fragmentShader);
    if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
      throw new Error("Failed to compile fragment shader");
    }

    const program = this.gl.createProgram();
    if (!program) {
      throw new Error("Failed to create program");
    }

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error("Failed to link program");
    }

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

      this.gl.clearColor(background.r, background.g, background.b, 1);
      this.gl.useProgram(program);

      this.gl.uniformMatrix4fv(
        this.gl.getUniformLocation(program, "in_projection"),
        false,
        this.camera.projectionMatrix
      );
      this.gl.uniformMatrix4fv(
        this.gl.getUniformLocation(program, "in_view"),
        false,
        this.camera.viewMatrix
      );
      this.gl.uniformMatrix4fv(
        this.gl.getUniformLocation(program, "in_model"),
        false,
        glM.mat4.create()
      );
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      background.r = Math.sin(Date.now() / 1000) / 2 + 0.5;
      background.g = Math.cos(Date.now() / 1000) / 4 - 0.5;
      background.b = Math.sin(Date.now() / 1000) / 6 + 0.5;

      Array.from({ length: 100 }).forEach((_, i) => {
        const x = Math.sin(Date.now() / 1000 + i) / 1.09;
        const y = Math.cos(Date.now() / 1000 + i) / 1.09;
        this.gl.uniform4f(
          this.gl.getUniformLocation(program, "in_color"),
          Math.sin(Date.now() / 1000 + i) / 2 + 0.5,
          Math.cos(Date.now() / 1000 + i) / 2 + 0.5,
          Math.sin(Date.now() / 1000 + i) / 3 + 0.5,
          1
        );
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
