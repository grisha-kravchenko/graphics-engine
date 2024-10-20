
function graphics_Load() {

    // initialise screen graphics
    canvas = document.getElementById("MainCanvas");
    ctx = canvas.getContext("2d");
    screen = new Array;
    resize();
    window.onresize = resize;

    // initialise constants and important variables
    FOV = 100
    light = 100000
    position = {X: 0, Y: 0, Z: -500}
    rotation = {A: 15, B: 0}
}

function graphics_Tick(fps) {
    renderScreen(position, transformRotation(rotation));
    drawScreen();
    //sleep(1000/fps).then(() => graphicsTick(fps))
}


const sleep = (ms) => {return new Promise(resolve => setTimeout(resolve, ms))}

const initialiseScreen = (width, height, window, windowWidth, windowHeight) => {
    // add pixels to screen
    for (let pixelX = 0; pixelX <= width; pixelX++) {
        for (let pixelY = 0; pixelY <= height; pixelY++) {
            screen.push({
                X: pixelX - width / 2,
                Y: pixelY - height / 2,
                screenX: pixelX * window / width + (windowWidth - window) / 2,
                screenY: pixelY * window / height + (windowHeight - window) / 2,
                sizeX: window / width + 2,
                sizeY: window / height + 2,
                color: "rgb(0 0 0)"
            })
        }
    }
}

const drawScreen = () => {
    screen.forEach(pixel => {
        ctx.fillStyle = pixel.color
        ctx.fillRect(pixel.screenX, pixel.screenY, pixel.screenX + pixel.sizeX, pixel.screenY + pixel.sizeY)
    });
}

const resize = () => {
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = Math.min(window.innerWidth, window.innerHeight);
    ctx.fillStyle = "rgb(255 255 255)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    initialiseScreen(50, 50, Math.min(canvas.width, canvas.height), canvas.width, canvas.height);
    drawScreen();
}

const renderScreen = (origin, transformedRotation) => {
    triangles = [[{X:-100, Y:-100, Z:100}, {X:-100, Y:100, Z:100}, {X:100, Y:-100, Z:100}]]

    // project all triangles points
    let transformedTriangles = []
    triangles.forEach(localTriangle => {
        transformedTriangles.push({transformedTriangle: [
            // transform triangle points and save it
            projectPoint(localTriangle[0], origin, transformedRotation),
            projectPoint(localTriangle[1], origin, transformedRotation),
            projectPoint(localTriangle[2], origin, transformedRotation),
        ]});

        transformedTriangles[transformedTriangles.length - 1].triangle2d = [
            // project transformed triangle points on 2d screen
            {X: transformedTriangles[transformedTriangles.length - 1].transformedTriangle[0].X * FOV / Math.max(1, transformedTriangles[transformedTriangles.length - 1].transformedTriangle[0].Z),
             Y: transformedTriangles[transformedTriangles.length - 1].transformedTriangle[0].Y * FOV / Math.max(1, transformedTriangles[transformedTriangles.length - 1].transformedTriangle[0].Z)},
            {X: transformedTriangles[transformedTriangles.length - 1].transformedTriangle[1].X * FOV / Math.max(1, transformedTriangles[transformedTriangles.length - 1].transformedTriangle[1].Z),
             Y: transformedTriangles[transformedTriangles.length - 1].transformedTriangle[1].Y * FOV / Math.max(1, transformedTriangles[transformedTriangles.length - 1].transformedTriangle[1].Z)},
            {X: transformedTriangles[transformedTriangles.length - 1].transformedTriangle[2].X * FOV / Math.max(1, transformedTriangles[transformedTriangles.length - 1].transformedTriangle[2].Z),
             Y: transformedTriangles[transformedTriangles.length - 1].transformedTriangle[2].Y * FOV / Math.max(1, transformedTriangles[transformedTriangles.length - 1].transformedTriangle[2].Z)}
        ]
    }); 

    let pixelCounter = 0
    screen.forEach(pixel => {
        transformedTriangles.forEach(localTriangle => {
            screen[pixelCounter].color = "rgb(0 0 0)"
            getPixelColor(pixel, localTriangle, pixelCounter)
        });
        pixelCounter++;
    });
}

const projectPoint = (point, origin, transformedRotation) => {
    let rotatedX, rotatedY, rotatedZ;
    rotatedX = (origin.Z - point.Z) * transformedRotation.sinA + (origin.X - point.X) * transformedRotation.cosA;
    rotatedZ = (origin.Z - point.Z) * transformedRotation.cosA - (origin.X - point.X) * transformedRotation.sinA;
    rotatedY = rotatedZ * transformedRotation.sinB + (origin.Y - point.Y) * transformedRotation.cosB;
    rotatedZ = - rotatedZ * transformedRotation.cosB + (origin.Y - point.Y) * transformedRotation.sinB;
    return {X: rotatedX, Y: rotatedY, Z: rotatedZ}
}

const getPixelColor = (pixel, localTriangle, pixelCounter) => {
    if (!trianglePointIntersection(pixel, localTriangle.triangle2d)) { return }
    let distance = distanceToPlane(localTriangle.transformedTriangle, [
        {X: pixel.X, Y: pixel.Y, Z: 0},
        {X: pixel.X * 2, Y: pixel.Y * 2, Z: 1}
    ])
    screen[pixelCounter].color = "rgb(" + light / distance + " " +  light / distance + " " + light / distance + ")"
}

const trianglePointIntersection = (pixel, triangle) => {
    
    // define does point intersect with triangle or not
    let d1 = sign(pixel, triangle[0], triangle[1]);
    let d2 = sign(pixel, triangle[1], triangle[2]);
    let d3 = sign(pixel, triangle[2], triangle[0]);
    let has_neg = (d1 <= 0) || (d2 <= 0) || (d3 <= 0);
    let has_pos = (d1 >= 0) || (d2 >= 0) || (d3 >= 0);
    
    if (has_neg && has_pos) {return false}
    return true
}

const distanceToPlane = (triangle, vector) => {

    // find a distance to a point of intersection of vector and triangle
    let Pn = crossProduct(vecSub(triangle[1], triangle[0]), vecSub(triangle[2], triangle[0]));
    let Vd = dotProduct(Pn, vector[1])
    if (Math.abs(Vd) < 0.0001) {return false} // ray is parallel to the plane
    let t = - dotProduct(Pn, vecSub(vector[0], triangle[0])) / Vd
    if (t < 0) {return false} // intersection is behind player
    return t;
}