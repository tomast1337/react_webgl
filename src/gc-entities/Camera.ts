import * as glM from "gl-matrix";
import { keysType } from "./index";

export class Camera {
  //A posição da câmera no espaço.
  public position: glM.vec3;
  //A direção "para cima" do mundo.
  private up: glM.vec3;
  //A direção "para a direita" do mundo.
  private right: glM.vec3;
  //A direção "para frente" da câmera.
  private front: glM.vec3;
  //A direção "para cima" do mundo.
  private world_up: glM.vec3;
  //O ângulo de rotação da câmera em torno do eixo Y.
  public yaw: number;
  //O ângulo de rotação da câmera em torno do eixo X.
  public pitch: number;
  //A matriz de projeção da câmera.
  public projection: glM.mat4;
  //A matriz de visualização da câmera. indica a posição da câmera no espaço.
  public view: glM.mat4;
  //O campo de visão da câmera.
  private fov: number;
  //A largura da tela.
  private width: number;
  //A altura da tela.
  private height: number;
  //A distância mínima de renderização.
  private near: number;
  //A distância máxima de renderização.
  private far: number;
  constructor(
    position: glM.vec3,
    world_up: glM.vec3,
    yaw: number,
    pitch: number,
    fov = 45.0,
    width = 800,
    height = 600,
    near = 0.1,
    far = 100.0
  ) {
    this.position = position;
    this.world_up = world_up;
    this.yaw = yaw;
    this.pitch = pitch;
    this.front = glM.vec3.create();
    this.right = glM.vec3.create();
    this.up = glM.vec3.create();
    this.projection = glM.mat4.create();
    this.view = glM.mat4.create();

    this.fov = fov;
    this.width = width;
    this.height = height;
    this.near = near;
    this.far = far;

    glM.mat4.perspective(
      this.projection,
      glM.glMatrix.toRadian(fov),
      width / height,
      near,
      far
    );

    this.updateCameraVectors();
  }
  updateCameraVectors() {
    const front = glM.vec3.create();
    front[0] =
      Math.cos(glM.glMatrix.toRadian(this.yaw)) *
      Math.cos(glM.glMatrix.toRadian(this.pitch));
    front[1] = Math.sin(glM.glMatrix.toRadian(this.pitch));
    front[2] =
      Math.sin(glM.glMatrix.toRadian(this.yaw)) *
      Math.cos(glM.glMatrix.toRadian(this.pitch));
    this.front = glM.vec3.normalize(front, front);
    this.right = glM.vec3.normalize(
      glM.vec3.cross(glM.vec3.create(), this.front, this.world_up),
      glM.vec3.cross(glM.vec3.create(), this.front, this.world_up)
    );
    this.up = glM.vec3.normalize(
      glM.vec3.cross(glM.vec3.create(), this.right, this.front),
      glM.vec3.cross(glM.vec3.create(), this.right, this.front)
    );
  }
  get viewMatrix() {
    this.updateViewMatrix();
    return this.view;
  }
  private updateViewMatrix() {
    this.view = glM.mat4.lookAt(
      this.view,
      this.position,
      glM.vec3.add(glM.vec3.create(), this.position, this.front),
      this.up
    );
  }
  get projectionMatrix() {
    return this.projection;
  }
  public setProjectionMatrixProps(
    width: number,
    height: number,
    near: number,
    far: number,
    fov: number
  ) {
    this.fov = fov;
    this.width = width;
    this.height = height;
    this.near = near;
    this.far = far;
    this.updateProjectionMatrix();
  }

  public updateProjectionMatrixFov(fov: number) {
    this.fov = fov;
    this.updateProjectionMatrix();
  }

  public updateProjectionMatrixAspect(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.updateProjectionMatrix();
  }
  private updateProjectionMatrix() {
    glM.mat4.perspective(
      this.projection,
      glM.glMatrix.toRadian(this.fov),
      this.width / this.height,
      this.near,
      this.far
    );
  }

  setProjectionMatrix(projection: glM.mat4) {
    this.projection = projection;
  }
  setPosition(position: glM.vec3) {
    this.position = position;
    this.updateCameraVectors();
  }
  setYaw(yaw: number) {
    this.yaw = yaw;
    this.updateCameraVectors();
  }
  setPitch(pitch: number) {
    this.pitch = pitch;
    this.updateCameraVectors();
  }

  processKeyboard(keys: keysType) {
    const velocity = 0.1;
    if (keys["w"]) {
      this.position = glM.vec3.add(
        glM.vec3.create(),
        this.position,
        glM.vec3.scale(glM.vec3.create(), this.front, velocity)
      );
    }
    if (keys["s"]) {
      this.position = glM.vec3.sub(
        glM.vec3.create(),
        this.position,
        glM.vec3.scale(glM.vec3.create(), this.front, velocity)
      );
    }
    if (keys["a"]) {
      this.position = glM.vec3.sub(
        glM.vec3.create(),
        this.position,
        glM.vec3.scale(glM.vec3.create(), this.right, velocity)
      );
    }
    if (keys["d"]) {
      this.position = glM.vec3.add(
        glM.vec3.create(),
        this.position,
        glM.vec3.scale(glM.vec3.create(), this.right, velocity)
      );
    }
    if (keys["q"]) {
      this.position = glM.vec3.sub(
        glM.vec3.create(),
        this.position,
        glM.vec3.scale(glM.vec3.create(), this.up, velocity)
      );
    }
    if (keys["e"]) {
      this.position = glM.vec3.add(
        glM.vec3.create(),
        this.position,
        glM.vec3.scale(glM.vec3.create(), this.up, velocity)
      );
    }
    if (keys["j"]) {
      // print camera position rotation on key press
      console.log("Camera position: " + this.position);
      console.log("yaw:" + this.yaw + " pitch:" + this.pitch);
    }
  }
  processMouseMovement(
    xoffset: number,
    yoffset: number,
    constrainPitch: boolean = true
  ) {
    const sensitivity = 0.1;
    xoffset *= sensitivity;
    yoffset *= sensitivity;

    this.yaw += xoffset;
    this.pitch += yoffset;

    if (constrainPitch) {
      if (this.pitch > 89.0) {
        this.pitch = 89.0;
      }
      if (this.pitch < -89.0) {
        this.pitch = -89.0;
      }
    }
    this.updateCameraVectors();
  }

  // Static methods
  static createDefaultCamera = (width: number, height: number) => {
    return new Camera(
      glM.vec3.fromValues(0, 0, 3),
      glM.vec3.fromValues(0, 1, 0),
      -90,
      0,
      45,
      width,
      height,
      0.1,
      100
    );
  };

  static createIsometricCamera = (width: number, height: number) => {
    return new Camera(
      glM.vec3.fromValues(0, 0, 3),
      glM.vec3.fromValues(0, 1, 0),
      -45,
      45,
      45,
      width,
      height,
      0.1,
      100
    );
  };
}
