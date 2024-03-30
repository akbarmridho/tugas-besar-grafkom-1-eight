export class WebglUtils {
  public gl: WebGLRenderingContext;
  // @ts-ignore
  public program: WebGLProgram;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  /**
   * Creates and compiles a shader.
   *
   * @param {!WebGLRenderingContext} gl The WebGL Context.
   * @param {string} shaderSource The GLSL source code for the shader.
   * @param {number} shaderType The type of shader, VERTEX_SHADER or
   *     FRAGMENT_SHADER.
   * @return {!WebGLShader} The shader.
   */
  compileShader(shaderSource: string, shaderType: number): WebGLShader {
    // Create the shader object
    const shader = this.gl.createShader(shaderType);

    if (shader === null) {
      throw 'could not create shader';
    }

    // Set the shader source code.
    this.gl.shaderSource(shader, shaderSource);

    // Compile the shader
    this.gl.compileShader(shader);

    // Check if it compiled
    var success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
    if (!success) {
      // Something went wrong during compilation; get the error
      throw 'could not compile shader:' + this.gl.getShaderInfoLog(shader);
    }

    return shader;
  }

  /**
   * Creates a program from 2 shaders.
   *
   * @param {!WebGLRenderingContext} gl The WebGL context.
   * @param {!WebGLShader} vertexShader A vertex shader.
   * @param {!WebGLShader} fragmentShader A fragment shader.
   * @return {!WebGLProgram} A program.
   */
  createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    // create a program.
    const program = this.gl.createProgram();

    if (program === null) {
      throw 'could not create program';
    }

    this.program = program;

    // attach the shaders.
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);

    // link the program.
    this.gl.linkProgram(this.program);
    this.gl.useProgram(this.program);

    // Check if it linked.
    var success = this.gl.getProgramParameter(
      this.program,
      this.gl.LINK_STATUS
    );
    if (!success) {
      // something went wrong with the link
      throw 'program failed to link:' + this.gl.getProgramInfoLog(this.program);
    }
    return this.program;
  }

  clear() {
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  render(
    attribute = 'a_position',
    positions: number[] = [],
    size = 2,
    type = this.gl.FLOAT,
    isNormalized = false
  ) {
    const positionAttributeLocation = this.gl.getAttribLocation(
      this.program,
      attribute
    );
    const positionBuffer = this.gl.createBuffer();

    const stride = 0;
    const offset = 0;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      this.gl.STATIC_DRAW
    );

    this.gl.useProgram(this.program);
    this.gl.enableVertexAttribArray(positionAttributeLocation);
    this.gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      isNormalized,
      stride,
      offset
    );
  }
}
