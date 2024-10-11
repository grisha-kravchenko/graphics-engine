
// Main code file for 3d engine project

// tick logic initialiser
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function tickInit(delay) {
    tick();
    sleep(delay).then(() => tickInit(delay));
}

function screenInit(width) {
    screen = new Array
    for (let pixelX = 0; pixelX < width - 1; pixelX++) {
            for (let pixelY = 0; pixelY < width - 1; pixelY++) {
            screen[screen.length] = {
                color:"rgb(0 0 0)",
                sizeX: canvas.width/width,
                sizeY: canvas.height/width,
                X: pixelX*canvas.width/width-canvas.width/2,
                Y: pixelY*canvas.height/width-canvas.height/2,
            };
        }
    }
}

function screenDraw() {
    screen.forEach(element => {
        paint.fillStyle = element.color;
        paint.fillRect(element.X + canvas.width/2, element.Y + canvas.height/2, element.sizeX, element.sizeY);
    });
}

function load() {
    // code there executes on webpage load

    // initialise painter
    canvas = new Object();
    canvas.canvas = document.getElementById("mainCanvas");
    canvas.width = (canvas.canvas.width = window.innerWidth);
    canvas.height = (canvas.canvas.height = window.innerHeight);
    paint = canvas.canvas.getContext("2d");
    FOV = 300;
    light = 50;
    
    // fill the screen
    screenInit(100);
    
}

function tick() {
    // code there execute on webpage tick

    // render triangle to pixels
    position = {X: 50, Y: 50, Z:-100}
    rotation = {A: 0, B:0}
    shapes = new Array;

    initTriangle([{X:0, Y:0, Z:100}, {X:0, Y:100, Z:100}, {X:100, Y:0, Z:100}], 
        [1, 1, 1], position, normaliseRotation(rotation));
    shapes.sort((a, b) => {return a[3] - b[3]});
    initScreenColors();
    screenDraw();

}

function initTriangle(points, color, position, direction) {
    // Points - array with all used points in the Triangle
    shapes[shapes.length] = new Array
    let trianglePoints = new Array
    points.forEach(element => {
        
        // rotate points
        let rotatedX = (element.Z - position.Z) * Math.sin(direction.A) + (element.X - position.X) * Math.cos(direction.A);
        let rotatedZ = (element.Z - position.Z) * Math.cos(direction.A) - (element.X - position.X) * Math.sin(direction.A);
        let rotatedY = (element.Z - position.Z) * Math.sin(direction.B) + (element.Y - position.Y) * Math.cos(direction.B);
        rotatedZ = (element.Z - position.Z) * Math.cos(direction.B) - (element.Y - position.Y) * Math.sin(direction.B);
        
        // write points
        shapes[shapes.length - 1].push({X: rotatedX/rotatedZ * FOV, Y: rotatedY/rotatedZ * FOV, distance: rotatedZ});
        trianglePoints.push({X: rotatedX, Y: rotatedY, Z: rotatedZ})
        
    });
    // distance to triangle based on 3 points
    shapes[shapes.length - 1].push((shapes[shapes.length - 1][0].distance + shapes[shapes.length - 1][1].distance + shapes[shapes.length - 1][2].distance) / 3)
    shapes[shapes.length - 1].push(color)
    shapes[shapes.length - 1].push(trianglePoints)
}



// calculation of distance to point of ray and plane intersection
function raycast(points, ray) {  
    let Pn = crossProduct(vecSub(points[2], points[0]), vecSub(points[1], points[0]));
    let t = (dotProduct(Pn, ray[0]) + dotProduct(points[0], Pn)) / Math.abs(dotProduct(Pn, ray[1]));
    if (t < 0) {return false}
    return t;
}

// calculate pixel color
function pixel(element, pixelCounter) {
    // start with pure black screen
    screen[pixelCounter].color = "rgb(0 0 0)";

    // check if it intersect with any triangle
    shapes.forEach(points => {
        
        // define does point intersect with triangle or not
        let d1 = sign(element, points[0], points[1]);
        let d2 = sign(element, points[1], points[2]);
        let d3 = sign(element, points[2], points[0]);
        let has_neg = (d1 <= 0) || (d2 <= 0) || (d3 <= 0);
        let has_pos = (d1 >= 0) || (d2 >= 0) || (d3 >= 0);
        
        if (has_neg && has_pos) {return false}
        // raycast from diven pixel to given triangle
        let distance = raycast(points[5], [{X: element.X/FOV, Y: element.Y/FOV, Z: 1}, {X: element.X/FOV, Y:element.X/FOV, Z:2}]);
        
        // return false if point is behind player
        if (!distance) {return false}
        
        // calculate colors based on distance to triangle
        screen[pixelCounter].color = "rgb(" + 
            points[4][0]*Math.min(1/distance*light, 1)*255 + " " + 
            points[4][1]*Math.min(1/distance*light, 1)*255 + " " + 
            points[4][2]*Math.min(1/distance*light, 1)*255 + ")";
    });
}

function initScreenColors() {
    let pixelCounter = 0;
    
    // get color for every pixel
    screen.forEach(element => {
        pixel(element, pixelCounter)
        pixelCounter++;
    });
}
