
function vShader () {

    var vs =
    'precision highp float;\
     attribute vec2 aVertexPosition;\
     uniform mat4 uPMatrix;\
     uniform mat4 uMVMatrix;\
     uniform mat4 uTMatrix;\
     uniform vec2 viewPort;\
     void main(void) {\
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);\
    }';
    
    return vs;
}

function fShader() {
    var fs =
    'precision highp float;\
     struct obj {\
                int type;\
                int texture;\
                float diffuse;\
                float reflective;\
                float shiness;\
                float refrective;\
                float ior;\
                float blend;\
                mat4 mTransMatrix;\
                mat4 mIMatrix;\
     };\
     struct Intersection {\
        int objID;\
        vec4 position;\
        vec4 normal;\
        vec2 tcoord;\
     };\
     uniform sampler2D image0;\
     uniform sampler2D image1;\
     uniform mat4 uIPMatrix;\
     uniform vec2 viewPort;\
     uniform int lightCount;\
     uniform vec4 lightPosition;\
     uniform int objCount;\
     uniform float near;\
     uniform vec4 eye;\
     uniform obj  objs[3];\
     uniform int recursion;\
     \
     vec4 castRay(vec4 point) {\
         return normalize(vec4(point.x - eye.x,\
                               point.y - eye.y,\
                               point.z - eye.z,\
                               0.0));\
     }\
     vec4 viewToWorld(vec4 point) {\
         vec4 ndc = vec4((point.x * 2.0)/viewPort.x - 1.0,\
                         (point.y * 2.0)/viewPort.y - 1.0,\
                         -1.0,\
                         1.0);\
         vec4 clip = ndc * near;\
         return uIPMatrix * clip;\
     }\
     float interPlane(vec4 origin, vec4 direction) {\
         float x, z;\
         float tmp = -origin.y/direction.y;\
         if (tmp >= 0.0) {\
            x = origin.x + tmp * direction.x;\
            z = origin.z + tmp * direction.z;\
            if (x <= 0.5 && x >= -0.5\
                && z >= -0.5 && z <= 0.5) {\
                return tmp;\
            }\
         }\
         return -1.0;\
     }\
     vec4 planeNormal(vec4 aPoint) {\
         if ( aPoint.y< 0.0001 && aPoint.y > -0.0001) {\
             return vec4(0.0, 1.0, 0.0, 0.0);\
         }\
         return vec4(0.0,0.0,0.0,0.0);\
     }\
     vec2 planeTcoord(vec4 aPoint) {\
        if (aPoint.y< 0.0001 && aPoint.y > -0.0001) {\
            return vec2(0.5 - aPoint.x, 0.5 + aPoint.z);\
        }\
         return vec2(0.0,0.0);\
     }\
     float interCube(vec4 origin, vec4 direction) {\
         float distance = 100000000.0;\
         \
         /*check left face*/\
         float x, y, z;\
         float tmp = (-0.5 - origin.x)/direction.x;\
         if (tmp >= 0.0) {\
            \
             y = origin.y + tmp * direction.y;\
             z = origin.z + tmp * direction.z;\
             if (y <= 0.5 && y >= -0.5\
                 && z >= -0.5 && z <= 0.5\
                 && (distance > tmp)) {\
                     distance = tmp;\
             }\
         }\
         /*check right face*/\
         tmp = (0.5 - origin.x)/direction.x;\
         if (tmp >= 0.0) {\
            \
             y = origin.y + tmp * direction.y;\
             z = origin.z + tmp * direction.z;\
             if (y <= 0.5 && y >= -0.5\
                 && z >= -0.5 && z <= 0.5\
                 && (distance > tmp)) {\
                    distance = tmp;\
             }\
         }\
         /*check fornt face*/\
         tmp = (0.5 - origin.z)/direction.z;\
         if (tmp >= 0.0) {\
             x = origin.x + tmp * direction.x;\
             y = origin.y + tmp * direction.y;\
             if (x <= 0.5 && x >= -0.5\
                 && y >= -0.5 && y <= 0.5\
                 && (distance > tmp)) {\
                 distance = tmp;\
             }\
          }\
         /*check back face*/\
         tmp = (-0.5 - origin.z)/direction.z;\
         if (tmp >= 0.0) {\
             x = origin.x + tmp * direction.x;\
             y = origin.y + tmp * direction.y;\
             if (x <= 0.5 && x >= -0.5\
                 && y >= -0.5 && y <= 0.5\
                 && (distance > tmp)) {\
                 distance = tmp;\
             }\
         }\
         /*check top*/\
         tmp = (0.2 - origin.y)/direction.y;\
         if (tmp >= 0.0) {\
            x = origin.x + tmp * direction.x;\
            z = origin.z + tmp * direction.z;\
            if (x <= 0.5 && x >= -0.5\
                && z >= -0.5 && z <= 0.5\
                && (distance > tmp)) {\
                distance = tmp;\
            }\
         }\
         /*check bottom*/\
         tmp = (-0.5 - origin.y)/direction.y;\
         if (tmp >= 0.0) {\
            x = origin.x + tmp * direction.x;\
            z = origin.z + tmp * direction.z;\
            if (x <= 0.5 && x >= -0.5\
                && z >= -0.5 && z <= 0.5\
                && (distance > tmp)) {\
                distance = tmp;\
            }\
         }\
         if (distance > (100000000.0 - 0.000005)) {\
             return -1.0;\
         } else {\
             return distance;\
         }\
     }\
     vec4 cubeNormal(vec4 aPoint) {\
         if (aPoint.x< 0.5001 && aPoint.x > 0.4999) {\
             return vec4(1.0, 0.0, 0.0, 0.0);\
         }\
         if (aPoint.x> -0.5001 && aPoint.x < -0.4999) {\
             return vec4(-1.0, 0.0, 0.0, 0.0);\
         }\
         if ( aPoint.y< 0.2001 && aPoint.y > 0.1999) {\
             return vec4(0.0, 1.0, 0.0, 0.0);\
         }\
         if ( aPoint.y > -0.5001 && aPoint.y < -0.4999) {\
             return vec4(0.0, -1.0, 0.0, 0.0);\
         }\
         if ( aPoint.z< 0.5001 && aPoint.z > 0.4999) {\
             return vec4(0.0, 0.0, 1.0, 0.0);\
         }\
         if ( aPoint.z > -0.5001 && aPoint.z < -0.4999) {\
             return vec4(0.0, 0.0, -1.0, 0.0);\
         }\
         return vec4(0.0,0.0,0.0,0.0);\
     }\
     vec2 cubeTcoord(vec4 aPoint) {\
        if (aPoint.x< 0.5001 && aPoint.x > 0.4999) {\
            return vec2(0.5 - aPoint.z, 0.5 + aPoint.y);\
        }\
        if (aPoint.x> -0.5001 && aPoint.x < -0.4999) {\
            return vec2(0.5 + aPoint.z, 0.5 + aPoint.y);\
        }\
        if (aPoint.y< 0.2001 && aPoint.y > 0.1999) {\
            return vec2(0.5 - aPoint.x, 0.5 + aPoint.z);\
        }\
        if ( aPoint.y > -0.5001 && aPoint.y < -0.4999) {\
            return vec2(0.5 + aPoint.x, 0.5 + aPoint.z);\
        }\
        if ( aPoint.z< 0.5001 && aPoint.z > 0.4999) {\
            return vec2(0.5 + aPoint.x, 0.5 + aPoint.y);\
        }\
        if ( aPoint.z > -0.5001 && aPoint.z < -0.4999) {\
            return vec2(0.5 - aPoint.x, 0.5 + aPoint.y);\
        }\
         return vec2(0.0,0.0);\
     }\
     float interSphere(vec4 origin, vec4 direction) {\
         float A = direction.x * direction.x\
                   + direction.y * direction.y\
                   + direction.z * direction.z;\
         float B = 2.0 * (direction.x * origin.x\
                   + direction.y * origin.y\
                   + direction.z * origin.z);\
         float C  = origin.x * origin.x\
                 + origin.y * origin.y\
                 + origin.z * origin.z\
                 - 0.25;\
         float tmp = B * B - 4.0 * A * C;\
         if (tmp < 0.0) {\
             return -1.0;\
         }\
         float r1 = (-B + sqrt(tmp))/(2.0 * A);\
         float r2 = (-B - sqrt(tmp))/(2.0 * A);\
         if (r1 < 0.0 && r2 < 0.0) {\
            return -1.0;\
         } else if (r1 < 0.0) {\
            return r2;\
         } else if (r2 < 0.0) {\
            return r1;\
         } else if (r1 > r2) {\
            return  r2;\
         } else {\
            return r1;\
         }\
     }\
     vec4 sphereNormal(vec4 aPoint) {\
        float tmp = aPoint.x * aPoint.x\
	              + aPoint.y * aPoint.y\
	              + aPoint.z * aPoint.z;\
	    if (tmp < 0.25000001 && tmp > 0.24999999 ) {\
	        vec4 n = vec4(aPoint.xyz, 0.0);\
	        normalize(n);\
	        return n;\
	    } else {\
	        return  vec4(0.0, 0.0, 0.0, 0.0);\
	    }\
     }\
     vec2 sphereTcoord(vec4 aPoint) {\
            float i, j;\
            float radius = sqrt(aPoint.z * aPoint.z\
                             + aPoint.x * aPoint.x);\
            i = acos(aPoint.x/radius)/(2.0 * 3.1415926);\
            if (aPoint.z >= 0.0 ) {\
                i = 1.0 - i;\
            }\
            j = asin(aPoint.y/0.5)/3.1415926 + 0.5;\
            return vec2(i, j);\
     }\
     float interDistance(int objType, mat4 transform, vec4 origin, vec4 direction) {\
         vec4 objOrigin = transform * origin;\
         vec4 objDirection = transform * direction;\
         if (objType == 0) {\
             return interCube(objOrigin, objDirection);\
         }\
         if (objType == 1) {\
             return interSphere(objOrigin, objDirection);\
         }\
         if (objType == 2) {\
             return interPlane(objOrigin, objDirection);\
         }\
         return -1.0;\
     }\
     vec4 calNormal(int objType, vec4 aPoint) {\
         if (objType == 0) {\
             return cubeNormal(aPoint);\
         }\
         if (objType == 1) {\
             return sphereNormal(aPoint);\
         }\
         if (objType == 2) {\
             return planeNormal(aPoint);\
         }\
         return vec4(0.0, 0.0, 0.0, 0.0);\
     }\
     vec2 calTcoord(int objType, vec4 aPoint) {\
         if (objType == 0) {\
             return cubeTcoord(aPoint);\
         }\
         if (objType == 1) {\
             return sphereTcoord(aPoint);\
         }\
         if (objType == 2) {\
             return planeTcoord(aPoint);\
         }\
         return vec2(0.0,0.0);\
     }\
     Intersection interSect(vec4 origin, vec4 direction) {\
         float distance = 100000000.0;\
         int target = -1;\
         float tmp = -1.0;\
         tmp = interDistance(objs[0].type, objs[0].mIMatrix, origin, direction);\
         if (tmp > 0.0 && tmp < distance) {\
             target = 0;\
             distance = tmp;\
         }\
         tmp = interDistance(objs[1].type, objs[1].mIMatrix, origin, direction);\
         if (tmp > 0.0 && tmp < distance) {\
             target = 1;\
             distance = tmp;\
         }\
         tmp = interDistance(objs[2].type, objs[2].mIMatrix, origin, direction);\
         if (tmp > 0.0 && tmp < distance) {\
             target = 2;\
             distance = tmp;\
         }\
         if (target >= 0 ) {\
             vec4 position = vec4(origin.x + distance * direction.x,\
                                  origin.y + distance * direction.y,\
                                  origin.z + distance * direction.z,\
                                                               1.0);\
             vec4 objPosition, tmpn;\
             vec2 tmptcoord;\
             if (target == 0) {\
                 objPosition = objs[0].mIMatrix * position;\
                 tmpn = calNormal(objs[0].type, objPosition);\
                 tmptcoord = calTcoord(objs[0].type, objPosition);\
                 return Intersection(target, position, tmpn, tmptcoord);\
             }\
             if(target == 1) {\
                 objPosition = objs[1].mIMatrix * position;\
                 tmpn = calNormal(objs[1].type, objPosition);\
                 tmptcoord = calTcoord(objs[1].type, objPosition);\
                 return Intersection(target, position, tmpn, tmptcoord);\
             }\
             if(target == 2) {\
                 objPosition = objs[2].mIMatrix * position;\
                 tmpn = calNormal(objs[2].type, objPosition);\
                 tmptcoord = calTcoord(objs[2].type, objPosition);\
                 return Intersection(target, position, tmpn, tmptcoord);\
             }\
         } else {\
             return Intersection(-1,\
                                 vec4(0.0, 0.0, 0.0, 1.0),\
                                 vec4(0.0, 0.0, 0.0, 1.0),\
                                 vec2(0.0, 0.0));\
         }\
     }\
     vec4 getObjColor(Intersection i) {\
        if (i.objID < 0) {return vec4(0.0, 0.0, 0.0, 0.0);}\
        if (i.objID == 0) {\
            vec4 objPosition = objs[0].mIMatrix * i.position;\
            if (objPosition.y > 0.2001) {\
                return vec4(1.0, 1.0, 1.0, 0.1);\
            }\
            return vec4(0.4, 0.9, 1.0, 0.5);\
        };\
        if (i.objID == 1) {\
            if (objs[1].texture == 0) {\
                return texture2D(image0, i.tcoord);\
            }\
            if (objs[1].texture == 1) {\
                return texture2D(image1, i.tcoord);\
            }\
        };\
        if (i.objID == 2) {\
            if (objs[2].texture == 0) {\
                return texture2D(image0, i.tcoord);\
            }\
            if (objs[2].texture == 1) {\
                return texture2D(image1, i.tcoord);\
            }\
        };\
        return vec4(0.0, 0.0, 0.0, 1.0);\
     }\
     vec4 colorHelper(Intersection intersection) {\
         if (intersection.objID >= 0) {\
             vec4 tc = getObjColor(intersection);\
             vec4 light = normalize(lightPosition - intersection.position);\
             return tc;\
         } else {\
             return vec4(0.0, 0.0, 0.0, 1.0);\
         }\
     }\
     vec4 color(vec4 aPoint) {\
         vec4 color = vec4(0.0, 0.0, 0.0, 0.0);\
         vec4 thePoint = viewToWorld(aPoint);\
         vec4 direction = castRay(thePoint);\
         for(int i = 0; i < 5; i++) {\
            if (i >= 1) break;\
            Intersection intersection = interSect(thePoint, direction);\
            color = colorHelper(intersection);\
            thePoint = intersection.position;\
         }\
         return color;\
     }\
     void main(void) {\
         gl_FragColor = color(gl_FragCoord);\
     }';
     
    return fs;
}
