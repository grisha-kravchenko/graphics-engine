// Math functions used for ray calculations
function normaliseRotation(rotation) { return {A: rotation.A/180*Math.PI, B: rotation.B/180*Math.PI} }
function sign(p1, p2, p3) { return (p1.X - p3.X) * (p2.Y - p3.Y) - (p2.X - p3.X) * (p1.Y - p3.Y) }
function crossProduct(a, b) { return {X: (a.Y * b.Z - a.Z * b.Y), Y: (a.Z * b.X - a.X * b.Z), Z: (a.X * b.Y - a.Y * b.X)} }
function vecSub(a, b) { return {X: a.X - b.X, Y: a.Y - b.Y, Z: a.Z - b.Z} }
function dotProduct(a, b) { return (a.X * b.X) + (a.Y * b.Y) + (a.Z * b.Z) }