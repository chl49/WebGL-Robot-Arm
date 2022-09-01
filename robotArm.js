"use strict";

var canvas;
var gl;

var numVertices  = 36;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[0, 0, 0];

var thetaLoc;

var flag = false;

var head = 0;
var arm1 = 0;
var arm2 = 0;
var points = [];
var normals = [];
var colors = [];

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    console.log(head);
    console.log(arm1);
    console.log(arm2);
    var myCylinder = cylinder(72, 1, true);
    //myCylinder.scale(0.5, 1.0, 0.5);
    myCylinder.scale(0.25, 0.25, 0.25);
    //myCylinder.rotate(0.0, [ 1, 1, 1]);
    //myCylinder.translate(0.0, -0.5625, 0.0);
    var myCube1 = cube(0.5);
    var myCube2 = cube2(0.5);


    myCube1.scale(0.25, 0.25, 0.25);
    //myCube1.rotate(0.0, [1, 1, 1]);
    myCube2.scale(0.25, 0.25, 0.25);
    myCube2.rotate(arm2, [0, 0, 1]);

    var s2 = Math.sin( radians(arm2) );
    var c2 = Math.cos( radians(arm2) );
    myCube2.translate(-s2*0.25, 0, 0.0);
    myCube2.translate(0, c2*0.25, 0.0);
    myCube2.translate(0, 0.25, 0.0);

    myCylinder.rotate(head, [ 0, 1, 0]);
    myCube1.rotate(arm1, [0, 0, 1]);
    myCube2.rotate(arm1, [0, 0, 1]);


    var s = Math.sin( radians(arm1) );
    var c = Math.cos( radians(arm1) );
    myCube1.translate(-s*0.25, 0, 0.0);
    myCube1.translate(0, c*0.25, 0.0);
    myCube2.translate(-s*0.25, 0, 0.0);
    myCube2.translate(0, c*0.25, 0.0);

    myCube1.rotate(head, [0, 1, 0]);
    myCube2.rotate(head, [0, 1, 0]);
    myCube1.translate(0.0, 0.0625, 0.0);
    myCube2.translate(0.0, 0.0625, 0.0);
    myCube1.rotate(head, [0, 1, 0]);
    myCube2.rotate(head, [0, 1, 0]);
    if(flag) {
    myCube1.rotate(90, [1, 0, 0]);
    myCube2.rotate(90, [1, 0, 0]);
    myCylinder.rotate(90, [ 1, 0, 0]);
    }
    colors = myCylinder.TriangleVertexColors;
    normals = myCylinder.TriangleNormals;
    points = myCylinder.TriangleVertices;
    colors = colors.concat(myCube1.TriangleVertexColors);
    normals = normals.concat(myCube1.TriangleNormals);
    points = points.concat(myCube1.TriangleVertices);
    colors = colors.concat(myCube2.TriangleVertexColors);
    normals = normals.concat(myCube2.TriangleNormals);
    points = points.concat(myCube2.TriangleVertices);

    var myMaterial = goldMaterial();
    var myLight = light0();

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    console.log(points.length);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");

    viewerPos = vec3(0.0, 0.0, -20.0 );

    projection = ortho(-1, 1, -1, 1, -100, 100);

    var ambientProduct = mult(myLight.lightAmbient, myMaterial.materialAmbient);
    var diffuseProduct = mult(myLight.lightDiffuse, myMaterial.materialDiffuse);
    var specularProduct = mult(myLight.lightSpecular, myMaterial.materialSpecular);
 
    document.getElementById("ButtonT").onclick = function(){flag = !flag; init();};


    document.getElementById("slider1").onchange = function(event) {
        head = event.target.value; init();
        
    };

    document.getElementById("slider2").onchange = function(event) {
        arm1 = event.target.value; init();
    };
    document.getElementById("slider3").onchange = function(event) {
        arm2 =  event.target.value; init();
    };
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(myLight.lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,
       "shininess"), myMaterial.materialShininess);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));

    render();
}

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //if(flag) theta[axis] += 2.0;
    
    modelView = mat4();
    modelView = mult(modelView, rotate(0, [1, 0, 0] ));
    modelView = mult(modelView, rotate(0, [0, 1, 0] ));
    modelView = mult(modelView, rotate(0, [0, 0, 1] ));
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );

    gl.drawArrays( gl.TRIANGLES, 0, points.length );


    requestAnimFrame(render);
}
