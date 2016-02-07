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

var WGLUStats = (function() {

  "use strict";

  var statsVS = [
    "uniform mat4 projectionMat;",
    "uniform mat4 modelViewMat;",
    "attribute vec3 position;",
    "attribute vec3 color;",
    "varying vec4 vColor;",

    "void main() {",
    "  vColor = vec4(color, 1.0);",
    "  gl_Position = projectionMat * modelViewMat * vec4( position.xy, position.z - 1.0, 1.0 );",
    "}",
  ].join("\n");

  var statsFS = [
    "precision mediump float;",
    "varying vec4 vColor;",

    "void main() {",
    "  gl_FragColor = vColor;",
    "}",
  ].join("\n");

  var segments = 100;
  var maxFPS = 120;

  function segmentToX(i) {
    return ((0.9/segments) * i) - 0.45;
  }

  function fpsToY(value) {
    return (Math.min(value, maxFPS) * (0.7 / maxFPS)) - 0.45;
  }

  var Stats = function(gl) {
    this.gl = gl;

    this.program = new WGLUProgram(gl);
    this.program.attachShaderSource(statsVS, gl.VERTEX_SHADER);
    this.program.attachShaderSource(statsFS, gl.FRAGMENT_SHADER);
    this.program.bindAttribLocation({
      position: 0,
      color: 1
    });
    this.program.link();

    var bgVerts = [];
    var bgIndices = [];

    function addBGSquare(left, bottom, right, top, z, r, g, b) {
      var idxOffset = bgVerts.length / 6;

      bgVerts.push(left, bottom, z, r, g, b);
      bgVerts.push(right, top, z, r, g, b);
      bgVerts.push(left, top, z, r, g, b);
      bgVerts.push(right, bottom, z, r, g, b);

      bgIndices.push(idxOffset, idxOffset+1, idxOffset+2,
                     idxOffset, idxOffset+3, idxOffset+1);
    };

    // Panel Background
    addBGSquare(-0.5, -0.5, 0.5, 0.5, 0.0, 0.0, 0.0, 0.25);

    // FPS Background
    addBGSquare(-0.45, -0.45, 0.45, 0.25, 0.01, 0.0, 0.0, 0.125);

    // 30 FPS line
    addBGSquare(-0.45, fpsToY(30), 0.45, fpsToY(30.5), 0.015, 0.5, 0.0, 0.5);

    // 60 FPS line
    addBGSquare(-0.45, fpsToY(60), 0.45, fpsToY(60.5), 0.015, 0.2, 0.0, 0.75);

    // 90 FPS line
    addBGSquare(-0.45, fpsToY(90), 0.45, fpsToY(90.5), 0.015, 0.0, 0.0, 1.0);

    this.bgVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bgVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bgVerts), gl.STATIC_DRAW);

    this.bgIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bgIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bgIndices), gl.STATIC_DRAW);

    this.bgIndexCount = bgIndices.length;

    var fpsVerts = [];
    var fpsIndices = [];

    for (var i = 0; i < segments; ++i) {
      fpsVerts.push(segmentToX(i), fpsToY(0), 0.02, 0.0, 0.8, 0.8);
    }

    for (var i = 0; i < segments; ++i) {
      var value = (Math.random() * 30) + 0;
      fpsVerts.push(segmentToX(i), fpsToY(value), 0.02, 0.0, 1.0, 1.0);
    }

    for (var i = 0; i < segments-1; ++i) {
      fpsIndices.push(i, i+1, i+segments+1,
                      i+segments+1, i+segments, i);
    }

    this.fpsVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.fpsVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fpsVerts), gl.STATIC_DRAW);

    this.fpsIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.fpsIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fpsIndices), gl.STATIC_DRAW);

    this.fpsIndexCount = fpsIndices.length;
  }

  Stats.prototype.render = function(projectionMat, modelViewMat) {
    var gl = this.gl;
    var program = this.program;

    program.use();

    gl.uniformMatrix4fv(program.uniform.projectionMat, false, projectionMat);
    gl.uniformMatrix4fv(program.uniform.modelViewMat, false, modelViewMat);

    gl.enableVertexAttribArray(program.attrib.position);
    gl.enableVertexAttribArray(program.attrib.color);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bgVertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bgIndexBuffer);

    gl.vertexAttribPointer(program.attrib.position, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(program.attrib.color, 3, gl.FLOAT, false, 24, 12);

    gl.drawElements(gl.TRIANGLES, this.bgIndexCount, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.fpsVertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.fpsIndexBuffer);

    gl.vertexAttribPointer(program.attrib.position, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(program.attrib.color, 3, gl.FLOAT, false, 24, 12);

    gl.drawElements(gl.TRIANGLES, this.fpsIndexCount, gl.UNSIGNED_SHORT, 0);
  }

  return Stats;
})();
