/* My WebGL camera object constructor */

function Camera() {

    this.near = 0.1;
    this.far = 100.0;
    this.eye = quat.fromValues(0.0, 0.0, 10.0, 1.0);
    this.focus = quat.fromValues(0.0, 0.0, 0.0, 1.0);
    this.up = vec4.fromValues(0.0, 1.0, 0.0, 0.0);
    this.rotation = mat4.create();
    this.ratio = 1.0;
    this.fovy = 0.8;
    
 
   
    this.pMatrix = mat4.create(); 
    mat4.perspective(this.pMatrix, this.fovy, this.ratio, this.near, this.far);
    this.mvMatrix = mat4.create();
    mat4.lookAt(this.mvMatrix, [this.eye[0], this.eye[1], this.eye[2]], 
                         [this.focus[0], this.focus[1], this.focus[2]], 
                         [this.up[0], this.up[1], this.up[2]]);
    
    this.getPMatrix = function () {
        return this.pMatrix;
    }
    
    this.getMVMatrix = function () {
        var tmp = mat4.create();
        return mat4.multiply(tmp, this.mvMatrix, this.rotation);
    }
 
    
    this.setPerspective = function (fovy, ratio, near, far) {
        this.fovy = fovy;
        this.ratio = ratio;
        this.near = near;
        this.far = far;
        mat4.identity(this.pMatrix);
        mat4.perspective(this.pMatrix, this.fovy, this.ratio, 
                                        this.near, this.far);
    
    }
    
    this.setLookat = function (eye, focus, up) {
        this.eye = eye;
        this.focus = focus;
        this.up = up;
        mat4.identity(this.mvMatrix);
        mat4.lookAt(this.mvMatrix, [this.eye[0], this.eye[1], this.eye[2]], 
                             [this.focus[0], this.focus[1], this.focus[2]], 
                                      [this.up[0], this.up[1], this.up[2]]);
    
    }
    
    
    this.rotate = function (startX, startY, curX, curY) {
    
 
        var s = quat.fromValues(startX,  startY, 0.0, 1.0);
        var c = quat.fromValues(curX, curY, 0.0, 1.0);
        
        var MVinverse = mat4.create();
        mat4.multiply(MVinverse, this.pMatrix, this.mvMatrix);
        mat4.invert(MVinverse, MVinverse);
 
        mat4.multiply(s, MVinverse, s);
        mat4.multiply(c, MVinverse, c);
 
        
        var v1 = vec3. fromValues(this.eye[0], this.eye[1], this.eye[2]);
        var v2 = vec3.fromValues(c[0] - s[0], c[1] - s[1], c[2] - s[2]);
        var rad = Math.sqrt((startX - curX) * (startX - curX) 
                         + (startY - curY) * (startY - curY));
        var axis = vec3.fromValues(v1[1] * v2[2] - v2[1] * v1[2], 
                                       v1[2] * v2[0] - v2[2] * v1[0],
                                       v1[0] * v2[1] - v2[0] * v1[1]);  
  
        vec3.normalize(axis, axis);
        var tmp = mat4.create();  
        mat4.rotate(tmp, tmp, rad, axis);
        mat4.multiply(this.rotation, tmp, this.rotation);
  
    }  
       
}



 
