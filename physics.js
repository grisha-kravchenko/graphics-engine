function movement(normal_rotation) {
    position.Z += physicsConsts("speed") * (pressedKeys.w - pressedKeys.s) * Math.cos(normal_rotation.A) + physicsConsts("speed") * (pressedKeys.a - pressedKeys.d) * Math.sin(normal_rotation.A)
    position.X += physicsConsts("speed") * (pressedKeys.d - pressedKeys.a) * Math.cos(normal_rotation.A) + physicsConsts("speed") * (pressedKeys.w - pressedKeys.s) * Math.sin(normal_rotation.A)
    rotation.A += physicsConsts("rotationIntensivity") * (pressedKeys.ArrowRight - pressedKeys.ArrowLeft)
    rotation.B += physicsConsts("rotationIntensivity") * (pressedKeys.ArrowUp - pressedKeys.ArrowDown)
    if (position.Y == 20) {speedY = 20 * pressedKeys[" "]} else {speedY -= physicsConsts("gravity")}
    position.Y = Math.max(20, position.Y + speedY)
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
    
}

function physicsConsts(cons) {
    let consts = {
        speed: 5,
        rotationIntensivity: 2,
        gravity: 1.5,
        groundheight: 50,
    }

    return consts[cons]
}

function physicsTick(delay) {

    movement(normaliseRotation(rotation))

    // tick logic
    sleep(delay).then(() => physicsTick(delay))
}