function transformRotation(rot) {return {
    sinA: Math.sin(rot.A * Math.PI / 180), 
    cosA: Math.cos(rot.A * Math.PI / 180), 
    sinB: Math.sin(rot.B * Math.PI / 180), 
    cosB: Math.cos(rot.B * Math.PI / 180)
}}
function sign(p1, p2, p3) { return (p1.X - p3.X) * (p2.Y - p3.Y) - (p2.X - p3.X) * (p1.Y - p3.Y) }
function crossProduct(a, b) { return {X: (a.Y * b.Z - a.Z * b.Y), Y: (a.Z * b.X - a.X * b.Z), Z: (a.X * b.Y - a.Y * b.X)} }
function dotProduct(a, b) { return (a.X * b.X) + (a.Y * b.Y) + (a.Z * b.Z) }
function vecSub(a, b) { return {X: a.X - b.X, Y: a.Y - b.Y, Z: a.Z - b.Z} }
