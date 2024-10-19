
function graphics_Load() {

    // initialise screen graphics
    canvas = document.getElementById("MainCanvas");
    ctx = canvas.getContext("2d");
    screen = new Array;
    resize();
    window.onresize = resize;

    // initialise constants and important variables
    FOV = 100
    position = {X: 50, Y: 50, Z: -100}
    rotation = {A: 160, B: -90}
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
                sizeX: window / width + 1,
                sizeY: window / height + 1,
                color: "rgb(" + Math.random()*255 + " " + Math.random()*255 + " " + Math.random()*255 + ")"
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
    triangles = [[{X:0, Y:0, Z:0}, {X:0, Y:0, Z:100}, {X:100, Y:0, Z:0}]]

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
            {X: transformedTriangles[transformedTriangles.length - 1].transformedTriangle[0].X / Math.max(0, transformedTriangles[transformedTriangles.length - 1].transformedTriangle[0].Z * FOV),
             Y: transformedTriangles[transformedTriangles.length - 1].transformedTriangle[0].Y / Math.max(0, transformedTriangles[transformedTriangles.length - 1].transformedTriangle[0].Z * FOV)},
            {X: transformedTriangles[transformedTriangles.length - 1].transformedTriangle[1].X / Math.max(0, transformedTriangles[transformedTriangles.length - 1].transformedTriangle[1].Z * FOV),
             Y: transformedTriangles[transformedTriangles.length - 1].transformedTriangle[1].Y / Math.max(0, transformedTriangles[transformedTriangles.length - 1].transformedTriangle[1].Z * FOV)},
            {X: transformedTriangles[transformedTriangles.length - 1].transformedTriangle[2].X / Math.max(0, transformedTriangles[transformedTriangles.length - 1].transformedTriangle[2].Z * FOV),
             Y: transformedTriangles[transformedTriangles.length - 1].transformedTriangle[2].Y / Math.max(0, transformedTriangles[transformedTriangles.length - 1].transformedTriangle[2].Z * FOV)}
        ]
    });

    let pixelCounter = 0
    screen.forEach(pixel => {
        transformedTriangles.forEach(localTriangle => {
            getPixelColor(pixel, localTriangle, pixelCounter)
        });
        pixelCounter++;
    });
}

const projectPoint = (point, origin, transformedRotation) => {
    let rotatedX, rotatedY, rotatedZ;
    rotatedX = (origin.X - point.X) * transformedRotation.cosA - (origin.Z - point.Z) * transformedRotation.sinA;
    rotatedZ = (origin.Z - point.Z) * transformedRotation.cosA + (origin.X - point.X) * transformedRotation.sinA;
    rotatedY = rotatedZ * transformedRotation.sinB + (origin.X - point.X) * transformedRotation.cosB;
    rotatedZ = rotatedZ * transformedRotation.cosB + (origin.X - point.X) * transformedRotation.sinB;
    return {X: rotatedX, Y: rotatedY, Z: rotatedZ}
}

const getPixelColor = (pixel, localTriangle, pixelCounter) => {
    screen[pixelCounter].color = "rgb(0 0 0)"
    if (trianglePointIntersection(pixel, localTriangle.triangle2d)) {
        screen[pixelCounter].color = "rgb(255 255 255)"
    }
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