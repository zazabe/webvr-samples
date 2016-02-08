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

  var sevenSegmentVS = [
    "uniform mat4 projectionMat;",
    "uniform mat4 modelViewMat;",
    "attribute vec2 position;",

    "void main() {",
    "  gl_Position = projectionMat * modelViewMat * vec4( position, 0.0, 1.0 );",
    "}",
  ].join("\n");

  var sevenSegmentFS = [
    "precision mediump float;",
    "uniform vec4 color;",

    "void main() {",
    "  gl_FragColor = color;",
    "}",
  ].join("\n");

  var SevenSegmentText = function (gl) {
    this.gl = gl;

    this.program = new WGLUProgram(gl);
    this.program.attachShaderSource(sevenSegmentVS, gl.VERTEX_SHADER);
    this.program.attachShaderSource(sevenSegmentFS, gl.FRAGMENT_SHADER);
    this.program.bindAttribLocation({
      position: 0,
      color: 1
    });
    this.program.link();

    var verts = [];
    var segmentIndices = {};
    var indices = [];

    var width = 0.5;
    var thickness = 0.25;
    this.kerning = 2.0;

    this.matrix = mat4.create();

    function defineSegment(id, left, top, right, bottom) {
      var idx = verts.length / 2;
      verts.push(
          left, top,
          right, top,
          right, bottom,
          left, bottom);

      segmentIndices[id] = [
          idx, idx+1, idx+2,
          idx, idx+2, idx+3];
    }

    var characters = {};
    this.characters = characters;

    function defineCharacter(c, segments) {
      var character = {
        character: c,
        offset: indices.length * 2,
        count: 0
      };

      for (var i = 0; i < segments.length; ++i) {
        var idx = segments[i];
        var segment = segmentIndices[idx];
        character.count += segment.length;
        indices.push.apply(indices, segment);
      }

      characters[c] = character;
    }

    /* Segment layout is as follows:

    |-0-|
    3   4
    |-1-|
    5   6
    |-2-|

    */

    defineSegment(0, -1, 1, width, 1-thickness);
    defineSegment(1, -1, thickness*0.5, width, -thickness*0.5);
    defineSegment(2, -1, -1+thickness, width, -1);
    defineSegment(3, -1, 1, -1+thickness, -thickness*0.5);
    defineSegment(4, width-thickness, 1, width, -thickness*0.5);
    defineSegment(5, -1, thickness*0.5, -1+thickness, -1);
    defineSegment(6, width-thickness, thickness*0.5, width, -1);


    defineCharacter("0", [0, 2, 3, 4, 5, 6]);
    defineCharacter("1", [4, 6]);
    defineCharacter("2", [0, 1, 2, 4, 5]);
    defineCharacter("3", [0, 1, 2, 4, 6]);
    defineCharacter("4", [1, 3, 4, 6]);
    defineCharacter("5", [0, 1, 2, 3, 6]);
    defineCharacter("6", [0, 1, 2, 3, 5, 6]);
    defineCharacter("7", [0, 4, 6]);
    defineCharacter("8", [0, 1, 2, 3, 4, 5, 6]);
    defineCharacter("9", [0, 1, 2, 3, 4, 6]);
    defineCharacter("A", [0, 1, 3, 4, 5, 6]);
    defineCharacter("B", [1, 2, 3, 5, 6]);
    defineCharacter("C", [0, 2, 3, 5]);
    defineCharacter("D", [1, 2, 4, 5, 6]);
    defineCharacter("E", [0, 1, 2, 4, 6]);
    defineCharacter("F", [0, 1, 3, 5]);
    defineCharacter("P", [0, 1, 3, 4, 5]);
    defineCharacter("-", [1]);
    defineCharacter(" ", []);
    defineCharacter("_", [2]); // Used for undefined characters


    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  };

  SevenSegmentText.prototype.render = function(projectionMat, modelViewMat, text, r, g, b, a) {
    var gl = this.gl;
    var program = this.program;

    if (r == undefined || g == undefined || b == undefined) {
      r = 0.0;
      g = 1.0;
      b = 0.0;
    }

    if (a == undefined)
      a = 1.0;

    program.use();

    gl.uniformMatrix4fv(program.uniform.projectionMat, false, projectionMat);
    gl.uniform4f(program.uniform.color, r, g, b, a);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.enableVertexAttribArray(program.attrib.position);
    gl.vertexAttribPointer(program.attrib.position, 2, gl.FLOAT, false, 8, 0);

    text = text.toUpperCase();

    var offset = 0;

    for (var i = 0; i < text.length; ++i) {
      var c;
      if (text[i] in this.characters) {
        c = this.characters[text[i]];
      } else {
        c = this.characters["_"];
      }

      if (c.count != 0) {
        mat4.fromTranslation(this.matrix, [offset, 0, 0]);
        mat4.multiply(this.matrix, modelViewMat, this.matrix);

        gl.uniformMatrix4fv(program.uniform.modelViewMat, false, this.matrix);
        gl.drawElements(gl.TRIANGLES, c.count, gl.UNSIGNED_SHORT, c.offset);

      }

      offset += this.kerning;
    }
  }

  var statsVS = [
    "uniform mat4 projectionMat;",
    "uniform mat4 modelViewMat;",
    "attribute vec3 position;",
    "attribute vec3 color;",
    "varying vec4 vColor;",

    "void main() {",
    "  vColor = vec4(color, 1.0);",
    "  gl_Position = projectionMat * modelViewMat * vec4( position, 1.0 );",
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

  function fpsToRGB(value) {
    return {
      r: Math.max(0.0, Math.min(1.0, 1.0 - (value/60))),
      g: Math.max(0.0, Math.min(1.0, ((value-15)/(maxFPS-15)))),
      b: Math.max(0.0, Math.min(1.0, ((value-15)/(maxFPS-15))))
    };
  }

  var now = ( performance && performance.now ) ? performance.now.bind( performance ) : Date.now;

  var Stats = function(gl) {
    this.gl = gl;

    this.sevenSegmentText = new SevenSegmentText(gl);

    this.startTime = now();
    this.prevTime = this.startTime;
    this.frames = 0;
    this.fps = 0;

    this.orthoMatrix = mat4.create();
    this.matrix = mat4.create();
    this.textMatrix = mat4.create();

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
    addBGSquare(-0.5, -0.5, 0.5, 0.5, 0.0, 0.0, 0.0, 0.125);

    // FPS Background
    addBGSquare(-0.45, -0.45, 0.45, 0.25, 0.01, 0.0, 0.0, 0.4);

    // 30 FPS line
    addBGSquare(-0.45, fpsToY(30), 0.45, fpsToY(32), 0.015, 0.5, 0.0, 0.5);

    // 60 FPS line
    addBGSquare(-0.45, fpsToY(60), 0.45, fpsToY(62), 0.015, 0.2, 0.0, 0.75);

    this.fpsVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.fpsVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fpsVerts), gl.DYNAMIC_DRAW);

    this.fpsIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.fpsIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fpsIndices), gl.STATIC_DRAW);

    this.fpsIndexCount = fpsIndices.length;
  };

  Stats.prototype.begin = function() {
    this.startTime = now();
  };

  Stats.prototype.end = function() {
    var time = now();

    this.frames++;

    if (time > this.prevTime + 250) {
      this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));

      this.updateGraph(this.fps);

      this.prevTime = time;
      this.frames = 0;
    }
  };

  Stats.prototype.updateGraph = function(value) {
    var color = fpsToRGB(value);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.fpsVertBuffer);

    var updateVerts = [
      segmentToX(this.lastSegment), fpsToY(value), 0.02, color.r, color.g, color.b,
      segmentToX(this.lastSegment+1), fpsToY(value), 0.02, color.r, color.g, color.b,
      segmentToX(this.lastSegment), fpsToY(0), 0.02, color.r, color.g, color.b,
      segmentToX(this.lastSegment+1), fpsToY(0), 0.02, color.r, color.g, color.b,
    ];

    color.r = 0.2;
    color.g = 1.0;
    color.b = 0.2;

    if (this.lastSegment == segments - 1) {
      gl.bufferSubData(gl.ARRAY_BUFFER, this.lastSegment * 24 * 4, new Float32Array(updateVerts));
      updateVerts = [
        segmentToX(0), fpsToY(maxFPS), 0.02, color.r, color.g, color.b,
        segmentToX(.25), fpsToY(maxFPS), 0.02, color.r, color.g, color.b,
        segmentToX(0), fpsToY(0), 0.02, color.r, color.g, color.b,
        segmentToX(.25), fpsToY(0), 0.02, color.r, color.g, color.b
      ];
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(updateVerts));
    } else {
      updateVerts.push(
        segmentToX(this.lastSegment+1), fpsToY(maxFPS), 0.02, color.r, color.g, color.b,
        segmentToX(this.lastSegment+1.25), fpsToY(maxFPS), 0.02, color.r, color.g, color.b,
        segmentToX(this.lastSegment+1), fpsToY(0), 0.02, color.r, color.g, color.b,
        segmentToX(this.lastSegment+1.25), fpsToY(0), 0.02, color.r, color.g, color.b
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

    mat4.identity(this.textMatrix);
    mat4.translate(this.textMatrix, this.textMatrix, [-0.4, 0.4, 0.0]);
    mat4.scale(this.textMatrix, this.textMatrix, [0.075, 0.075, 1]);
    mat4.translate(this.textMatrix, this.textMatrix, [0.5, -0.5, 0.02]);


    mat4.multiply(this.textMatrix, modelViewMat, this.textMatrix);

    this.sevenSegmentText.render(projectionMat, this.textMatrix, this.fps + " FP5");
    // TODO: Render FPS text
  }

  Stats.prototype.renderOrtho = function(x, y, width, height) {
    var canvas = this.gl.canvas;

    mat4.ortho(this.orthoMatrix, 0, canvas.width, 0, canvas.height, 0.1, 1024);

    mat4.identity(this.matrix);
    mat4.translate(this.matrix, this.matrix, [x, canvas.height - height - y, -1]);
    mat4.scale(this.matrix, this.matrix, [width, height, 1]);
    mat4.translate(this.matrix, this.matrix, [0.5, 0.5, 0]);

    this.render(this.orthoMatrix, this.matrix);
  }

  return Stats;
})();
