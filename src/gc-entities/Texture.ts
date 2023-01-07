export type TextureType = "image" | "transparent";

export class Texture {
  gl: WebGL2RenderingContext;
  texture: WebGLTexture;
  id: number;
  constructor(
    gl: WebGL2RenderingContext,
    imagePath: string,
    type: TextureType = "image",
    warps: { s: number; t: number } = {
      s: gl.CLAMP_TO_EDGE,
      t: gl.CLAMP_TO_EDGE,
    },
    filters: { min: number; mag: number } = {
      min: gl.LINEAR,
      mag: gl.LINEAR,
    }
  ) {
    this.gl = gl;
    this.texture = this.gl.createTexture()!;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, warps.s);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, warps.t);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      filters.min
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      filters.mag
    );
    if (type == "image") {
      const image = new Image();
      image.src = imagePath;
      image.addEventListener(
        "load",
        () => {
          this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
          this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGB,
            this.gl.RGB,
            this.gl.UNSIGNED_BYTE,
            image
          );
          console.log(`Loaded texture ${imagePath}`);
        },
        false
      );
    } else if (type == "transparent") {
      const image = new Image();
      image.src = imagePath;
      image.addEventListener(
        "load",
        () => {
          this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
          this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            image
          );
          //this.gl.generateMipmap(this.gl.TEXTURE_2D);
          console.log(`Loaded texture ${imagePath}`);
        },
        false
      );
    }
  }

  bind() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }

  unbind() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  static loadTexture(
    gl: WebGL2RenderingContext,
    imagePath: string,
    type: TextureType = "image",
    warps: boolean = true,
    filters: boolean = true
  ) {
    const warpsParams = {
      s: warps ? gl.REPEAT : gl.CLAMP_TO_EDGE,
      t: warps ? gl.REPEAT : gl.CLAMP_TO_EDGE,
    };
    const filtersParams = {
      min: filters ? gl.LINEAR : gl.NEAREST,
      mag: filters ? gl.LINEAR : gl.NEAREST,
    };
    return new Texture(gl, imagePath, type, warpsParams, filtersParams);
  }
}
