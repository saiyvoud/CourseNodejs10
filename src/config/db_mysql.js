import mysql from "mysql";

const connected = mysql.createConnection({
  host: "mysql-175366-0.cloudclusters.net",
  port: "10043",
  user: "admin",
  password: "PMOGGpIk",
  database: "CourseNodejsDB",
});

connected.connect((err) => {
  if (err) {
    console.log("Faild Connected Mysql Database");
  }
  console.log("Connected Mysql Database");
});

export default connected;