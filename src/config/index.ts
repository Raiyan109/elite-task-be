import dotenv from "dotenv";
dotenv.config();

export default {
  node_env: "development",
  port: 5000,
  db_url:
    "mongodb+srv://kraiyan109:qfqBDFMqFWqPucpj@classicitdatabases.kazph.mongodb.net/elite-task?retryWrites=true&w=majority&appName=classicITDatabases",
    // "mongodb://classicit_foodplususer:yOjI3BASA6@103.240.4.56:27017/classicit_foodplusdb?replicaSet=rs0&authSource=admin",

  bcrypt_salt_rounds: "10",
  jwt_access_secret: "mysecretkey",
  //jwt_access_expires_in: '1d',
  email: {
    from: "kraiyan109@gmail.com",
    user: "kraiyan109@gmail.com",
    port: 587,
    host: "smtp.gmail.com",
    pass: "awcy obyh xkfq kiji",
  },
  payment: {
    store_id: "foodp685a47416f86d",
    store_passwd: "foodp685a47416f86d@ssl",
    is_live: false,
  },
  baseApiWebLocal: "http://localhost:3000",
  baseApiWebLive: "https://foodplus.classicecommerce.com",

  baseApiBackendLocal: "http://192.168.0.169:5000/api/v1",
  baseApiBackendLive: "https://foodplusbackend.classicecommerce.com/api/v1",
};

// export default {
//     node_env: process.env.NODE_ENV,
//     port: process.env.PORT,
//     db_url: process.env.DATABASE_URL,
//     bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
//     jwt_access_secret: process.env.JWT_ACCESS_SECRET || 'default_secret',
//     jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
//     email: {
//         from: process.env.EMAIL_FROM,
//         user: process.env.EMAIL_USER,
//         port: process.env.EMAIL_PORT,
//         host: process.env.EMAIL_HOST,
//         pass: process.env.EMAIL_PASS,
//     },
// }
