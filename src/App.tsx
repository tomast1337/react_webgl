import * as React from "react";
import * as glM from "gl-matrix";
import { keysType } from "./gc-entities";
import { Camera } from "./gc-entities/Camera";
import { Shader } from "./gc-entities/Shader";
import { Texture } from "./gc-entities/Texture";
import { Mesh } from "./gc-entities/Mesh";
import { SceneObject } from "./gc-entities/SceneObject";
import { DirectionalLight } from "./gc-entities/Lights/DirectionalLight";

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
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1,
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          padding: "10px",
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
        }}
      >
        <h1>Instructions</h1>
        {`Use the mouse to move the camera
Press ESC to unlock the mouse

Use 

  W 
A S D 

to move the camera`}
      </div>
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

const skyDomePipeline = {
  vertexShaderSource: `#version 300 es
in vec3 in_position;
in vec2 in_uv;
in vec3 in_normal;

out vec2 out_uv; // send uv to fragment shader

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;

void main() {
    out_uv = in_uv;
    gl_Position = u_projection * u_view * u_model * vec4(in_position, 1.0);
}
`,

  fragmentShaderSource: `#version 300 es
precision highp float;

in vec2 out_uv; // receive uv from vertex shader

out vec4 out_color; // send color to screen

uniform sampler2D u_texture;

void main() {
    out_color = texture(u_texture, out_uv);
}
`,
};

const ps1Pipeline = {
  vertexShaderSource: `#version 300 es
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
        
vec4 snap(vec4 vertexPos, vec2 resolution) // Emulates playstation 1 float imprecision
{
    vec4 snappedPos = vertexPos;
    snappedPos.xyz = vertexPos.xyz / vertexPos.w; // convert to normalised device coordinates (NDC)
    snappedPos.xy = floor(resolution * snappedPos.xy) / resolution; // snap the vertex to the lower-resolution grid
    snappedPos.xyz *= vertexPos.w; // convert back to projection-space
    return snappedPos;
}


void main() {
    //vec4 word = u_model * vec4(in_position, 1.0);
    //vec4 view = u_projection * u_view;
    //vec4 pos = view * word;
    //gl_Position = pos; 

    vec2 resolution = vec2(250.0, 250.0);

    vec4 pos = u_projection * u_view * u_model * vec4(in_position, 1.0);
    gl_Position = snap(pos, resolution);

    vec4 word = u_model * vec4(in_position, 1.0);
            
    out_word_pos = word.xyz;
    out_uv = in_uv;
    out_normal = mat3(u_model) * in_normal;
}
`,
  fragmentShaderSource: `#version 300 es
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
`,
};

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

    this.camera = Camera.createDefaultCamera(
      this.gl.canvas.width,
      this.gl.canvas.height
    );

    this.camera.updateProjectionMatrixFov(90);

    this.camera.setPosition(
      glM.vec3.fromValues(
        4.493191719055176,
        6.700974464416504,
        -21.64906883239746
      )
    );
    this.camera.setPitch(-16);
    this.camera.setYaw(460);
    const shaderPS1 = Shader.createShader(
      this.gl,
      ps1Pipeline.vertexShaderSource,
      ps1Pipeline.fragmentShaderSource
    );

    const skyDomeShader = Shader.createShader(
      this.gl,
      skyDomePipeline.vertexShaderSource,
      skyDomePipeline.fragmentShaderSource
    );

    const background = {
      r: 0,
      g: 0,
      b: 0,
    };

    // update mouse position
    this.canvas.addEventListener("mousemove", (e) => {
      this.camera.processMouseMovement(e.movementX, e.movementY);
    });

    // update gyroscope position
    window.addEventListener("deviceorientation", (e) => {
        if (e.alpha === null || e.beta === null || e.gamma === null) {
            return;
        } 

      this.camera.processGyroscopeMovement(e.alpha, e.beta, e.gamma);
    });

    // finge drag to move camera
    let fingerDown = false;
    let lastX = 0;
    let lastY = 0;
    this.canvas.addEventListener("touchstart", (e) => {
        fingerDown = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
    });
    this.canvas.addEventListener("touchmove", (e) => {
        if (!fingerDown) {
            return;
        }
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const dx = x - lastX;
        const dy = y - lastY;
        this.camera.processMouseMovement(dx, dy);
        lastX = x;
        lastY = y;
    });
    this.canvas.addEventListener("touchend", (e) => {
        fingerDown = false;
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

    const starsTexture = Texture.loadTexture(
      this.gl,
      "/textures/Stars.jpeg",
      "image",
      true,
      false
    );

    const earthTexture = Texture.loadTexture(
      this.gl,
      "/textures/earth.jpg",
      "image",
      true,
      false
    );

    const moonTexture = Texture.loadTexture(
      this.gl,
      "/textures/moon.jpg",
      "image",
      true,
      false
    );

    // sky dome
    const skyDome = new SceneObject(
      Mesh.createSphere(this.gl, 100, 8, 8, starsTexture, true),
      skyDomeShader,
      glM.vec3.fromValues(0, 0, 0),
      glM.vec3.fromValues(0, 0, 0),
      glM.vec3.fromValues(1, 1, 1)
    );

    // earth
    const earth = new SceneObject(
      Mesh.createSphere(this.gl, 1, 8, 8, earthTexture),
      shaderPS1,
      glM.vec3.fromValues(0, 0, 0),
      glM.vec3.fromValues(0, 0, 0),
      glM.vec3.fromValues(1, 1, 1)
    );
    earth.setPosition(glM.vec3.fromValues(0, 0, 0));
    earth.setScale(glM.vec3.fromValues(2, 2, 2));
    earth.setRotation(glM.vec3.fromValues(180, 0, 0));

    // moon
    const moon = new SceneObject(
      Mesh.createSphere(this.gl, 1, 8, 8, moonTexture),
      shaderPS1,
      glM.vec3.fromValues(0, 0, 0),
      glM.vec3.fromValues(0, 0, 0),
      glM.vec3.fromValues(1, 1, 1)
    );
    moon.setPosition(glM.vec3.fromValues(0, 0, 0));
    moon.setScale(glM.vec3.fromValues(0.5, 0.5, 0.5));

    // get moon orbit
    const moonOrbit = (time: number): glM.vec3 => {
      const x = Math.cos(time) * 5;
      const y = 0;
      const z = Math.sin(time) * 5;
      return glM.vec3.fromValues(x, y, z);
    };

    this.scene = new Scene(shaderPS1);

    // resize canvas
    window.addEventListener("resize", resizeCanvas);
    const renderFunc = () => {
      updateCamera();
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.gl.clearColor(background.r, background.g, background.b, 1);

      // sky dome
      // move de sky dome to the camera position
      skyDome.setPosition(this.camera.position);
      // rotate the sky dome to the camera rotation
      let currentRotation = skyDome.rotation;
      skyDome.setRotation(
        glM.vec3.fromValues(
          currentRotation[0],
          currentRotation[1] + 0.001,
          currentRotation[2]
        )
      );
      // draw the sky dome
      skyDomeShader.use((program) => {
        skyDomeShader.setUniformMat4(
          "u_projection",
          this.camera.projectionMatrix
        );
        skyDomeShader.setUniformMat4("u_view", this.camera.viewMatrix);
        // bind the sky dome texture
        skyDomeShader.setUniformTexture("u_texture", skyDome.mesh.texture, 0);
        skyDome.draw();
      });

      // earth
      const currentEarthRotation = earth.rotation;
      earth.setRotation(
        glM.vec3.fromValues(
          currentEarthRotation[0],
          currentEarthRotation[1] - 0.05,
          currentEarthRotation[2]
        )
      );
      earth.draw();

      // moon
      const currentMoonRotation = moon.rotation;
      moon.setPosition(moonOrbit(Date.now() * 0.001));
      moon.setRotation(
        glM.vec3.fromValues(
          currentMoonRotation[0],
          currentMoonRotation[1] - 0.01,
          currentMoonRotation[2]
        )
      );
      moon.draw();

      shaderPS1.use((program) => {
        shaderPS1.setUniformMat4("u_projection", this.camera.projectionMatrix);
        shaderPS1.setUniformMat4("u_view", this.camera.viewMatrix);
      });

      this.scene.draw();
    };
    this.renderFunc = renderFunc;
  }
  render() {
    this.renderFunc();
    requestAnimationFrame(this.render.bind(this));
  }
}
