import dotenv from "dotenv";

dotenv.config();

const ENVIROMENT = {
    PORT: process.env.PORT || 3000,
    URL_FRONTEND: `http://localhost:5173`,
    URL_BACKEND: `http://localhost:3000`,
    SECRET_KEY_JWT: process.env.SECRET_KEY_JWT,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    MYSQL: {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USERNAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_DATABASE: process.env.DB_DATABASE,
        DB_PORT: process.env.DB_PORT
    }
}

export default ENVIROMENT;