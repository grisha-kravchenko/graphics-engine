function getTexture(textureId) {
    switch (textureId) {
        case "bricks": return [
            {resolutionX: 4, resolutionY: 4, colors: [[163, 20, 20], [97, 65, 20]]},
            [0, 0, 1, 0],
            [1, 1, 1, 1],
            [0, 1, 0, 0],
            [1, 1, 1, 1]
        ]
    }
}