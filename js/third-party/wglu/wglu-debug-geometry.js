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

var WGLUDebugGeometry = (function() {

  "use strict";

  var debugGeomVS = [
    "uniform mat4 projectionMat;",
    "uniform mat4 modelViewMat;",
    "attribute vec3 position;",

    "uniform vec3 offset;",
    "uniform vec3 scale;",

    "void main() {",
    "  gl_Position = projectionMat * modelViewMat * vec4( (position * scale) + offset, 1.0 );",
    "}",
  ].join("\n");

  var debugGeomFS = [
    "precision mediump float;",
    "uniform vec4 color;",

    "void main() {",
    "  gl_FragColor = color;",
    "}",
  ].join("\n");

  var DebugGeometry = function(gl) {
    this.gl = gl;

    this.geomMat = mat4.create();

    this.program = new WGLUProgram(gl);
    this.program.attachShaderSource(debugGeomVS, gl.VERTEX_SHADER);
    this.program.attachShaderSource(debugGeomFS, gl.FRAGMENT_SHADER);
    this.program.bindAttribLocation({ position: 0 });
    this.program.link();

    var verts = [];
    var indices = [];

    //
    // Cube Geometry
    //
    this.cubeIndexOffset = indices.length;

    var size = 0.5;
    // Bottom
    var idx = verts.length / 3.0;
    indices.push(idx, idx+1, idx+2);
    indices.push(idx, idx+2, idx+3);

    verts.push(-size, -size, -size);
    verts.push(+size, -size, -size);
    verts.push(+size, -size, +size);
    verts.push(-size, -size, +size);

    // Top
    idx = verts.length / 3.0;
    indices.push(idx, idx+2, idx+1);
    indices.push(idx, idx+3, idx+2);

    verts.push(-size, +size, -size);
    verts.push(+size, +size, -size);
    verts.push(+size, +size, +size);
    verts.push(-size, +size, +size);

    // Left
    idx = verts.length / 3.0;
    indices.push(idx, idx+2, idx+1);
    indices.push(idx, idx+3, idx+2);

    verts.push(-size, -size, -size);
    verts.push(-size, +size, -size);
    verts.push(-size, +size, +size);
    verts.push(-size, -size, +size);

    // Right
    idx = verts.length / 3.0;
    indices.push(idx, idx+1, idx+2);
    indices.push(idx, idx+2, idx+3);

    verts.push(+size, -size, -size);
    verts.push(+size, +size, -size);
    verts.push(+size, +size, +size);
    verts.push(+size, -size, +size);

    // Back
    idx = verts.length / 3.0;
    indices.push(idx, idx+2, idx+1);
    indices.push(idx, idx+3, idx+2);

    verts.push(-size, -size, -size);
    verts.push(+size, -size, -size);
    verts.push(+size, +size, -size);
    verts.push(-size, +size, -size);

    // Front
    idx = verts.length / 3.0;
    indices.push(idx, idx+1, idx+2);
    indices.push(idx, idx+2, idx+3);

    verts.push(-size, -size, +size);
    verts.push(+size, -size, +size);
    verts.push(+size, +size, +size);
    verts.push(-size, +size, +size);

    this.cubeIndexCount = indices.length - this.cubeIndexOffset;

    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  }

  DebugGeometry.prototype.bind = function(projectionMat, modelViewMat) {
    var gl = this.gl;
    var program = this.program;

    program.use();

    gl.uniformMatrix4fv(program.uniform.projectionMat, false, projectionMat);
    gl.uniformMatrix4fv(program.uniform.modelViewMat, false, modelViewMat);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.enableVertexAttribArray(program.attrib.position);
    gl.enableVertexAttribArray(program.attrib.texCoord);

    gl.vertexAttribPointer(program.attrib.position, 3, gl.FLOAT, false, 12, 0);
  }

  DebugGeometry.prototype.drawCube = function(position, size, color) {
    var gl = this.gl;
    gl.uniform4fv(this.program.uniform.color, color);
    gl.uniform3fv(this.program.uniform.offset, position);
    gl.uniform3f(this.program.uniform.scale, size, size, size);

    gl.drawElements(gl.TRIANGLES, this.cubeIndexCount, gl.UNSIGNED_SHORT, this.cubeIndexOffset * 2.0);
  }

  return DebugGeometry;
})();
