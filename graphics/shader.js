
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
     struct Ambient {\
         float a;\
         float d;\
         float s;\
     };\
     struct Intersection {\
        int objID;\
        int level;\
        float coeff;\
        vec4 direction;\
        vec4 position;\
        vec4 normal;\
        vec2 tcoord;\
     };\
     uniform sampler2D image0;\
     uniform sampler2D image1;\
     uniform mat4 uIPMatrix;\
     uniform vec2 viewPort;\
     uniform int mylightCount;\
     uniform vec4 mylightPosition;\
     uniform vec4 mylightColor;\
     uniform int objCount;\
     uniform float near;\
     uniform vec4 eye;\
     uniform obj  objs[3];\
     uniform int recursion;\
     Ambient ambient = Ambient(0.5, 0.5, 0.5);\
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
	    if (tmp < 0.250001 && tmp > 0.249999 ) {\
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
     Intersection interSect(vec4 origin, vec4 direction, float coeff) {\
         float distance = 100000000.0;\
         int target = -1;\
         float tmp = -1.0;\
         for (int i = 0; i < 3; i++) {\
             tmp = interDistance(objs[i].type, objs[i].mIMatrix, origin, direction);\
             if (tmp > 0.0 && tmp < distance) {\
                 target = i;\
                 distance = tmp;\
             }\
         }\
         if (target >= 0 ) {\
             vec4 position = vec4(origin.x + distance * direction.x,\
                                  origin.y + distance * direction.y,\
                                  origin.z + distance * direction.z,\
                                                               1.0);\
             vec4 objPosition, tmpn;\
             vec2 tmptcoord;\
             for (int k = 0; k < 3; k++) {\
                 if (target == k) {\
                     objPosition = objs[k].mIMatrix * position;\
                     tmpn = normalize(objs[k].mTransMatrix * calNormal(objs[k].type, objPosition));\
                     tmptcoord = calTcoord(objs[k].type, objPosition);\
                     return Intersection(k, 6, coeff,\
                                         direction, position, tmpn, tmptcoord);\
                 }\
             }\
         } else {\
             return Intersection(-1, 6, coeff,\
                                 vec4(0.0, 0.0, 0.0, 0.0),\
                                 vec4(0.0, 0.0, 0.0, 1.0),\
                                 vec4(0.0, 0.0, 0.0, 0.0),\
                                 vec2(0.0, 0.0));\
         }\
     }\
     vec4 getObjColor(Intersection i) {\
        if(i.objID < 0) return vec4(0.0, 0.0, 0.0, 1.0);\
        vec4 texture;\
        float blend, shiness, od, os;\
        if (i.objID == 0) {\
            vec4 objPosition = objs[0].mIMatrix * i.position;\
            if (objPosition.y > 0.2001) {\
                texture =  vec4(0.5, 0.4, 0.3, 0.0);\
            } else {\
                texture = vec4(0.4, 0.9, 1.0, 1.0);\
            }\
            blend = objs[0].blend;\
            shiness = objs[0].shiness;\
            od = objs[0].diffuse;\
            os = objs[0].reflective;\
        };\
        if (i.objID == 1) {\
            if (objs[1].texture == 0) {\
                texture = texture2D(image0, i.tcoord);\
            }\
            if (objs[1].texture == 1) {\
                texture = texture2D(image1, i.tcoord);\
            }\
            blend = objs[1].blend;\
            shiness = objs[1].shiness;\
            od = objs[1].diffuse;\
            os = objs[1].reflective;\
        };\
        if (i.objID == 2) {\
            if (objs[2].texture == 0) {\
                texture = texture2D(image0, i.tcoord);\
            }\
            if (objs[2].texture == 1) {\
                texture = texture2D(image1, i.tcoord);\
            }\
            blend = objs[2].blend;\
            shiness = objs[1].shiness;\
            od = objs[1].diffuse;\
            os = objs[1].reflective;\
        };\
        \
        vec4 lightV = (mylightPosition - i.position);\
        lightV = normalize(lightV);\
        vec4 reflectV, viewV;\
        float dotD, dotS, specular;\
        vec4 tmpPosition = i.position + 0.0001 * lightV;\
        Intersection tmpi = interSect(tmpPosition, lightV, 0.0);\
        if (tmpi.objID < 0) {\
            reflectV = reflect(lightV, i.normal);\
            reflectV = normalize(reflectV);\
            viewV = eye - i.position;\
            viewV = normalize(viewV);\
            dotD = max(0.0, dot(lightV, i.normal));\
            dotS = max(0.0, dot(viewV, reflectV));\
            if (dotS <= 0.0) {\
                specular = 0.0;\
            } else {\
                specular = pow(dotS, shiness);\
            }\
        } else {\
            dotD = 0.0;\
            specular = 0.0;\
        }\
        vec4 color = blend * texture\
                     + (1.0 - blend)\
                     * (dotD * mylightColor * od * ambient.d\
                     + specular * mylightColor * os * ambient.s);\
        return color;\
     }\
     vec4 colorHelper(Intersection intersections[16]) {\
             vec4 color = vec4(0.0, 0.0, 0.0, 0.0);\
             for (int i = 0; i < 16; i++) {\
                 if (intersections[i].level > recursion) break;\
                 if (intersections[i].objID < 0) continue;\
                 color = color + intersections[i].coeff * getObjColor(intersections[i]);\
             }\
             return vec4(color.rgb, 1.0);\
     }\
     bool testInside(int objID, vec4 aPoint) {\
         if (objID == 0) {\
             vec4 thePoint = objs[0].mIMatrix * aPoint;\
             if (thePoint.x < 0.5 && thePoint.x > -0.5\
                 && thePoint.y < 0.5 && thePoint.y > -0.5\
                 && thePoint.z < 0.5 && thePoint.z > -0.5)\
                 { return true;}\
         }\
         return false;\
     }\
     vec4 color(vec4 aPoint) {\
         Intersection intersections[16];\
         for(int i = 0; i < 16; i++) {\
             intersections[i].objID = -1;\
             intersections[i].level = 6;\
         }\
         vec4 thePoint = viewToWorld(aPoint);\
         vec4 direction = castRay(thePoint);\
         Intersection intersection = interSect(thePoint, direction, 1.0);\
         if (intersection.objID >=0) {\
             intersection.level = 0;\
             intersections[0] = intersection;\
         } else{\
             return vec4(0.0, 0.0, 0.0, 1.0);\
         }\
         int top = 1;\
         for(int i = 0; i < 16; i++) {\
            if (intersections[i].level >= recursion) break;\
            direction = reflect(intersections[i].direction, intersections[i].normal);\
            thePoint = intersections[i].position + 0.0001 * direction;\
            float tmpBlend, tmpRef, tmpRefr = -1.0 , ior;\
            mat4 tmpIM;\
            for (int g = 0; g < 3; g++) {\
                if (g == intersections[i].objID) {\
                    tmpBlend = objs[g].blend;\
                    tmpRef = objs[g].reflective;\
                    tmpRefr = objs[g].refrective;\
                    ior = objs[g].ior;\
                    tmpIM = objs[g].mIMatrix;\
                }\
            }\
            intersection = interSect(thePoint, direction,\
                           intersections[i].coeff * tmpRef * tmpBlend);\
            intersection.level = intersections[i].level + 1;\
            Intersection intersection1;\
            vec4 refreV;\
            bool transparent = false;\
            if (tmpRefr > 0.0) {\
                vec4 testPosition = intersections[i].position\
                                    + 0.0001 * intersections[i].direction;\
                bool inside = testInside(intersections[i].objID, testPosition);\
                vec4 tmpNormal = intersections[i].normal;\
                if (!inside) {\
                    tmpRefr = 1.0/tmpRefr;\
                    tmpNormal = - tmpNormal;\
                }\
                refreV = normalize(refract(intersections[i].direction,\
                                           tmpNormal, tmpRefr));\
                thePoint = intersections[i].position + 0.0001 * refreV;\
                intersection1 = interSect(thePoint, refreV,\
                           intersections[i].coeff * tmpRefr * tmpBlend);\
                intersection1.level = intersections[i].level + 1;\
                transparent = true;\
            }\
            for (int j = 0; j < 16; j++) {\
                if ( j == top) {\
                    intersections[j] = intersection;\
                    if(transparent) {\
                        intersections[j + 1] = intersection1;\
                    }\
                } else if (j > top) {\
                    break;\
                }\
            }\
            if (transparent) {\
                top = top + 1;\
            }\
            top = top + 1;\
         }\
         return colorHelper(intersections);\
     }\
     void main(void) {\
         gl_FragColor = color(gl_FragCoord);\
     }';
     
    return fs;
}
