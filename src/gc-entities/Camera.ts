import * as glM from "gl-matrix";
import { keysType } from "./index";

export class Camera {
  public position: glM.vec3;
  private world_up: glM.vec3;
  public yaw: number;
  public pitch: number;
  private front: glM.vec3;
  private right: glM.vec3;
  private up: glM.vec3;
  public projection: glM.mat4;
  private fov: number;
  private width: number;
  private height: number;
  private near: number;
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
    const view = glM.mat4.create();
    return glM.mat4.lookAt(
      view,
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
  }
  setYaw(yaw: number) {
    this.yaw = yaw;
  }
  setPitch(pitch: number) {
    this.pitch = pitch;
  }

  processKeyboard(keys: keysType) {
    const velocity = .1;
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
}

export const createDefaultCamera = (width: number, height: number) => {
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
