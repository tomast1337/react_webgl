import * as React from "react";
import * as glM from "gl-matrix";
import { keysType } from "./gc-entities";
import { Camera } from "./gc-entities/Camera";
import { Shader } from "./gc-entities/Shader";
import { Texture } from "./gc-entities/Texture";
import { Mesh } from "./gc-entities/Mesh";
import { SceneObject } from "./gc-entities/SceneObject";
import { DirectionalLight } from "./gc-entities/Lights/DirectionalLight";
import { AmbientLight } from "./gc-entities/Lights/AmbientLight";

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

const vertexShaderSource = `#version 300 es
in vec3 in_position;
in vec2 in_uv;
in vec3 in_normal;
        
out vec2 out_uv; // send uv to fragment shader
out vec3 out_normal; // send normal to fragment shader
out vec3 out_word_pos; // send word to fragment shader
out vec3 out_word_normal; // send word to fragment shader
        
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;
        
vec4 snap(vec4 vertex, vec2 resolution) // Emulates playstation 1 float imprecision
{
    vec4 snappedPos = vertex;
    snappedPos.xyz = vertex.xyz / vertex.w; // convert to normalised device coordinates (NDC)
    snappedPos.xy = floor(resolution * snappedPos.xy) / resolution; // snap the vertex to the lower-resolution grid
    snappedPos.xyz *= vertex.w; // convert back to projection-space
    return snappedPos;
}


void main() {
    //vec4 word = u_model * vec4(in_position, 1.0);
    //vec4 view = u_projection * u_view;
    //vec4 pos = view * word;
    //gl_Position = pos; 

    vec2 resolution = vec2(50.0, 50.0);

    vec4 pos = u_projection * u_view * u_model * vec4(in_position, 1.0);
    gl_Position = snap(pos, resolution);

    vec4 word = u_model * vec4(in_position, 1.0);
            
    out_word_pos = word.xyz;
    out_uv = in_uv;
    out_normal = mat3(u_model) * in_normal;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

struct DirectionalLight {
    vec3 direction;
    vec3 color;
};
        
in vec2 out_uv; // receive uv from vertex shader
in vec3 out_normal; // receive normal from vertex shader
in vec3 out_word_pos; // receive word from vertex shader

 out vec4 color; // send color to the gpu to be rendered
        
uniform sampler2D in_texture; // select texture slot
uniform DirectionalLight u_directionalLight;

// Create a step function that will clamp the light value to a certain number of steps
float lightStepClamp(float light,int steps) {
    float step = 1.0 / float(steps);
    float lightStep = step * floor(light / step);
    return lightStep;
}


void main() {
    vec3 face_normal = normalize(out_normal);
    vec3 light_dir = normalize(u_directionalLight.direction);
    // directional light
    float light = max(dot(face_normal, light_dir), 0.0);
    light = lightStepClamp(light,5);
    
    vec2 uv = out_uv;

    //color = texture(in_texture, out_uv).rgba;
    color = texture(in_texture, uv).rgba;

    color.rgb *= light + vec3(0.2, 0.2, 0.2);
}
`;

class Scene {
  objects: SceneObject[] = [];
  directionalLight: DirectionalLight;
  lightsShader: Shader;
  constructor(lightShader: Shader) {
    this.directionalLight = new DirectionalLight(
      glM.vec3.fromValues(0, 0, 1),
      glM.vec3.fromValues(1, 1, 1)
    );
    this.lightsShader = lightShader;
  }
  add(obj: SceneObject) {
    this.objects.push(obj);
  }

  draw() {
    for (const obj of this.objects) {
      obj.draw();
    }
    const shader = this.lightsShader;
    shader.use((program) => {
      shader.setUniformDirectionalLight(
        "u_directionalLight",
        this.directionalLight
      );
    });
  }
}

class Render {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  camera: Camera;
  scene: Scene;

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

    // z buffer,
    this.gl.clearDepth(1.0);
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // enable alpha blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA); // this allows us to have transparent textures

    // face culling
    //gl.enable(gl.CULL_FACE);
    //gl.cullFace(gl.FRONT);

    this.camera = Camera.createIsometricCamera(
      this.gl.canvas.width,
      this.gl.canvas.height
    );
    const shader = Shader.createShader(
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

    const texturePng = Texture.loadTexture(
      this.gl,
      "/textures/wall.png",
      "image",
      true,
      false
    );
    const textureJpg = Texture.loadTexture(
      this.gl,
      "/textures/test.jpg",
      "image",
      true,
      false
    );
    const textureTranparent = Texture.loadTexture(
      this.gl,
      "/textures/glass.png",
      "transparent",
      true,
      false
    );

    const spyroTexture = Texture.loadTexture(
        this.gl,
        "/textures/Glimmer_ObjectTextures.png",
        "transparent",
        true,
        false
    );

    this.scene = new Scene(shader);

    Array.from({ length: 1 }).forEach(async (_, i) => {
      const oPosition = glM.vec3.fromValues(
        0,//Math.random() * 50 - 5,
        0,//Math.random() * 50 - 5,
        0,//Math.random() * 50 - 5
      );
      const oRotation = glM.vec3.fromValues(
        0,//Math.random() * 360,
        0,//Math.random() * 360,
        0,//Math.random() * 360
      );
      const rScale = 1;//Math.random() * 5;

      const oScale = glM.vec3.fromValues(rScale, rScale, rScale);

      // pick random mesh and texture from Mesh.createSphere, Mesh.createCube and Mesh.createPlane

      const texture = [textureTranparent, texturePng, textureJpg][
        Math.floor(Math.random() * 3)
      ];

      const mesh = [
        await  Mesh.LoadOBJ(this.gl, "spyro.obj", spyroTexture),
        //Mesh.createSphere(this.gl, 1, 8, 8, texture),
        //Mesh.createCube(this.gl, 1, 1, 1, texture),
        //Mesh.createPlane(this.gl, 1, 1, texture),
      ][Math.floor(Math.random() * 1)];

      const sceneObject = new SceneObject(
        mesh,
        shader,
        oPosition,
        oRotation,
        oScale
      );
      this.scene.add(sceneObject);
    });

    // resize canvas
    window.addEventListener("resize", resizeCanvas);
    const renderFunc = () => {
      updateCamera();

      // move the directional light in a circle around the scene
      this.scene.directionalLight.direction = glM.vec3.fromValues(
        parseFloat(Math.sin(Date.now() / 1000).toFixed(1)),
        parseFloat(Math.cos(Date.now() / 1000).toFixed(1)),
        parseFloat(Math.sin(Date.now() / 1000).toFixed(1))
      );

      //this.gl.clearColor(background.r, background.g, background.b, 1);
      shader.use((program) => {
        shader.setUniformMat4("u_projection", this.camera.projectionMatrix);
        shader.setUniformMat4("u_view", this.camera.viewMatrix);
      });

      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      this.gl.clearColor(background.r, background.g, background.b, 1);

      this.scene.draw();
    };
    this.renderFunc = renderFunc;
  }
  render() {
    this.renderFunc();
    requestAnimationFrame(this.render.bind(this));
  }
}
