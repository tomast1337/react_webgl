import * as glM from "gl-matrix";
import { Mesh } from "./Mesh";
import { Shader } from "./Shader";

export class SceneObject {
  position: glM.vec3;
  rotation: glM.vec3;
  scale: glM.vec3;
  modelMatrix: glM.mat4;
  mesh: Mesh;
  shader: Shader;
  constructor(
    mesh: Mesh,
    shader: Shader,
    position = glM.vec3.create(),
    rotation = glM.vec3.create(),
    scale = glM.vec3.fromValues(1, 1, 1)
  ) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.modelMatrix = glM.mat4.create();
    this.mesh = mesh;
    this.shader = shader;
    this.updateModelMatrix();
  }

  updateModelMatrix() {
    glM.mat4.fromRotationTranslationScale(
      this.modelMatrix,
      glM.quat.fromEuler(
        glM.quat.create(),
        this.rotation[0],
        this.rotation[1],
        this.rotation[2]
      ),
      this.position,
      this.scale
    );
  }

  get modelMatrixArray() {
    return this.modelMatrix;
  }

  setPosition(position: glM.vec3) {
    this.position = position;
    this.updateModelMatrix();
  }

  setRotation(rotation: glM.vec3) {
    this.rotation = rotation;
    this.updateModelMatrix();
  }

  setScale(scale: glM.vec3) {
    this.scale = scale;
    this.updateModelMatrix();
  }

  translateObject(translation: glM.vec3) {
    glM.vec3.add(this.position, this.position, translation);
    this.updateModelMatrix();
  }

  rotateObject(rotation: glM.vec3) {
    glM.vec3.add(this.rotation, this.rotation, rotation);
    this.updateModelMatrix();
  }

  scaleObject(scale: glM.vec3) {
    glM.vec3.mul(this.scale, this.scale, scale);
    this.updateModelMatrix();
  }

  draw() {
    const modelMatrix = this.modelMatrix;
    const shader = this.shader;
    const mesh = this.mesh;
    shader.use((program) => {
      shader.setUniformMat4("u_model", modelMatrix);
    });
    mesh.draw();
  }
}
