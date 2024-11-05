
// basic math for 3d engine
import { vector2, vector3, vectorMath } from "./vectors.js";

// graphics object is used for global variables inside graphics.js script
const graphics = new Object();

// export object is used for variables which will be exported
const exports = new Object();

exports.Load = () => {

    // initialise screen graphics
    graphics.canvas = document.getElementById("MainCanvas");
    graphics.ctx = graphics.canvas.getContext("2d");
    graphics.screen = new Array;

    // initialise constants and important variables
    graphics.resolution = 50
    graphics.FOV = 100;
    graphics.light = 200;
    graphics.position = new vector3(0, 0, 300);
    graphics.rotation = new vector2(0, 0);
    graphics.triangles = [
        [new vector3(-100, -100, -100), new vector3(-100, 100, -100), new vector3(100, -100, -100)]
    ]

    resize();
    window.onresize = resize;
}

exports.Tick = (time) => {
    renderScreen(graphics.position, graphics.rotation);
    drawScreen();
    sleep(time).then(() => exports.Tick(time))
}

exports.changeLocals = (variable, value) => {
    graphics[variable] = value
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const resize = () => {

    // code which resizes canvas and pixels on window resize
    graphics.size = Math.min(window.innerWidth, window.innerHeight);
    graphics.canvas.width = graphics.size;
    graphics.canvas.height = graphics.size;
    //graphics.ctx.fillStyle = "rgb(255 255 255)";
    //graphics.ctx.fillRect(0, 0, graphics.size, graphics.canvas.width, graphics.canvas.height);
    initialiseScreen(graphics.resolution, graphics.resolution, graphics.size, graphics.size, graphics.size);
    drawScreen();
}

const initialiseScreen = (width, height, window, windowWidth, windowHeight) => {
    // add pixels to screen
    for (let pixelX = 0; pixelX <= width; pixelX++) {
        for (let pixelY = 0; pixelY <= height; pixelY++) {
            graphics.screen.push({
                pixelPos: new vector2(pixelX - width / 2, pixelY - height / 2),
                screenPos: new vector2( pixelX * window / width + (windowWidth - window) / 2, pixelY * window / height + (windowHeight - window) / 2),
                size: new vector2(window / width + 1, window / height + 1),
                color: new vector3(0, 0, 0)
            })
        }
    }
}

const drawScreen = () => {
    graphics.screen.forEach(pixel => {
        graphics.ctx.fillStyle = "rgb(" + pixel.color.X + " " + pixel.color.Y + " " + pixel.color.Z + ")"
        graphics.ctx.fillRect(pixel.screenPos.X, pixel.screenPos.Y, pixel.size.X, pixel.size.Y)
    });
}

const renderScreen = (origin, rotation) => {

    // project triangle points to screen,
    // start pixel logic

    const transformedRotation = rotation.transformRotation();
    const transformedTriangles = new Array();
    graphics.triangles.forEach(triangle => {
        const projectedPoints = [
            projectPoint(triangle[0], origin, transformedRotation),
            projectPoint(triangle[1], origin, transformedRotation),
            projectPoint(triangle[2], origin, transformedRotation)
        ];
        transformedTriangles.push({
            points: projectedPoints,
            lines2d: [
                [new vector2(projectedPoints[0].X * graphics.resolution / projectedPoints[0].Z, projectedPoints[0].Y / projectedPoints[0].Z * graphics.resolution),
                    new vector2(projectedPoints[1].X * graphics.resolution / projectedPoints[1].Z, projectedPoints[1].Y / projectedPoints[1].Z * graphics.resolution)],
                [new vector2(projectedPoints[1].X * graphics.resolution / projectedPoints[1].Z, projectedPoints[1].Y / projectedPoints[1].Z * graphics.resolution),
                    new vector2(projectedPoints[2].X * graphics.resolution / projectedPoints[2].Z, projectedPoints[2].Y / projectedPoints[2].Z * graphics.resolution)],
                [new vector2(projectedPoints[2].X * graphics.resolution / projectedPoints[2].Z, projectedPoints[2].Y / projectedPoints[2].Z * graphics.resolution),
                    new vector2(projectedPoints[0].X * graphics.resolution / projectedPoints[0].Z, projectedPoints[0].Y / projectedPoints[0].Z * graphics.resolution)]
            ]
        });
        
    });

    let pixelCounter = 0;
    graphics.screen.forEach(pixel => {
        pixelCounter ++;
        transformedTriangles.forEach( triangle => {renderPixelLogic(pixel, pixelCounter, triangle)})
    });
}
const renderPixelLogic = (pixel, pixelCounter, triangle) => {
    // apply simple shader with texture
    // overwrite pixel colors
    graphics.screen[pixelCounter - 1].color = new vector3(0, 0, 0);

    if (!trianglePointIntersection(pixel.pixelPos, triangle.lines2d)) {
        return
    }

    const intersectionDistance = distanceToPlane(triangle.points, [new vector3(pixel.pixelPos.X, pixel.pixelPos.Y, 0), new vector3(pixel.pixelPos.X * 2, pixel.pixelPos.Y * 2, 1)])
    graphics.screen[pixelCounter - 1].color = new vector3(255 * graphics.light / intersectionDistance, 255 * graphics.light / intersectionDistance, 255 * graphics.light / intersectionDistance);
}

const trianglePointIntersection = (point, lines) => {
    
    // define does point intersect with triangle or not
    let d1 = vectorMath.sign(point, lines[0][0], lines[0][1]);
    let d2 = vectorMath.sign(point, lines[1][0], lines[1][1]);
    let d3 = vectorMath.sign(point, lines[2][0], lines[2][1]);
    let has_neg = (d1 <= 0) || (d2 <= 0) || (d3 <= 0);
    let has_pos = (d1 >= 0) || (d2 >= 0) || (d3 >= 0);
    
    if (has_neg && has_pos) {return false}
    return true
}

const distanceToPlane = (points, ray) => {  
    const planeNormal = vectorMath.crossProduct(vectorMath.subtract(points[1], points[0]), vectorMath.subtract(points[2], points[0]));
    const Vd = vectorMath.dotProduct(planeNormal, ray[1]);
    let pointDistance = - vectorMath.dotProduct(planeNormal, vectorMath.subtract(ray[0], points[0])) / Vd;
    if (pointDistance < 0) {return false}; // intersection is behind player
    return pointDistance;
}


// const edges = {INSIDE: 0, LEFT: 1, RIGHT: 2, BOTTOM: 4, TOP: 8}
// const computeOutcode = (point, rectangle) => {
//     let code = INSIDE;

//     if (point.X < rectangle.xMin) code |= LEFT;
//     else if (point.X > rectangle.xMax) code |= RIGHT;
//     if (point.Y < rectangle.yMin) code |= BOTTOM;
//     else if (point.Y > rectangle.yMax) code |= TOP;

//     return code;
// }
// const lineCropping = (pointA, pointB, rectangle) => {
//     let outcode1 = computeOutcode(pointA, rectangle);
//     let outcode2 = computeOutcode(pointB, rectangle);
//     let accept = false;

//     while (true) {
//         if ((outcode1 | outcode2) == 0) { // Trivial accept
//             accept = true;
//             break;
//         } else if ((outcode1 & outcode2) !== 0) { // Trivial reject
//             break;
//         } else {
//             let x, y;
//             const outcodeOut = outcode1 !== 0 ? outcode1 : outcode2;

//             if (outcodeOut & TOP) { // Point is above the rectangle
//                 x = x1 + (x2 - x1) * (rectangle.yMax - pointA.Y) / (pointB.Y -  pointA.Y);
//                 y = rectangle.yMax;
//             } else if (outcodeOut & BOTTOM) { // Point is below the rectangle
//                 x = x1 + (x2 - x1) * (rectangle.yMin - pointA.Y) / (pointB.Y - pointA.Y);
//                 y = rectangle.yMin;
//             } else if (outcodeOut & RIGHT) { // Point is to the right of the rectangle
//                 y = y1 + (y2 - y1) * (rectangle.xMax - pointA.Y) / (pointB.X - pointA.X);
//                 x = rectangle.xMax;
//             } else if (outcodeOut & LEFT) { // Point is to the left of the rectangle
//                 y = y1 + (y2 - y1) * (rectangle.xMin - pointA.Y) / (pointB.X - pointA.X);
//                 x = rectangle.xMin;
//             }

//             if (outcodeOut === outcode1) {
//                 pointA = new vector2(x, y)
//                 outcode1 = computeOutcode(pointA, rectangle);
//             } else {
//                 pointB = new vector2(x, y)
//                 outcode2 = computeOutcode(pointB, rectangle);
//             }
//         }
//     }

//     if (accept) {
//         return { x1, y1, x2, y2 };
//     } else {
//         return false; // Line is completely outside the rectangle
//     }
// }

const projectPoint = (point, origin, transformedRotation) => {
    
    // transform 3d points related to player position / rotation
    let rotatedX, rotatedY, rotatedZ;
    rotatedX = (origin.Z - point.Z) * transformedRotation.sinA + (origin.X - point.X) * transformedRotation.cosA;
    rotatedZ = (origin.Z - point.Z) * transformedRotation.cosA - (origin.X - point.X) * transformedRotation.sinA;
    rotatedY = rotatedZ * transformedRotation.sinB + (origin.Y - point.Y) * transformedRotation.cosB;
    rotatedZ = - rotatedZ * transformedRotation.cosB + (origin.Y - point.Y) * transformedRotation.sinB;
    return new vector3(rotatedX, rotatedY, rotatedZ)
}

export { exports }

