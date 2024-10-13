
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
    rotation = {A: 0, B: -20}

    // fill the screen
    screenInit(100);
    
}

function tick() {
    // code there execute on webpage tick

    // render triangle to pixels
    shapes = new Array;

    initTriangle([{X:0, Y:0, Z:0}, {X:0, Y:0, Z:100}, {X:100, Y:0, Z:0}], 
        ["bricks", true], position, normaliseRotation(rotation));
    initTriangle([{X:100, Y:0, Z:100}, {X:0, Y:0, Z:100}, {X:100, Y:0, Z:0}], 
        ["bricks", false], position, normaliseRotation(rotation));
    shapes.sort((a, b) => {return a[3] - b[3]});
    initScreenColors();
    screenDraw();

}



function initTriangle(points, texture, position, direction) {
    // Points - array with all used points in the Triangle
    shapes[shapes.length] = new Array
    let trianglePoints = new Array
    points.forEach(element => {
        
        // rotate points
        let rotatedX = (element.Z - position.Z) * Math.sin(-direction.A) + (element.X - position.X) * Math.cos(direction.A);
        let rotatedZ = (element.Z - position.Z) * Math.cos(direction.A) - (element.X - position.X) * Math.sin(-direction.A);
        let rotatedY = rotatedZ * Math.sin(direction.B) + (element.Y + position.Y) * Math.cos(direction.B);
        rotatedZ = rotatedZ * Math.cos(direction.B) - (element.Y + position.Y) * Math.sin(direction.B);
        
        // write points
        shapes[shapes.length - 1].push({X: rotatedX/rotatedZ * FOV, Y: rotatedY/rotatedZ * FOV, distance: rotatedZ});
        trianglePoints.push({X: rotatedX, Y: rotatedY, Z: rotatedZ})
        
    });

    // distance to triangle based on 3 points
    shapes[shapes.length - 1].push((shapes[shapes.length - 1][0].distance + shapes[shapes.length - 1][1].distance + shapes[shapes.length - 1][2].distance) / 3)
    shapes[shapes.length - 1].push(texture)
    shapes[shapes.length - 1].push(trianglePoints)
}



// calculation of distance to point of ray and plane intersection
function raycast(points, ray) {  
    let Pn = normaliseVector(crossProduct(vecSub(points[1], points[0]), vecSub(points[2], points[0])));
    let Vd = dotProduct(Pn, ray[1])
    if (Math.abs(Vd) < 0.0001) {return false} // ray is parallel to the plane
    let t = - dotProduct(Pn, vecSub(ray[0], points[0])) / Vd
    if (t < 0) {return false} // intersection is behind player
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

function applyTexture(points, distance, textureId, pixel) {

    // calculate point of intersection of ray and 
    let intersection = {
        X: Math.round(pixel.X * distance / FOV * 2),
        Y: Math.round(pixel.Y * distance / FOV * 2),
        Z: distance * 2,
    }

    // calcutlate texture coordinates
    let texture = getTexture(textureId[0]) 
    let textureX = Math.floor(Math.round(perpendicularLength(points[0], points[1], intersection)) / magnitude(vecSub(points[1], points[0])) * texture[0].resolutionX)
    let perpendicular = vecAdd(trianglePerpendicular(points[0], points[2], points[1]), points[0])
    let textureY = Math.floor(Math.round(perpendicularLength(perpendicular, points[0], intersection)) / perpendicularLength(points[0], points[1], points[2]) * texture[0].resolutionY) + 1
    if (textureId[1] == true) { 
        textureX = texture[0].resolutionX - textureX - 1;
        textureY = textureY; 
    } else {
        let k = textureX
        textureX = textureY - 1;
        textureY = texture[0].resolutionY - k;
    }

    try {
        return [
            texture[0].colors[texture[textureY][textureX]][0] * Math.min(1 / distance * light, 1),
            texture[0].colors[texture[textureY][textureX]][1] * Math.min(1 / distance * light, 1),
            texture[0].colors[texture[textureY][textureX]][2] * Math.min(1 / distance * light, 1)
        ]
    } catch (error) {
        return [0, 0, 0]
    }
}

function initScreenColors() {
    let pixelCounter = 0;
    
    // get color for every pixel
    screen.forEach(element => {
        initialisePixelColor(element, pixelCounter)
        pixelCounter++;
    });
}
