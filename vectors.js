// Main vector math file

class vector3 {

    // vector class in 3d space

    constructor(X, Y, Z) {
        this.X = X;
        this.Y = Y;
        this.Z = Z;
    }

    get magnitude() {
        return Math.sqrt(this.dotProduct(this));
    }

    subtract(vector) {
        return new vector3(
            vector.X - this.X,
            vector.Y - this.Y,
            vector.Z - this.Z
        )
    }

    add(vector) {
        return new vector3(
            vector.X + this.X,
            vector.Y + this.Y,
            vector.Z + this.Z
        )
    }

    multiply(num) {
        return new vector3(
            this.X * num,
            this.Y * num,
            this.Z * num
        )
    }

    dotProduct(vector) {
        return this.X * vector.X + this.Y + vector.Y + this.Z * vector.Z
    }

    crossProduct(vector) {
        return new vector3(
            (this.Y * vector.Z - this.Z * vector.Y),
            (this.Z * vector.X - this.X * vector.Z),
            (this.X * vector.Y - this.Y * vector.X)
        )
    }
};

class vector2 {

        // vector class in 2d space

        constructor(X, Y) {
            this.X = X
            this.Y = Y
        }

        get(name) {
            switch (name) {
                case "X": return this.X
                case "Y": return this.Y
                default: return false
            }
        }
    
        get magnitude() {
            return Math.hypot(this.X, this.Y)
        }
    
        subtract(vector) {
            return new vector2(
                vector.X - this.X,
                vector.Y - this.Y
            )
        }
    
        add(vector) {
            return new vector2(
                vector.X + this.X,
                vector.Y + this.Y
            )
        }
    
        multiply(num) {
            return new vector2(
                this.X * num,
                this.Y * num
            )
        }

        transformRotation() {return {
            sinA: Math.sin(-this.X * Math.PI / 180), 
            cosA: Math.cos(this.X * Math.PI / 180), 
            sinB: Math.sin(-this.Y * Math.PI / 180), 
            cosB: Math.cos(this.Y * Math.PI / 180)
        }}
};

const vectorMath = {
    subtract: (a, b) => { return a.subtract(b) },
    add: (a, b) => { return a.add(b) },
    multiply: (a, b) => { return a.multiply(b) },
    dotProduct: (a, b) => { return a.dotProduct(b) },
    crossProduct: (a, b) => { return a.crossProduct(b) }
};

vectorMath.sign = (p1, p2, p3) => {
    return (p1.X - p3.X) * (p2.Y - p3.Y) - (p2.X - p3.X) * (p1.Y - p3.Y)
}

export { vector2, vector3 , vectorMath};