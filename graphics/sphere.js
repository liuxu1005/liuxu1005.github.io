

function Sphere(segmentX, segmentY) {

    this.segmentX = segmentX;
    this.segmentY = segmentY;
    this.vNum;
    
    this.vertices = [];
    this.normals = [];
    this.texture = [];
    this.pushStack = function (stack, x, y, z) {
        stack.push(x);
        stack.push(y);
        stack.push(z);
    
    }
  
    this.initial = function (segmentX, segmentY) {
        var PI = 3.1415926;
        var R = 0.5;
        var u;
        var v;
        var xunit = (2.0 * PI)/segmentX;
        var yunit = PI/segmentY;
 
        var alpha = 0.0;
        var beta = PI/(-2.0);
        var index = 0;
        
        this.vNum = segmentY * segmentX * 6;
 
        
        for (h = 0; h < segmentY; h++) {
            var y = R * Math.sin(beta);
            var y_above = R * Math.sin(beta + yunit);
            for(w = 0; w < segmentX; w++) {
               
              
                var x = R * Math.cos(beta) * Math.cos(alpha);
                var x_above = R * Math.cos(beta + yunit) * Math.cos(alpha);
                var x_right = R * Math.cos(beta) * Math.cos(alpha + xunit);
                var x_diagonal = R * Math.cos(beta + yunit) * Math.cos(alpha + xunit);
                var z = R * Math.cos(beta) * Math.sin(alpha);
                var z_above = R * Math.cos(beta + yunit) * Math.sin(alpha);
                var z_right = R * Math.cos(beta) * Math.sin(alpha + xunit);
                var z_diagonal = R * Math.cos(beta + yunit) * Math.sin(alpha + xunit);
                
                //current
                u = 1.0 - w/segmentX;
                v = 1.0 - h/segmentY;
                this.pushStack(this.vertices, x, y, z);
                this.pushStack(this.normals, 2 * x, 2 * y, 2 * z);
  
	            //above point
                u = 1.0 - w/segmentX;
                v = 1.0 - (h + 1)/segmentY;
                this.pushStack(this.vertices, x_above, y_above, z_above);
                this.pushStack(this.normals, 2 * x_above, 2 * y_above, 2 * z_above);
                
	            //diagonal point
	            u = 1.0 - (w + 1)/segmentX;
                v = 1.0 - (h + 1)/segmentY;
                this.pushStack(this.vertices, x_diagonal, y_above, z_diagonal);
                this.pushStack(this.normals, 2 * x_diagonal, 2 * y_above, 2 * z_diagonal);
                
                //current
                u = 1.0 - w/segmentX;
                v = 1.0 - h/segmentY;
                this.pushStack(this.vertices, x, y, z);
                this.pushStack(this.normals, 2 * x, 2 * y, 2 * z);
                
                //diagonal point
	            u = 1.0 - (w + 1)/segmentX;
                v = 1.0 - (h + 1)/segmentY;
                this.pushStack(this.vertices, x_diagonal, y_above, z_diagonal);
                this.pushStack(this.normals, 2 * x_diagonal, 2 * y_above, 2 * z_diagonal); 
                  
	            //right point
                u = 1.0 - (w + 1)/segmentX;
                v = 1.0 - h/segmentY;
                this.pushStack(this.vertices, x_right, y, z_right);
                this.pushStack(this.normals, 2 * x_right, 2 * y, 2 * z_right);                
                   
 
                alpha += xunit;
            }
 
            beta += yunit;
        
        } 
    }
    this.initial(this.segmentX, this.segmentY);

}
