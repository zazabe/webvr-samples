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
    "  gl_Position = projectionMat * modelViewMat * vec4( position.xy, position.z - 2.0, 1.0 );",
    "}",
  ].join("\n");

  var statsFS = [
    "precision mediump float;",
    "varying vec4 vColor;",

    "void main() {",
    "  gl_FragColor = vColor;",
    "}",
  ].join("\n");

  var segments = 30;
  var maxFPS = 90;

  function segmentToX(i) {
    return ((0.9/segments) * i) - 0.45;
  }

  function fpsToY(value) {
    return (Math.min(value, maxFPS) * (0.7 / maxFPS)) - 0.45;
  }

  var now = ( performance && performance.now ) ? performance.now.bind( performance ) : Date.now;

  var Stats = function(gl) {
    this.gl = gl;

    this.startTime = now();
    this.prevTime = this.startTime;
    this.frames = 0;
    this.fps = 0;

    this.lastSegment = 0;

    this.program = new WGLUProgram(gl);
    this.program.attachShaderSource(statsVS, gl.VERTEX_SHADER);
    this.program.attachShaderSource(statsFS, gl.FRAGMENT_SHADER);
    this.program.bindAttribLocation({
      position: 0,
      color: 1
    });
    this.program.link();

    var fpsVerts = [];
    var fpsIndices = [];

    // Graph geometry
    for (var i = 0; i < segments; ++i) {
      // Bar top
      fpsVerts.push(segmentToX(i), fpsToY(0), 0.02, 0.0, 1.0, 1.0);
      fpsVerts.push(segmentToX(i+1), fpsToY(0), 0.02, 0.0, 1.0, 1.0);

      // Bar bottom
      fpsVerts.push(segmentToX(i), fpsToY(0), 0.02, 0.0, 1.0, 1.0);
      fpsVerts.push(segmentToX(i+1), fpsToY(0), 0.02, 0.0, 1.0, 1.0);

      var idx = i * 4;
      fpsIndices.push(idx, idx+3, idx+1,
                      idx+3, idx, idx+2);
    }

    function addBGSquare(left, bottom, right, top, z, r, g, b) {
      var idx = fpsVerts.length / 6;

      fpsVerts.push(left, bottom, z, r, g, b);
      fpsVerts.push(right, top, z, r, g, b);
      fpsVerts.push(left, top, z, r, g, b);
      fpsVerts.push(right, bottom, z, r, g, b);

      fpsIndices.push(idx, idx+1, idx+2,
                     idx, idx+3, idx+1);
    };

    // Panel Background
    addBGSquare(-0.5, -0.5, 0.5, 0.5, 0.0, 0.0, 0.0, 0.25);

    // FPS Background
    addBGSquare(-0.45, -0.45, 0.45, 0.25, 0.01, 0.0, 0.0, 0.125);

    // 30 FPS line
    addBGSquare(-0.45, fpsToY(30), 0.45, fpsToY(30.5), 0.015, 0.5, 0.0, 0.5);

    // 60 FPS line
    addBGSquare(-0.45, fpsToY(60), 0.45, fpsToY(60.5), 0.015, 0.2, 0.0, 0.75);

    this.fpsVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.fpsVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fpsVerts), gl.DYNAMIC_DRAW);

    this.fpsIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.fpsIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fpsIndices), gl.STATIC_DRAW);

    this.fpsIndexCount = fpsIndices.length;
  }

  Stats.prototype.begin = function() {
    this.startTime = now();
  };

  Stats.prototype.end = function() {
    var time = now();

    this.frames++;

    if (time > this.prevTime + 100) {
      this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));

      this.updateGraph(this.fps);

      this.prevTime = time;
      this.frames = 0;
    }
  };

  Stats.prototype.updateGraph = function(value) {
    var r = 1.0 - (value/maxFPS);
    var g = (value/maxFPS);
    var b = (value/maxFPS);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.fpsVertBuffer);

    var updateVerts = [
      segmentToX(this.lastSegment), fpsToY(value), 0.02, r, g, b,
      segmentToX(this.lastSegment+1), fpsToY(value), 0.02, r, g, b,
      segmentToX(this.lastSegment), fpsToY(0), 0.02, r, g, b,
      segmentToX(this.lastSegment+1), fpsToY(0), 0.02, r, g, b,
    ];

    r = 0.2;
    g = 1.0;
    b = 0.2;

    if (this.lastSegment == segments - 1) {
      gl.bufferSubData(gl.ARRAY_BUFFER, this.lastSegment * 24 * 4, new Float32Array(updateVerts));
      updateVerts = [
        segmentToX(0), fpsToY(maxFPS), 0.02, r, g, b,
        segmentToX(.25), fpsToY(maxFPS), 0.02, r, g, b,
        segmentToX(0), fpsToY(0), 0.02, r, g, b,
        segmentToX(.25), fpsToY(0), 0.02, r, g, b
      ];
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(updateVerts));
    } else {
      updateVerts.push(
        segmentToX(this.lastSegment+1), fpsToY(maxFPS), 0.02, r, g, b,
        segmentToX(this.lastSegment+1.25), fpsToY(maxFPS), 0.02, r, g, b,
        segmentToX(this.lastSegment+1), fpsToY(0), 0.02, r, g, b,
        segmentToX(this.lastSegment+1.25), fpsToY(0), 0.02, r, g, b
      );
      gl.bufferSubData(gl.ARRAY_BUFFER, this.lastSegment * 24 * 4, new Float32Array(updateVerts));
    }

    this.lastSegment = (this.lastSegment+1) % segments;
  };

  Stats.prototype.render = function(projectionMat, modelViewMat) {
    var gl = this.gl;
    var program = this.program;

    program.use();

    gl.uniformMatrix4fv(program.uniform.projectionMat, false, projectionMat);
    gl.uniformMatrix4fv(program.uniform.modelViewMat, false, modelViewMat);

    gl.enableVertexAttribArray(program.attrib.position);
    gl.enableVertexAttribArray(program.attrib.color);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.fpsVertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.fpsIndexBuffer);

    gl.vertexAttribPointer(program.attrib.position, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(program.attrib.color, 3, gl.FLOAT, false, 24, 12);

    gl.drawElements(gl.TRIANGLES, this.fpsIndexCount, gl.UNSIGNED_SHORT, 0);

    // TODO: Render FPS text
  }

  return Stats;
})();
