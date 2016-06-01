
function vShader () {

    var vs =
    'precision mediump float;\
     attribute vec3 aVertexPosition;\
     uniform mat4 uMVMatrix;\
     uniform mat4 uPMatrix;\
     uniform mat4 uTMatrix;\
     void main(void) {\
        gl_Position = uPMatrix * uMVMatrix * uTMatrix * vec4(aVertexPosition, 1.0);\
    }';
    
    return vs;
}

function fShader() {
    var fs =
    'precision mediump float;\
     struct node {\
                int type;\
                mat4 mMatrix;\
     };\
     uniform mat4 uPMatrix;\
     uniform mat4 uMVMatrix;\
     uniform mat4 uTMatrix;\
     uniform int lightCount;\
     uniform vec3 lightPosition;\
     uniform int objType;\
     uniform int nodeCount;\
     uniform node nodes[2];\
     void main(void) {\
        gl_FragColor = vec4(0.5,0.5,0.5, 1.0);\
     }';
     
    return fs;
}
