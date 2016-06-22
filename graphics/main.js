

var canvas;
var gl;
var viewportWidth;
var viewportHeight;
var mylightPosition = vec4.fromValues(0.0, 40.0, 0.0, 1.0);
var mylightColor = vec4.fromValues(0.5, 0.8, 0.8, 1.0);


var cubeMatrix;
var sphereMatrix;
var planeMatrix;

var sphereCenter;
var oldSphereCenter;
var sphereR = 0.15;
var sphereVelocity;
var gravity = vec4.fromValues(0.0, -0.001, 0.0, 0.0);
var buoyance =vec4.clone(gravity);
vec4.scale(buoyance, buoyance, -0.9);
var sumForce;
var mass = 1;
var epsilon = 0.005;


var initSphereMatrix = mat4.create();
    mat4.translate(initSphereMatrix, initSphereMatrix, [0.55, 1.0, 0.0]);
    mat4.scale(initSphereMatrix, initSphereMatrix, [0.3, 0.3, 0.3]);
   
var initSphereCenter = vec4.fromValues(0.55, 1.0, 0.0, 1.0);
var initForce = vec4.clone(gravity)
var initVelocity = vec4.fromValues(0.0, 0.0, 0.0, 0.0);

var cubeX = 0.6;
var cubeTopY = 0.06;
var cubeTopY1 = 0.3;
var cubeBottomY = -0.5
var cubeZ = 0.6;

var floorX = 2;
var floorY = -0.51;
var floorZ = 2;
 
var time = 100000.0;
var dCenter = [0.0, 0.06, 0.0, 1.0];

var vertexBuffer;
var texture = []; 

 
var vs = vShader();  
var fs = fShader(); 
var program;    


var mousedown = false;
var onTarget = false;
 
var startX = 0.0;
var startY = 0.0;
var camera = new Camera();   

var paused = false;

function initWebgl() {
    canvas = document.getElementById('Earth in Water');
    gl = canvas.getContext('webgl');
    viewportWidth = canvas.clientWidth;
    viewportHeight = canvas.clientHeight;
    camera.setPerspective(camera.getFovy(),
	                      viewportWidth/viewportHeight,
	                      camera.getNear(),
	                      camera.getFar());

}

function initProgram () {
    //compile shader
    var vshader = gl.createShader(gl.VERTEX_SHADER);
    var fshader = gl.createShader(gl.FRAGMENT_SHADER);
    
    gl.shaderSource(vshader, vs);
    gl.compileShader(vshader);
    
    gl.shaderSource(fshader, fs);
    gl.compileShader(fshader);

    program = gl.createProgram();
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);
    gl.useProgram(program);
} 

function initLight() {
    var tmp;
    tmp = gl.getUniformLocation(program, "mylightCount");
    gl.uniform1i(tmp, 1); 
    
    tmp = gl.getUniformLocation(program, "mylightPosition");
    gl.uniform4fv(tmp, mylightPosition);
    
    tmp = gl.getUniformLocation(program, "mylightColor");
    gl.uniform4fv(tmp, mylightColor);
}

function initScene() {

    
    planeMatrix = mat4.create();
    mat4.translate(planeMatrix, planeMatrix, [0.0, -0.51, 0.0]);
    mat4.scale(planeMatrix, planeMatrix, [4.0, 1.0, 4.0]);
    
    cubeMatrix = mat4.create();
    mat4.translate(cubeMatrix, cubeMatrix, [0.0, -0.1, 0.0]);
    mat4.scale(cubeMatrix, cubeMatrix, [1.2, 0.8, 1.2]);
    
    sphereCenter = vec4.clone(initSphereCenter);
    oldSphereCenter = vec4.clone(initSphereCenter);
    sphereMatrix = mat4.clone(initSphereMatrix);
    sphereVelocity = vec4.clone(initVelocity);
    sumForce = vec4.clone(initForce);
    
    var tmp;  
    tmp = gl.getUniformLocation(program, "objs[0].type");
    gl.uniform1i(tmp, 0);  
    
    tmp = gl.getUniformLocation(program, "objs[0].texture");
    gl.uniform1i(tmp, -1);
     
    tmp = gl.getUniformLocation(program, "objs[0].diffuse");
    gl.uniform1f(tmp, 0.1);
    
    tmp = gl.getUniformLocation(program, "objs[0].reflective");
    gl.uniform1f(tmp, 0.3);
    
    tmp = gl.getUniformLocation(program, "objs[0].shiness");
    gl.uniform1f(tmp, 30);
    
    tmp = gl.getUniformLocation(program, "objs[0].refrective");
    gl.uniform1f(tmp, 0.99);
    
    tmp = gl.getUniformLocation(program, "objs[0].ior");
    gl.uniform1f(tmp, 1.33);
    
    tmp = gl.getUniformLocation(program, "objs[0].blend");
    gl.uniform1f(tmp, 0.5);
    
    tmp = gl.getUniformLocation(program, "objs[1].type");
    gl.uniform1i(tmp, 1);
    
    tmp = gl.getUniformLocation(program, "objs[1].texture");
    gl.uniform1i(tmp, 1);
    
    tmp = gl.getUniformLocation(program, "objs[1].diffuse");
    gl.uniform1f(tmp, 0.1);
    
    tmp = gl.getUniformLocation(program, "objs[1].reflective");
    gl.uniform1f(tmp, 0.1);
    
    tmp = gl.getUniformLocation(program, "objs[1].shiness");
    gl.uniform1f(tmp, 30);
    
    tmp = gl.getUniformLocation(program, "objs[1].refrective");
    gl.uniform1f(tmp, -1.0);
    
    tmp = gl.getUniformLocation(program, "objs[1].ior");
    gl.uniform1f(tmp, 1.0);
    
    tmp = gl.getUniformLocation(program, "objs[1].blend");
    gl.uniform1f(tmp, 0.8);
    
    tmp = gl.getUniformLocation(program, "objs[2].type");
    gl.uniform1i(tmp, 2);

    tmp = gl.getUniformLocation(program, "objs[2].texture");
    gl.uniform1i(tmp, 0);
        
    tmp = gl.getUniformLocation(program, "objs[2].diffuse");
    gl.uniform1f(tmp, 0.5);
    
    tmp = gl.getUniformLocation(program, "objs[2].reflective");
    gl.uniform1f(tmp, 0.5);
    
    tmp = gl.getUniformLocation(program, "objs[2].shiness");
    gl.uniform1f(tmp, 10.0);
    
    tmp = gl.getUniformLocation(program, "objs[2].refrective");
    gl.uniform1f(tmp, -1.0);
    
    tmp = gl.getUniformLocation(program, "objs[2].ior");
    gl.uniform1f(tmp, 1.0);
    
    tmp = gl.getUniformLocation(program, "objs[2].blend");
    gl.uniform1f(tmp, 0.8);
    
    tmp = gl.getUniformLocation(program, "recursion");
    gl.uniform1i(tmp, 2);

    
    //load vertices
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    vertices = [
        -1.0, 1.0, 
        -1.0, -1.0,
        1.0, 1.0,
        1.0, -1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
 
}
 
function initTexture(imageName, textureID) {
    var myTexture = gl.createTexture();
    var image = new Image();
    image.onload = function () {
        image.onload = null;
    	gl.bindTexture(gl.TEXTURE_2D, myTexture);
	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);	 
    };
	image.src = imageName;
    texture.push(myTexture);

}


function bindTexture(textureID, location) {
  	gl.activeTexture(gl.TEXTURE0 + textureID);
    gl.bindTexture(gl.TEXTURE_2D, texture[textureID]);
    program.sampler = gl.getUniformLocation(program, location);  
    gl.uniform1i(program.sampler, textureID);
}

function loadParameters () {
    
    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
    gl.uniformMatrix4fv(program.pMatrixUniform, false, camera.getPMatrix());
    
    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, camera.getMVMatrix());

    var tmp = mat4.create();
    mat4.multiply(tmp, camera.getPMatrix(), camera.getMVMatrix());
    mat4.invert(tmp, tmp);
    program.iMatrixUniform = gl.getUniformLocation(program, "uIPMatrix");
    gl.uniformMatrix4fv(program.iMatrixUniform, false, tmp);
    
    tmp = mat4.clone(cubeMatrix);
    mat4.invert(tmp, tmp);
    program.cubeMatrix = gl.getUniformLocation(program, "objs[0].mIMatrix");
    gl.uniformMatrix4fv(program.cubeMatrix, false, tmp); 
    
    mat4.transpose(tmp, tmp);
    program.cubeTransMatrix = gl.getUniformLocation(program, "objs[0].mTransMatrix");
    gl.uniformMatrix4fv(program.cubeTransMatrix, false, tmp);     
   
    tmp = mat4.clone(sphereMatrix);
    mat4.invert(tmp, tmp);
    program.sphereMatrix = gl.getUniformLocation(program, "objs[1].mIMatrix");
    gl.uniformMatrix4fv(program.sphereMatrix, false, tmp);
    
    mat4.transpose(tmp, tmp);
    program.cubeTransMatrix = gl.getUniformLocation(program, "objs[1].mTransMatrix");
    gl.uniformMatrix4fv(program.cubeTransMatrix, false, tmp);  
    
    tmp = mat4.clone(planeMatrix);
    mat4.invert(tmp, tmp);
    program.planeMatrix = gl.getUniformLocation(program, "objs[2].mIMatrix");
    gl.uniformMatrix4fv(program.planeMatrix, false, tmp);
    
    mat4.transpose(tmp, tmp);
    program.planeTransMatrix = gl.getUniformLocation(program, "objs[2].mTransMatrix");
    gl.uniformMatrix4fv(program.planeTransMatrix, false, tmp); 
    
    program.eye = gl.getUniformLocation(program, "eye");
    gl.uniform4fv(program.eye, camera.getEye());
    
    program.near = gl.getUniformLocation(program, "near");
    gl.uniform1f(program.near, camera.getNear());
    
    program.viewPort = gl.getUniformLocation(program, "viewPort");
    gl.uniform2fv(program.viewPort, [viewportWidth, viewportHeight]); 
    
    program.objCount = gl.getUniformLocation(program, "objCount");
    gl.uniform1i(program.objCount, 2); 
    
        
    tmp = gl.getUniformLocation(program, "dCenter");
    gl.uniform4fv(tmp, dCenter);
    
    tmp = gl.getUniformLocation(program, "elapse");
    gl.uniform1f(tmp, time);  
    
    bindTexture(0, "image0");
    bindTexture(1, "image1");
    
    
        
}
function checkCollideWater() {
	if (sphereCenter[0] < cubeX
			&& sphereCenter[0] > -cubeX
			&& sphereCenter[2] < cubeZ
			&& sphereCenter[2] > -cubeZ
			&& (oldSphereCenter[1] > 0.06 + sphereR)
			&& (sphereCenter[1] < 0.06 + sphereR )){
			
			time = 100;
			dCenter = [sphereCenter[0], 0.06, sphereCenter[2], 1.0];
	}
	 
}

function drawScene () {
 
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);

    //upload projection matrix and texture
    checkCollideWater();  
    loadParameters();
   
        //draw         
    program.v = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(program.v);
     
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(program.v, 2, gl.FLOAT, false, 0, 0);  
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); 
       
}


function startDrag(px, py) {
 
    startX = (px * 2 - viewportWidth)/viewportWidth;
    startY = (viewportHeight - py * 2)/viewportHeight;
    mousedown = true;
    
    var eye = camera.getEye();
    var near = camera.getNear();
    var point = quat.fromValues(startX, startY, -1.0, 1.0);
    quat.scale(point, point, near);
    
    var iPMatrix = mat4.create();
    mat4.multiply(iPMatrix, camera.getPMatrix(), camera.getMVMatrix());
    mat4.invert(iPMatrix, iPMatrix);
    mat4.multiply(point, iPMatrix, point);
 
    var n = vec4.fromValues(point[0] - eye[0],
                            point[1] - eye[1],
                            point[2] - eye[2],
                                            0);
    
    vec4.normalize(n, n);
     
    var tmpObjMatrix = mat4.create();   
    mat4.invert(tmpObjMatrix, sphereMatrix);
    mat4.multiply(n, tmpObjMatrix, n);
    mat4.multiply(point, tmpObjMatrix, point);
  
    var a = n[0] * n[0] + n[1] * n[1] + n[2] * n[2];
    var b = 2 * (point[0] * n[0] + point[1] * n[1] + point[2] * n[2]);
    var c = point[0] * point[0] + point[1] * point[1] + point[2] * point[2] - 0.25;
    var tmp = (b * b) - (4 * a * c);
    if (tmp >= 0) {
        onTarget = true;
    }
}

function mouseDown(event) {
    startDrag(event.pageX, event.pageY);

}

function touchStart(event) {
    startDrag(event.touches[0].pageX, event.touches[0].pageY);

}

function duringDrag(px, py) {
    var curX = (px * 2 - viewportWidth)/viewportWidth;
    var curY = (viewportHeight - py * 2)/viewportHeight;

    if (mousedown && onTarget) {
        var eye = camera.getEye();
        var focus = camera.getFocus();
        var v1 = vec3.fromValues(eye[0] - focus[0], 
                                 eye[1] - focus[1], 
                                 eye[2] - focus[2]);

        var vtmp = vec4.fromValues(curY -startY, startX - curX, 0.0, 0.0);
        var iPMatrix = mat4.create();
        mat4.multiply(iPMatrix, camera.getPMatrix(), camera.getMVMatrix());
        mat4.invert(iPMatrix, iPMatrix);
        mat4.multiply(vtmp, iPMatrix, vtmp); 
        var v2 = vec3.fromValues(vtmp[0], vtmp[1], vtmp[2]);
         
        var moveVector = vec3.fromValues(v1[1] * v2[2] - v2[1] * v1[2], 
                                         v1[2] * v2[0] - v2[2] * v1[0],
                                         v1[0] * v2[1] - v2[0] * v1[1]); 
        
        vec3.normalize(moveVector, moveVector);
        
        var mag = (camera.getDistance()/8)* Math.sqrt( (curX - startX) * (curX - startX)
                  + (curY - startY) * (curY - startY));
       
        vec3.scale(moveVector, moveVector, mag);
        var translation = mat4.create();
        mat4.fromTranslation(translation, moveVector);
        mat4.multiply(sphereMatrix, translation, sphereMatrix);
        oldSphereCenter = vec4.clone(sphereCenter);
        mat4.multiply(sphereCenter, translation, sphereCenter);
        sphereVelocity = vec4.fromValues(0.0, 0.0, 0.0, 0.0); 
    
    } else if (mousedown) {
    
        camera.rotate(startX, startY, curX, curY);
       
    }
    
    startX = curX;
    startY = curY;         

}
function mouseMove(event) {
    duringDrag(event.pageX, event.pageY);
    
}

function touchMove(event) {
    duringDrag(event.touches[0].pageX, event.touches[0].pageY);
}
function stopDrag() {
    mousedown = false;
    onTarget = false;
 
}
function mouseUp(event) {
    stopDrag();
}
function mouseOut(event) {
    stopDrag();
}
function touchEnd(event) {
    stopDrag();
}

 


function distanceToPlane(type, coord, edge) {
	if (type == 0) {
		if (sphereCenter[0] < (edge + sphereR)
			&& sphereCenter[0] > (-edge - sphereR)
			&& sphereCenter[2] < (edge + sphereR)
			&& sphereCenter[2] > (-edge - sphereR)){
			
			return Math.abs(sphereCenter[1] - coord);
		} else { return -1.0;}
		
	} else if (type == 1) {
		if (sphereCenter[0] < (edge + sphereR)
			&& sphereCenter[0] > (-edge - sphereR)
			&& sphereCenter[1] < (cubeTopY1 + sphereR)
			&& sphereCenter[1] > (cubeBottomY)){
			
			return Math.abs(sphereCenter[2] - coord);
		} else { return -1.0;}
	
	} else if (type == 2) {
		if (sphereCenter[2] < (edge + sphereR)
			&& sphereCenter[2] > (-edge - sphereR)
			&& sphereCenter[1] < (cubeTopY1 + sphereR)
			&& sphereCenter[1] > (cubeBottomY)){
			
			return Math.abs(sphereCenter[0] - coord);
		} else { return -1.0;}
	} else if (type == 3) {
		if ((sphereCenter[0] < (edge + sphereR)
			&& sphereCenter[0] > (edge - sphereR))
			|| (sphereCenter[0] < (-edge + sphereR)
			&& sphereCenter[0] > (-edge - sphereR))
			|| (sphereCenter[2] < (edge + sphereR)
			&& sphereCenter[2] > (edge - sphereR))
			|| (sphereCenter[2] < (-edge + sphereR)
			&& sphereCenter[2] > (-edge - sphereR))){
			
			return Math.abs(sphereCenter[1] - coord);
		} else { return -1.0;}	
	} else {
	    return  -1.0;
	}

}

function collide() {

	var d1 = distanceToPlane(0, floorY, floorX);
	var d2 = distanceToPlane(1, 0.6, cubeX);
	var d3 = distanceToPlane(1, -0.6, cubeX);
	var d4 = distanceToPlane(2, 0.6, cubeZ);
	var d5 = distanceToPlane(2, -0.6, cubeZ);
	var d6 = distanceToPlane(3, cubeTopY1, cubeX);
	var tmp = vec4.fromValues(0.0, 0.0, 0.0, 0.0);
	var hitN = vec4.fromValues(0.0, 0.0, 0.0, 0.0);
	
	if (d1 > 0.0 && d1 < sphereR) {
		if (sphereCenter[1] > floorY) {
			tmp = vec4.fromValues(0.0, 1.0, 0.0, 0.0);
		} else {
			tmp = vec4.fromValues(0.0, 0.0, 0.0, 0.0);
		}
		vec4.add(hitN, hitN, tmp);
	
	}
	
	if (d2 > 0.0 && d2 < sphereR) {
		if (sphereCenter[2] > 0.6) {
			tmp = vec4.fromValues(0.0, 0.0, 1.0, 0.0);
		} else {
			tmp = vec4.fromValues(0.0, 0.0, -1.0, 0.0);
		}
		vec4.add(hitN, hitN, tmp);
	
	}

	if (d3 > 0.0 && d3 < sphereR) {
		if (sphereCenter[2] > -0.6) {
			tmp = vec4.fromValues(0.0, 0.0, 1.0, 0.0);
		} else {
			tmp = vec4.fromValues(0.0, 0.0, -1.0, 0.0);
		}
		vec4.add(hitN, hitN, tmp);
	
	}
     
	if (d4 > 0.0 && d4 < sphereR) {
		if (sphereCenter[0] > 0.6) {
			tmp = vec4.fromValues(1.0, 0.0, 0.0, 0.0);
		} else {
			tmp = vec4.fromValues(-1.0, 0.0, 0.0, 0.0);
		}
		vec4.add(hitN, hitN, tmp);
	
	}
	
	if (d5 > 0.0 && d5 < sphereR) {
		if (sphereCenter[0] > -0.6) {
			tmp = vec4.fromValues(1.0, 0.0, 0.0, 0.0);
		} else {
			tmp = vec4.fromValues(-1.0, 0.0, 0.0, 0.0);
		}
		vec4.add(hitN, hitN, tmp);
	
	}
	
	if (d6 > 0.0 && d6 < sphereR) {
		if (sphereCenter[1] > cubeTopY1) {
			tmp = vec4.fromValues(0.0, 1.0, 0.0, 0.0);
		} else {
			tmp = vec4.fromValues(0.0, 0.0, 0.0, 0.0);
		}
		vec4.add(hitN, hitN, tmp);
	
	}
	return vec4.normalize(hitN, hitN);

}

function roundVelocity() {

	if (Math.abs(sphereVelocity[0]) < 1e-8) {
		sphereVelocity[0] = 0.0;
	}
	if (Math.abs(sphereVelocity[1]) < 1e-8) {
		sphereVelocity[1] = 0.0;
	}
	if (Math.abs(sphereVelocity[2]) < 1e-8) {
		sphereVelocity[2] = 0.0;
	}

}
function updateVelocity() {
 
    var normal = collide(); 

    if (vec4.length(normal) > 0.01) {

		var component = -1.65 * vec4.dot(normal, sphereVelocity) 
		 
		var componentV = vec4.create();
		vec4.scale(componentV, normal, component);
		vec4.add(sphereVelocity, sphereVelocity, componentV);
	 
		var tmp = vec4.create();
		vec4.add(sphereVelocity,
		         vec4.scale(tmp, sumForce, mass),
		         sphereVelocity);
		
	} else {
    	var tmp = vec4.create();
		vec4.add(sphereVelocity,
		         vec4.scale(tmp, sumForce, mass),
		         sphereVelocity);
	}
	
	roundVelocity();
 
}
 
function updatePosition() {
    var move = vec3.fromValues(sphereVelocity[0],
                               sphereVelocity[1],
                               sphereVelocity[2]);
    var moveMatrix = mat4.create();
    mat4.fromTranslation(moveMatrix, move);
    mat4.multiply(sphereMatrix, moveMatrix, sphereMatrix);
    oldSphereCenter = vec4.clone(sphereCenter);
    vec4.add(sphereCenter, sphereCenter, sphereVelocity);
 
}

function updateForce() {

	if(sphereCenter[0] < cubeX && sphereCenter[0] > -cubeX
	         && sphereCenter[2] < cubeZ && sphereCenter[2] > - cubeZ ) {
	         
	    if (sphereCenter[1] > cubeTopY + sphereR) {
	    
	    	sumForce = vec4.clone(gravity);  
	    	
		} else if (sphereCenter[1] > cubeBottomY + sphereR + 5 * epsilon) {
			var tmp = vec4.create();
			vec4.scale(tmp, sphereVelocity, -0.05); 
			sumForce = vec4.add(sumForce, buoyance, gravity);
			vec4.add(sumForce, sumForce, tmp);
		} else {
			var tmp = vec4.create();
			vec4.scale(tmp, sphereVelocity, -0.05);  
			sumForce = vec4.fromValues(0.0, 0.0, 0.0, 0.0);
			vec4.add(sumForce, sumForce, tmp);
		}
		
	} else if (sphereCenter[0] < floorX && sphereCenter[0] > -floorX
	    && sphereCenter[2] < floorZ && sphereCenter[2] > -floorZ) {

  		if (sphereCenter[1] > (floorY + sphereR - 5 * epsilon) 
  		   && sphereCenter[1] < (floorY + sphereR + 5 * epsilon)) {
	 
	    	sumForce = vec4.fromValues(0.0, 0.0, 0.0, 0.0);  
	    	
		} else {
			sumForce = vec4.clone(gravity); 
		}	    
	    
	} else {
		sumForce = vec4.clone(gravity);
	}
 
}

function updateScene() {
    
    updateForce();
    updateVelocity();
    updatePosition();

}

function animateMyScene() {
 
	drawScene();
	if(!paused) {
	 	time = time + 30;
		updateScene();
	}
	requestAnimationFrame(animateMyScene);
}

function pause() {
	if (paused == false) {
		paused = true;
	} else {
		paused = false;
	}

}

function reset() {
	time = 100000;
	sphereCenter = vec4.clone(initSphereCenter);
        oldSphereCenter = vec4.clone(initSphereCenter);
	sphereMatrix = mat4.clone(initSphereMatrix);
	sphereVelocity = vec4.clone(initVelocity);
	sumForce = vec4.clone(initForce);
}

function main() {

    initWebgl();
    initProgram();
    initLight();
    initTexture("tiles.jpg", 0);  
    initTexture("jumbo.gif", 1);  
    
    initScene();

    animateMyScene();  
     
}
 
