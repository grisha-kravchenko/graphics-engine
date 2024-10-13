function movement(normal_rotation) {
    position.Z += physicsConsts("speed") * (pressedKeys.w - pressedKeys.s) * Math.cos(normal_rotation.A) + physicsConsts("speed") * (pressedKeys.a - pressedKeys.d) * Math.sin(normal_rotation.A)
    position.X += physicsConsts("speed") * (pressedKeys.d - pressedKeys.a) * Math.cos(normal_rotation.A) + physicsConsts("speed") * (pressedKeys.w - pressedKeys.s) * Math.sin(normal_rotation.A)
    if (position.Y == physicsConsts("groundheight")) {speedY = 20 * pressedKeys[" "]} else {speedY -= physicsConsts("gravity")}
    position.Y = Math.max(physicsConsts("groundheight"), position.Y + speedY)
}

function lockChangeAlert() {
    if (document.pointerLockElement === canvas.canvas) {
      document.addEventListener("mousemove", updatePosition, false);
    } else {
      document.removeEventListener("mousemove", updatePosition, false);
    }
}

function updatePosition(event) {
    rotation.A += physicsConsts("rotationIntensivity") * event.movementX
    rotation.B = Math.min(Math.max(rotation.B - physicsConsts("rotationIntensivity") * event.movementY, -90), 90)
}

function physicsLoad() {
    speedY = 0
    pressedKeys = {" ": 0, w: 0, a: 0, s: 0, d: 0, ArrowRight: 0, ArrowLeft: 0, ArrowUp: 0, ArrowDown: 0}

    document.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) { return }
        pressedKeys[event.key] = 1
    });

    document.addEventListener("keyup", function (event) {
        pressedKeys[event.key] = 0
    });

    document.getElementById("mainCanvas").addEventListener("click", async () => {
        await document.getElementById("mainCanvas").requestPointerLock({
          unadjustedMovement: true,
        });
    });
    document.addEventListener("pointerlockchange", lockChangeAlert, false);
    mousePosition = {X: 0, Y: 0}

}

function physicsConsts(cons) {
    let consts = {
        speed: 5,
        rotationIntensivity: 0.25,
        gravity: 1.5,
        groundheight: 100,
    }

    return consts[cons]
}

function physicsTick(delay) {

    movement(normaliseRotation(rotation))

    // tick logic
    sleep(delay).then(() => physicsTick(delay))
}