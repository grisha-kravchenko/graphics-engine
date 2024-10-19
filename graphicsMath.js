function transformRotation(rot) {return {
    sinA: Math.sin(rot.A * 180 / Math.PI), 
    cosA: Math.cos(rot.A * 180 / Math.PI), 
    sinB: Math.sin(rot.B * 180 / Math.PI), 
    cosB: Math.cos(rot.B * 180 / Math.PI)
}}
function sign(p1, p2, p3) { return (p1.X - p3.X) * (p2.Y - p3.Y) - (p2.X - p3.X) * (p1.Y - p3.Y) }