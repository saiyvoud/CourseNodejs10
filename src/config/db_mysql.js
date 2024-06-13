import mysql from "mysql";
import {
  DATABASE_NAME,
  PASSWORD,
  PORT_DATABASE,
  URL_DATABASE,
  USERNAME_DATABASE,
} from "./config.js";

const connected = mysql.createConnection({
  host: URL_DATABASE,
  port: PORT_DATABASE,
  user: USERNAME_DATABASE,
  password: PASSWORD,
  database: DATABASE_NAME,
});

connected.connect((err) => {
  if (err) {
    console.log("Faild Connected Mysql Database");
  } else {
    console.log("Connected Mysql Database");
  }
});

export default connected;
