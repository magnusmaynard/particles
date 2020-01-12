
// function initShaderProgram(gl, vsSource, fsSource) {
//     const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
//     const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
 
//     const shaderProgram = gl.createProgram();
//     gl.attachShader(shaderProgram, vertexShader);
//     gl.attachShader(shaderProgram, fragmentShader);
//     gl.linkProgram(shaderProgram);
 
//     if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
//        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
//        return null;
//     }
 
//     return shaderProgram;
//  }
 
//  function loadShader(gl, type, source) {
//     const shader = gl.createShader(type);
 
//     gl.shaderSource(shader, source);
 
//     gl.compileShader(shader);
 
//     if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
//        gl.deleteShader(shader);
//        return null;
//     }
 
//     return shader;
//  }
 
 
//  class ShaderProgram {
//     constructor(gl, vertexShaderSource, fragmentShaderSource) {
//        this.gl = gl;
//        this.program = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
//        this.attributeLocations = null;
//     }
 
//     bind() {
//        this.gl.useProgram(this.program);
//     }
 
//     updateUniformMat4(name, value) {
//        this.gl.uniformMatrix4fv(
//           this.gl.getUniformLocation(this.program, name),
//           false,
//           value);
//     }
 
//     updateUniformVec3(name, value) {
//        this.gl.uniform3fv(
//           this.gl.getUniformLocation(this.program, name),
//           value);
//     }
 
//     getAttributeLocation(attribute) {
//        return this.gl.getAttribLocation(this.program, attribute);
//     }
 
//     //TODO: move attributes inside shader, use yield to return a object containing all the attibutes?
//     //TODO: cache uniform location inside shader, don't call gl.getUniformLocation everytime.
//     //TODO: move private functions inside shader.
//     //TODO: use uniform buffer objects.
//  }





// //Based on Mozilla's WebGL tutorial:
// //https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial

// var rotation = 0.0;

// main();

// function main() {

//    var constructVertexDataRequired = true;

//    canvas.addEventListener('click', function () {
//       constructVertexDataRequired = true;
//    }, false);

//    if (!gl) {
//       alert('Unable to initialize WebGL. Your browser or machine may not support it.');
//       return;
//    }

//    const vertexShaderSource = getVertexShaderSource();
//    const fragmentShaderSource = getFragmentShaderSource();
//    const shaderProgram = new ShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

//    var vertexData = null;
//    var buffers = null;

//    var then = 0;
//    function render(now) {
//       now *= 0.001;
//       const deltaTime = now - then;
//       then = now;

//       if (constructVertexDataRequired) {

//          //Cleanup.
//          deleteBuffers(gl, buffers);

//          //Construct new data.
//          vertexData = constructTrianglesWithNormals();
//          buffers = initBuffers(gl, vertexData);

//          constructVertexDataRequired = false;
//       }

//       drawScene(gl, shaderProgram, buffers, vertexData, deltaTime);

//       requestAnimationFrame(render);
//    }
//    requestAnimationFrame(render);
// }

// function deleteBuffers(gl, buffers) {

//    if (buffers != null) {

//       if (buffers.position != null) {
//          gl.deleteBuffer(buffers.position);
//       }

//       if (buffers.normal != null) {
//          gl.deleteBuffer(buffers.normal);
//       }

//       buffers = null;
//    }
// }

// function resize(canvas) {
//    var displayWidth = canvas.clientWidth;
//    var displayHeight = canvas.clientHeight;

//    if (canvas.width != displayWidth ||
//       canvas.height != displayHeight) {

//       canvas.width = displayWidth;
//       canvas.height = displayHeight;
//    }
// }

// function getVertexShaderSource() {
//    return `
//     attribute vec3 aVertexPosition;
//     attribute vec3 aVertexNormal;

//     uniform mat4 uModelViewMatrix;
//     uniform mat4 uProjectionMatrix;
//     uniform mat4 uNormalMatrix;
//     uniform vec3 uLightDirection;

//     varying highp vec3 vsColor;

//     void main(void) {
//       highp vec3 ambient = vec3(0.05);
//       highp vec3 diffuse = vec3(0.15);

//       //highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1);
//       highp vec3 transformedNormal = mat3(uNormalMatrix) * aVertexNormal;

//       vsColor = ambient + diffuse * max(dot(transformedNormal, -normalize(uLightDirection)), 0.0);

//       gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
//     }
//   `;
// }

// function getFragmentShaderSource() {
//    return `
//     varying highp vec3 vsColor;

//     varying highp vec4 color;

//     void main(void) {
//       gl_FragColor = vec4(vsColor, 1.0);
//     }
//   `;
// }


// function constructTrianglesWithNormals() {
//    var sections = 40;

//    var xSpacing = 0.4;
//    var radian = 60 * Math.PI / 180.0;
//    var adjacent = xSpacing / 2.0;
//    var ySpacing = Math.tan(radian) * adjacent;
//    var zScaleFactor = 1.25;

//    var halfWidth = (sections / 2) * xSpacing;
//    var halfHeight = (sections / 2) * ySpacing;

//    //Add positions that are indexed.
//    var positionsIndexed = [];
//    for (var y = 0; y < sections; y++) {
//       for (var x = 0; x < sections; x++) {

//          var posX = x * xSpacing - halfWidth;
//          var posY = y * ySpacing - halfHeight;
//          var posZ = Math.random() * zScaleFactor * xSpacing;

//          if (y % 2 != 0) {
//             //Offset to equilateral triangle.
//             posX -= xSpacing / 2;
//          }

//          positionsIndexed.push({ x: posX, y: posY, z: posZ });
//       }
//    }

//    //Add positions.
//    var positions = [];
//    for (var y = 0; y < sections - 1; y++) {
//       for (var x = 0; x < sections - 1; x++) {
//          var row = y * sections;
//          var nextRow = row + sections;

//          var p0 = positionsIndexed[row + x];
//          var p1 = positionsIndexed[row + x + 1];
//          var p2 = positionsIndexed[nextRow + x + 1];
//          var p3 = positionsIndexed[nextRow + x];

//          if (y % 2 == 0) {
//             positions.push(p0.x, p0.y, p0.z);
//             positions.push(p2.x, p2.y, p2.z);
//             positions.push(p3.x, p3.y, p3.z);

//             positions.push(p0.x, p0.y, p0.z);
//             positions.push(p1.x, p1.y, p1.z);
//             positions.push(p2.x, p2.y, p2.z);
//          } else {
//             positions.push(p0.x, p0.y, p0.z);
//             positions.push(p1.x, p1.y, p1.z);
//             positions.push(p3.x, p3.y, p3.z);

//             positions.push(p3.x, p3.y, p3.z);
//             positions.push(p1.x, p1.y, p1.z);
//             positions.push(p2.x, p2.y, p2.z);
//          }
//       }
//    }

//    //Add normals.
//    var normals = [];
//    var vertexPerTri = 3;
//    var components = 3;
//    var stride = vertexPerTri * components;
//    for (var i = 0; i < positions.length; i += stride) {

//       var a = vec3.create();
//       a[0] = positions[i + 0];
//       a[1] = positions[i + 1];
//       a[2] = positions[i + 2];

//       var b = vec3.create();
//       b[0] = positions[i + 3];
//       b[1] = positions[i + 4];
//       b[2] = positions[i + 5];

//       var c = vec3.create();
//       c[0] = positions[i + 6];
//       c[1] = positions[i + 7];
//       c[2] = positions[i + 8];

//       var normal = calculateFacetNormal(a, b, c);

//       normals.push(normal[0], normal[1], normal[2]);
//       normals.push(normal[0], normal[1], normal[2]);
//       normals.push(normal[0], normal[1], normal[2]);
//    }

//    return {
//       positions: positions,
//       normals: normals
//    }
// }

// function calculateFacetNormal(a, b, c) {
//    var u = vec3.create();
//    var v = vec3.create();

//    vec3.subtract(u, b, a);
//    vec3.subtract(v, c, a);

//    var normal = vec3.create();
//    vec3.cross(normal, u, v);

//    vec3.normalize(normal, normal);

//    return normal;
// }

// function constructTrianglesWithIndices() {

//    var positions = [];
//    var indices = [];

//    var sections = 20;

//    var xSpacing = 1.0;

//    var radian = 60 * Math.PI / 180.0;
//    var adjacent = xSpacing / 2.0;
//    var ySpacing = Math.tan(radian) * adjacent;

//    var halfWidth = (sections / 2) * xSpacing;
//    var halfHeight = (sections / 2) * ySpacing;

//    //Add positions.
//    for (var y = 0; y < sections; y++) {
//       for (var x = 0; x < sections; x++) {

//          var posX = x * xSpacing - halfWidth;
//          var posY = y * ySpacing - halfHeight;

//          if (y % 2 != 0) {
//             //Offset to equilateral triangle.
//             posX -= xSpacing / 2;
//          }

//          positions.push(posX, posY, 0);
//       }
//    }

//    //Add indices.
//    for (var y = 0; y < sections - 1; y++) {
//       for (var x = 0; x < sections - 1; x++) {
//          var row = y * sections;
//          var nextRow = row + sections;

//          if (y % 2 == 0) {
//             indices.push(row + x);
//             indices.push(nextRow + x + 1);
//             indices.push(nextRow + x);

//             indices.push(row + x);
//             indices.push(row + x + 1);
//             indices.push(nextRow + x + 1);
//          } else {
//             indices.push(row + x);
//             indices.push(row + x + 1);
//             indices.push(nextRow + x);

//             indices.push(nextRow + x);
//             indices.push(row + x + 1);
//             indices.push(nextRow + x + 1);

//          }
//       }
//    }

//    return {
//       positions: positions,
//       indices: indices
//    }
// }

// function initBuffers(gl, vertexData) {

//    const positionBuffer = gl.createBuffer();
//    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData.positions), gl.STATIC_DRAW);

//    const normalBuffer = gl.createBuffer();
//    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
//    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData.normals), gl.STATIC_DRAW);


//    return {
//       position: positionBuffer,
//       normal: normalBuffer
//    };
// }

// function drawScene(gl, shaderProgram, buffers, vertexData, deltaTime) {

//    resize(gl.canvas);
//    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

//    gl.clearColor(0, 0, 0, 1.0);
//    gl.clearDepth(1.0);
//    gl.enable(gl.DEPTH_TEST);
//    gl.depthFunc(gl.LEQUAL);

//    gl.disable(gl.CULL_FACE);

//    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//    const fieldOfView = 45 * Math.PI / 180;
//    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
//    const zNear = 0.1;
//    const zFar = 100.0;
//    const projectionMatrix = mat4.create();

//    mat4.perspective(
//       projectionMatrix,
//       fieldOfView,
//       aspect,
//       zNear,
//       zFar);

//    const modelViewMatrix = mat4.create();

//    mat4.translate(
//       modelViewMatrix,
//       modelViewMatrix,
//       [-0.0, 0.0, -6.0]);

//    //var lightDirection = vec3.create();
//    //lightDirection[0] = Math.cos(rotation * 0.1);
//    //lightDirection[1] = Math.sin(rotation * 0.1);
//    //lightDirection[2] = -1;

//    var lightDirection = vec3.create();
//    lightDirection[0] = 0;
//    lightDirection[1] = 1;
//    lightDirection[2] = -1;

//    //const radian = toRadians(0);

//    //mat4.rotate(
//    //   modelViewMatrix,
//    //   modelViewMatrix,
//    //   rotation,
//    //   [1, 0, 0]);

//    //mat4.rotate(
//    //modelViewMatrix,
//    //   modelViewMatrix,
//    //   rotation * .7,
//    //   [0, 1, 0]);

//    //mat4.rotate(
//    //modelViewMatrix,
//    //   modelViewMatrix,
//    //   rotation * .3,
//    //   [1, 0, 0]);


//    var rotationScale = 0.08;
//    var rotationSpeed = 0.1;

//    mat4.rotate(
//       modelViewMatrix,
//       modelViewMatrix,
//       Math.sin(rotation * rotationSpeed) * rotationScale,
//       [0, 1, 0]);

//    mat4.rotate(
//       modelViewMatrix,
//       modelViewMatrix,
//       Math.cos(rotation * rotationSpeed) * rotationScale,
//       [1, 0, 0]);


//    const normalMatrix = mat4.create();
//    mat4.invert(normalMatrix, modelViewMatrix);
//    mat4.transpose(normalMatrix, normalMatrix);

//    {
//       const vertexPosition = shaderProgram.getAttributeLocation('aVertexPosition');
//       const numComponents = 3;
//       const type = gl.FLOAT;
//       const normalize = false;
//       const stride = 0;
//       const offset = 0;

//       gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

//       gl.vertexAttribPointer(
//          vertexPosition,
//          numComponents,
//          type,
//          normalize,
//          stride,
//          offset);

//       gl.enableVertexAttribArray(
//          vertexPosition);
//    }

//    {
//       const vertexNormal = shaderProgram.getAttributeLocation('aVertexNormal');
//       const numComponents = 3;
//       const type = gl.FLOAT;
//       const normalize = true;
//       const stride = 0;
//       const offset = 0;

//       gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);

//       gl.vertexAttribPointer(
//          vertexNormal,
//          numComponents,
//          type,
//          normalize,
//          stride,
//          offset);

//       gl.enableVertexAttribArray(
//          vertexNormal);
//    }

//    shaderProgram.bind();

//    shaderProgram.updateUniformMat4('uProjectionMatrix', projectionMatrix);
//    shaderProgram.updateUniformMat4('uModelViewMatrix', modelViewMatrix);
//    shaderProgram.updateUniformMat4('uNormalMatrix', normalMatrix);
//    shaderProgram.updateUniformVec3('uLightDirection', lightDirection);

//    {
//       const vertexCount = vertexData.positions.length / 3;
//       gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
//    }


//    rotation += deltaTime;
// }

