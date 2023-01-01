import * as React from "react";
import * as glM from "gl-matrix";
import { keysType } from "./gc-entities";
import { Camera, createDefaultCamera } from "./gc-entities/Camera";
import { createShader, Shader } from "./gc-entities/Shader";
import { Texture } from "./gc-entities/Texture";
import { Mesh } from "./gc-entities/Mesh";
import { SceneObject } from "./gc-entities/SceneObject";

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

    // enable depth testing
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    // enable alpha blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA); // this allows us to have transparent textures

    // wireframe mode
    //this.gl.polygonMode(this.gl.FRONT_AND_BACK, this.gl.LINE);

    this.camera = createDefaultCamera(
      this.gl.canvas.width,
      this.gl.canvas.height
    );

    const vertexShaderSource = `#version 300 es
        in vec3 in_position;
        in vec2 in_uv;
        
        out vec2 out_uv; // send uv to fragment shader
        
        uniform mat4 u_projection;
        uniform mat4 u_view;
        uniform mat4 u_model;
        
        void main() {
            gl_Position = u_projection * u_view * u_model * vec4(in_position, 1.0);
            out_uv = in_uv;
        }
        `;

    const fragmentShaderSource = `#version 300 es
        precision highp float;
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
    const textureTranparent = new Texture(
      this.gl,
      "/textures/glass.png",
      "transparent"
    );

    const sceneObjects = [] as SceneObject[];

    Array.from({ length: 100 }).forEach((_, i) => {
      const oPosition = glM.vec3.fromValues(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5
      );
      const oRotation = glM.vec3.fromValues(
        Math.random() * 360,
        Math.random() * 360,
        Math.random() * 360
      );
      const oScale = glM.vec3.fromValues(1, 1, 1);

      // pick random mesh and texture from Mesh.createSphere, Mesh.createCube and Mesh.createPlane

        const texture = [
        texturePng,
        textureJpg,
        textureTranparent,
        ][Math.floor(Math.random() * 3)];

      const mesh = [
        Mesh.createSphere(this.gl, 1, 32, 32, texture, shader),
        Mesh.createCube(this.gl, 1, 1, 1, texture, shader),
        Mesh.createPlane(this.gl, 1, 1, texture, shader),
      ][Math.floor(Math.random() * 3)];

      const sceneObject = new SceneObject(
        mesh,
        shader,
        oPosition,
        oRotation,
        oScale
      );
      sceneObjects.push(sceneObject);
    });

    // resize canvas
    window.addEventListener("resize", resizeCanvas);
    const renderFunc = () => {
      updateCamera();

      //this.gl.clearColor(background.r, background.g, background.b, 1);
      shader.use((program) => {
        shader.setUniformMat4("u_projection", this.camera.projectionMatrix);
        shader.setUniformMat4("u_view", this.camera.viewMatrix);
      });

      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      background.r = Math.sin(Date.now() / 1000) / 2 + 0.5;
      background.g = Math.cos(Date.now() / 1000) / 4 - 0.5;
      background.b = Math.sin(Date.now() / 1000) / 6 + 0.5;

      sceneObjects.forEach((sceneObject) => {
        sceneObject.draw();
      });
    };
    this.renderFunc = renderFunc;
  }
  render() {
    this.renderFunc();
    requestAnimationFrame(this.render.bind(this));
  }
}
