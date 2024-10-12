
// Main code file for 3d engine project

// sleep function on Promise
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// tick logic
function tickInit(delay) {
    tick();
    sleep(delay).then(() => tickInit(delay));
}

// screen initialiser
function screenInit(width) {
    screen = new Array
    for (let pixelX = 0; pixelX < width; pixelX++) {
        for (let pixelY = 0; pixelY < width; pixelY++) {
            screen[screen.length] = {
                color:"rgb(0 0 0)",
                sizeX: canvas.width/width,
                sizeY: canvas.height/width,
                X: pixelX - width/2,
                Y: pixelY - width/2,
                screenX: pixelX*canvas.width/width-canvas.width/2,
                screenY:pixelY*canvas.height/width-canvas.height/2,
                screenWidth: width,
            };
        }
    }
}

// fill screen function
function screenDraw() {
    screen.forEach(pixel => {
        paint.fillStyle = pixel.color;
        paint.fillRect(pixel.screenX + canvas.width/2, pixel.screenY + canvas.height/2, pixel.sizeX, pixel.sizeY);
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
    FOV = 100;
    light = 100;
    maxViewDistance = 1000;
    position = {X: 50, Y: 50, Z: -100}
    rotation = {A: 0, B: 0}
    speed = 5
    rotationIntensivity = 2
    pressedKeys = {w: 0, a: 0, s: 0, d: 0, ArrowRight: 0, ArrowLeft: 0, ArrowUp: 0, ArrowDown: 0}

    document.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) { return }
        if (!event.key) { return }
        pressedKeys[event.key] = 1
    });

    document.addEventListener("keyup", function (event) {
        if (event.defaultPrevented) { return }
        if (!event.key) { return }
        pressedKeys[event.key] = 0
    });
    
    // fill the screen
    screenInit(100);
    
}

function tick() {
    // code there execute on webpage tick

    movement(normaliseRotation(rotation))

    // render triangle to pixels
    shapes = new Array;

    initTriangle([{X:0, Y:0, Z:100}, {X:0, Y:100, Z:100}, {X:100, Y:0, Z:100}], 
        [1, 1, 1], position, normaliseRotation(rotation));
    shapes.sort((a, b) => {return a[3] - b[3]});
    initScreenColors();
    screenDraw();

}

function movement(normal_rotation) {
    position.Z += speed * (pressedKeys.w - pressedKeys.s) * Math.cos(normal_rotation.A) + speed * (pressedKeys.a - pressedKeys.d) * Math.sin(normal_rotation.A)
    position.X += speed * (pressedKeys.d - pressedKeys.a) * Math.cos(normal_rotation.A) + speed * (pressedKeys.w - pressedKeys.s) * Math.sin(normal_rotation.A)
    rotation.A += rotationIntensivity * (pressedKeys.ArrowRight - pressedKeys.ArrowLeft)
    rotation.B += rotationIntensivity * (pressedKeys.ArrowUp - pressedKeys.ArrowDown)
}

function initTriangle(points, color, position, direction) {
    // Points - array with all used points in the Triangle
    shapes[shapes.length] = new Array
    let trianglePoints = new Array
    points.forEach(element => {
        
        // rotate points
        let rotatedX = (element.Z - position.Z) * Math.sin(-direction.A) + (element.X - position.X) * Math.cos(direction.A);
        let rotatedZ = (element.Z - position.Z) * Math.cos(direction.A) - (element.X - position.X) * Math.sin(-direction.A);
        let rotatedY = rotatedZ * Math.sin(direction.B) + (element.Y - position.Y) * Math.cos(direction.B);
        rotatedZ = rotatedZ * Math.cos(direction.B) - rotatedZ * Math.sin(direction.B);
        
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
    let Pn = normaliseVector(crossProduct(vecSub(points[1], points[0]), vecSub(points[2], points[0])));
    let t = - dotProduct(Pn, vecSub(ray[0], points[0])) / dotProduct(Pn, ray[1])
    if (t < 0) {return false}
    return t;
}

// calculate pixel color
function initialisePixelColor(element, pixelCounter) {
    let pixelDistance = maxViewDistance

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

        // raycast from given pixel to given triangle
        let distance = raycast(points[5], [
            {X: element.X / FOV, Y: element.Y / FOV, Z: 1}, 
            {X: element.X * 2 / FOV, Y: element.Y * 2 / FOV, Z: 2}
        ]);
        
        // return false if point is behind player
        if (!distance) {return false}
        if (distance > pixelDistance) {return false}

        // calculate colors based on point of intersection with triangle
        let color = applyTexture(points[5], distance, points[4], element);
        
        // apply color to pixel
        screen[pixelCounter].color = "rgb(" + color[0]+ " " + color[1] + " " + color[2]+ ")";
    });
}

function applyTexture(points, distance, texture, pixel) {

    // calculate point of intersection of ray and 
    let intersection = {
        X: Math.round(pixel.X * distance / FOV * 2),
        Y: Math.round(pixel.Y * distance / FOV * 2),
        Z: distance * 2,
    }

    // calcutlate texture coordinates
    let textureX = Math.round(perpendicularLength(points[0], points[1], intersection))
    let textureY = Math.round(perpendicularLength(trianglePerpendicular(points[0], points[2], points[1]), points[0], intersection))

    return [
        texture[0] * Math.min(1 / distance * light, 1) * 255,
        texture[1] * Math.min(1 / distance * light, 1) * 255,
        texture[2] * Math.min(1 / distance * light, 1) * 255
    ]
}

function initScreenColors() {
    let pixelCounter = 0;
    
    // get color for every pixel
    screen.forEach(element => {
        initialisePixelColor(element, pixelCounter)
        pixelCounter++;
    });
}
