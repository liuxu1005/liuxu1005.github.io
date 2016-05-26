
function vShader () {

    var vs =
    'attribute vec3 aVertexPosition;\
     attribute vec3 aVertexNormal;\
     uniform mat4 uMVMatrix;\
     uniform mat4 uPMatrix;\
     uniform mat4 uTMatrix;\
     varying float product;\
     void main(void) {\
        gl_Position = uPMatrix * uMVMatrix * uTMatrix * vec4(aVertexPosition, 1.0);\
        vec3 l = vec3(0.0, 0.0, -1.0);\
        vec3 nor = normalize(aVertexNormal);\
        product = max(dot(l, nor), 0.0);\
    }';
    
    return vs;
}

function fShader() {
    var fs =
    'varying mediump float product;\
     void main(void) {\
         gl_FragColor = product * vec4(0.8, 0.6, 0.3, 1.0);\
     }';
     
    return fs;
}
