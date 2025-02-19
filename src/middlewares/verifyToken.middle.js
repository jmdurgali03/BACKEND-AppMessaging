import jwt from "jsonwebtoken";
import ENVIROMENT from "../config/enviroment.js";

const verifyToken = (request, response, next) => {
    const token = request.headers.authorization.split(" ")[1];

    if (!token) {
        return response.json({
            ok: false,
            status: 401,
            message: "Token not found"
        })
    }

    jwt.verify(token, ENVIROMENT.SECRET_KEY_JWT, (error, decoded) => {
        if (error) {
            return response.json({
                ok: false,
                status: 401,
                message: "Invalid token"
            })
        }

        request.user = decoded;
        console.log(request.user);
        return next();
    })
}

export default verifyToken;