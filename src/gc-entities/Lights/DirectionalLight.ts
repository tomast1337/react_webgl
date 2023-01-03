import * as glM from "gl-matrix";

export class DirectionalLight {
  direction: glM.vec3;
  color: glM.vec3;
  constructor(direction: glM.vec3, color: glM.vec3) {
    this.direction = direction;
    this.color = color;
  }
}
