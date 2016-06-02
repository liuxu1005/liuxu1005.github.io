
function vShader () {

    var vs =
    'precision highp float;\
     attribute vec3 aVertexPosition;\
     uniform mat4 uMVMatrix;\
     uniform mat4 uPMatrix;\
     uniform mat4 uTMatrix;\
     uniform int objType;\
     varying float withtexture;\
     varying vec2 tcoord;\
     void main(void) {\
        float i, j;\
        gl_Position = uPMatrix * uMVMatrix * uTMatrix * vec4(aVertexPosition, 1.0);\
        if (objType == 1) {\
            withtexture = 0.8;\
            float radius = sqrt(aVertexPosition.z * aVertexPosition.z\
                             + aVertexPosition.x * aVertexPosition.x);\
            i = acos(aVertexPosition.x/radius)/(2.0 * 3.1415926);\
            if (aVertexPosition.z >= 0.0 ) {\
                i = 1.0 - i;\
            }\
            j = asin(aVertexPosition.y/0.5)/3.1415926 + 0.5;\
            tcoord = vec2(i, j);\
        } else {\
            withtexture = 0.3;\
        }\
    }';
    
    return vs;
}

function fShader() {
    var fs =
    'precision highp float;\
     struct node {\
                int type;\
                mat4 mMatrix;\
     };\
     uniform sampler2D image0;\
     uniform sampler2D image1;\
     uniform mat4 uPMatrix;\
     uniform mat4 uMVMatrix;\
     uniform mat4 uTMatrix;\
     uniform int lightCount;\
     uniform vec3 lightPosition;\
     uniform int nodeCount;\
     uniform node nodes[2];\
     varying float withtexture;\
     varying vec2 tcoord;\
     void main(void) {\
        if (withtexture > 0.5) {\
            gl_FragColor = texture2D(image1, tcoord);\
        } else {\
            gl_FragColor = vec4(0.2, 0.5, 0.8, 1.0);\
        }\
     }';
     
    return fs;
}
