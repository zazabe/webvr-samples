/*
Copyright (c) 2016, Brandon Jones.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var WGLUCubeSea = (function() {

  "use strict";

  var cubeSeaVS = [
    "uniform mat4 projectionMat;",
    "uniform mat4 modelViewMat;",
    "attribute vec3 position;",
    "attribute vec2 texCoord;",
    "varying vec2 vTexCoord;",

    "void main() {",
    "  vTexCoord = texCoord;",
    "  gl_Position = projectionMat * modelViewMat * vec4( position, 1.0 );",
    "}",
  ].join("\n");

  var cubeSeaFS = [
    "precision mediump float;",
    "uniform sampler2D diffuse;",
    "varying vec2 vTexCoord;",

    "void main() {",
    "  gl_FragColor = texture2D(diffuse, vTexCoord);",
    "}",
  ].join("\n");

  var CubeSea = function(gl, texture) {
    this.gl = gl;

    this.texture = texture;

    this.program = new WGLUProgram(gl);
    this.program.attachShaderSource(cubeSeaVS, gl.VERTEX_SHADER);
    this.program.attachShaderSource(cubeSeaFS, gl.FRAGMENT_SHADER);
    this.program.bindAttribLocation({
      position: 0,
      texCoord: 1
    });
    this.program.link();

    var cubeVerts = [];
    var cubeIndices = [];

    // Build a single cube
    function appendCube(x, y, z) {
      if (!x && !y && !z) {
        // Don't create a cube in the center
        return;
      }

      var size = 0.2;
      // Bottom
      var idx = cubeVerts.length / 5.0;
      cubeIndices.push(idx, idx+1, idx+2);
      cubeIndices.push(idx, idx+2, idx+3);

      cubeVerts.push(x-size, y-size, z-size, 0.0, 1.0);
      cubeVerts.push(x+size, y-size, z-size, 1.0, 1.0);
      cubeVerts.push(x+size, y-size, z+size, 1.0, 0.0);
      cubeVerts.push(x-size, y-size, z+size, 0.0, 0.0);

      // Top
      idx = cubeVerts.length / 5.0;
      cubeIndices.push(idx, idx+2, idx+1);
      cubeIndices.push(idx, idx+3, idx+2);

      cubeVerts.push(x-size, y+size, z-size, 0.0, 0.0);
      cubeVerts.push(x+size, y+size, z-size, 1.0, 0.0);
      cubeVerts.push(x+size, y+size, z+size, 1.0, 1.0);
      cubeVerts.push(x-size, y+size, z+size, 0.0, 1.0);

      // Left
      idx = cubeVerts.length / 5.0;
      cubeIndices.push(idx, idx+2, idx+1);
      cubeIndices.push(idx, idx+3, idx+2);

      cubeVerts.push(x-size, y-size, z-size, 0.0, 1.0);
      cubeVerts.push(x-size, y+size, z-size, 0.0, 0.0);
      cubeVerts.push(x-size, y+size, z+size, 1.0, 0.0);
      cubeVerts.push(x-size, y-size, z+size, 1.0, 1.0);

      // Right
      idx = cubeVerts.length / 5.0;
      cubeIndices.push(idx, idx+1, idx+2);
      cubeIndices.push(idx, idx+2, idx+3);

      cubeVerts.push(x+size, y-size, z-size, 1.0, 1.0);
      cubeVerts.push(x+size, y+size, z-size, 1.0, 0.0);
      cubeVerts.push(x+size, y+size, z+size, 0.0, 0.0);
      cubeVerts.push(x+size, y-size, z+size, 0.0, 1.0);

      // Back
      idx = cubeVerts.length / 5.0;
      cubeIndices.push(idx, idx+2, idx+1);
      cubeIndices.push(idx, idx+3, idx+2);

      cubeVerts.push(x-size, y-size, z-size, 1.0, 1.0);
      cubeVerts.push(x+size, y-size, z-size, 0.0, 1.0);
      cubeVerts.push(x+size, y+size, z-size, 0.0, 0.0);
      cubeVerts.push(x-size, y+size, z-size, 1.0, 0.0);

      // Front
      idx = cubeVerts.length / 5.0;
      cubeIndices.push(idx, idx+1, idx+2);
      cubeIndices.push(idx, idx+2, idx+3);

      cubeVerts.push(x-size, y-size, z+size, 0.0, 1.0);
      cubeVerts.push(x+size, y-size, z+size, 1.0, 1.0);
      cubeVerts.push(x+size, y+size, z+size, 1.0, 0.0);
      cubeVerts.push(x-size, y+size, z+size, 0.0, 0.0);
    }

    // Build the cube sea
    for (var x = 0; x < 10; ++x) {
      for (var y = 0; y < 10; ++y) {
        for (var z = 0; z < 10; ++z) {
          appendCube(x - 5, y - 5, z - 5);
        }
      }
    }

    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVerts), gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    this.indexCount = cubeIndices.length;
  }

  CubeSea.prototype.render = function(projectionMat, modelViewMat) {
    var gl = this.gl;
    var program = this.program;

    program.use();

    gl.uniformMatrix4fv(program.uniform.projectionMat, false, projectionMat);
    gl.uniformMatrix4fv(program.uniform.modelViewMat, false, modelViewMat);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.enableVertexAttribArray(program.attrib.position);
    gl.enableVertexAttribArray(program.attrib.texCoord);

    gl.vertexAttribPointer(program.attrib.position, 3, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(program.attrib.texCoord, 2, gl.FLOAT, false, 20, 12);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(this.program.uniform.diffuse, 0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
  }

  return CubeSea;
})();