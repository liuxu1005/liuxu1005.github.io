/* My WebGL camera object constructor */

function Camera() {

    this.near = 0.1;
    this.far = 100.0;
    this.eye = quat.fromValues(13.0, 13.0, 13.0, 1.0);
    this.focus = quat.fromValues(0.0, 0.0, 0.0, 1.0);
    this.up = vec4.fromValues(0.0, 1.0, 0.0, 0.0);
  
    this.ratio = 1.0;
    this.fovy = 0.1;
    

    this.pMatrix = mat4.create(); 
    mat4.perspective(this.pMatrix, this.fovy, this.ratio, this.near, this.far);
    this.mvMatrix = mat4.create();
    mat4.lookAt(this.mvMatrix, [this.eye[0], this.eye[1], this.eye[2]], 
                         [this.focus[0], this.focus[1], this.focus[2]], 
                         [this.up[0], this.up[1], this.up[2]]);
    
    this.getPMatrix = function () {
        return this.pMatrix;
    }
    this.getFocus = function() {
        return this.focus;
    }
    this.getFovy = function () {
        return this.fovy;
    }
   
    this.getMVMatrix = function () {
         
        return  this.mvMatrix;
    }
 
    this.getEye = function () {
        return this.eye;
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
    
}



 
