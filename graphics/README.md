Sphere in Water Project

In this project, I planned to use WebGL to demonstrate following features: 

    Reflections and refractions 
    Collision and response
    Water wave simulation
    Caustics

First, I need a camera enabling me to rotate the scene. Based on what Professor Recom taught us in comp 175, this is not difficult. The camera is implemented in camera.js.

And I have to be able to move the sphere around which is similar to ray tracing. It takes steps to do that:

    Cast a ray to detect if we are clicking on the sphere;
    Calculating moving direction in the world coordinate according to the mouse moving direction.
    Calculating moving distance in the world coordinate  according to the mouse moving distance.
    Update translation matrix of the sphere, which will be used next time we call drawScene(）
    Another way is just update the translation matrix according to the position of mouse as 
    we do in comp 175 lab. This way is better than above way.

Second, I have to implement recursive ray tracing with reflections and refractions in shader. This is where the most of job comes from. 

    I just draw a quad on screen in vertex shader, so that I can visit each pixel in view port.
    (I tried another way, in which I drawn several objects and let WebGL blend the several layer 
    by gl_blendFunc. The advantage of this way is it enable us focus on one layer each time 
    without worry about blending. Finally I discard this way and use the way we are taught in Comp 175.)

    All calculations are finished in fragment shader. 

The ray tracing method is the same as the one taught by Professor Remco. 
For each pixel gl_FragCoord, I have to cast a ray to see if some object is intersected.
If an object is intersected,  cast reflected ray and refracted ray if it is transparent. 

We can also cast four rays per pixel to do sampling, which will increase GPU workload. 
I only cast one in this project , therefore there is jags in the scene.
           
 The most different point is that we can not write recursive function in shader, 
 so I have to convert the recursive function to iteration and allocate enough memory 
 in advance to remember information from each iteration. 
 The maximum recursion is set to 5 for this project.

Another annoying feature of WebGL is we can not use variable index when query an array element, 
which make all visits to array element O(n). That is the most important reason why the shader is slow.

Third, animation. In this project, there are three forces:

    gravity, buoyancy and collision and only one movable object, the sphere, which simplify the calculation.
    
After every call to drawScene() I have to update the force according to the sphere position 
and if there are collisions happening. Then update the sphere velocity according to the force 
imposed on the sphere. Then update the sphere position according to the velocity. 

Collision detection and response in this project actually are just solving lots of equations to see 
if two or more objects overlap with each other. Once collision detected, I have to calculate the 
force and reset the velocity.

All calculations related to this step are finished in CPU.

Fourth, for waterwave I am trying a simplified way although it is not perfect. 
Once collision with water is detected, pass the collision position and collision time to 
fragment shader as center. For each pixel, calculating the varying normal direction of 
the water surface according to sinusoidal function, the distance to the center, and the time elapse 
from the beginning time.

Fifth, for caustics I am also using a simplified way while I saw some better way such as 
https://medium.com/@evanwallace/rendering-realtime-caustics-in-webgl-2a99a29a0b2c#.ouap09a09. 

For each pixel, I just add additional item to specular, reflection and refraction.  
I call this extra item myCaustics.  I just cast a ray from the pixel to the light 
to see if it intersect the water surface. If not, this item is 0; if yes,
I will calculate a value according to the position change along y axis caused by the water wave.  

For example, at some time point and certain position of water surface,
we can calculate the y-axis increase or decrease by sinusoidal function.
Y-axis increase will make the water surface convex so we got more light here, 
the caustics value will be positive. Y-axis decrease makes the water surface concave 
so we got less light here, the caustics value will be negative.

I use the gl-matrix-min.js to help me do matrix calculations.
 
 

