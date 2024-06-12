import mongoose from "mongoose";

const connection = mongoose
.connect(
  "mongodb+srv://coursenodejs:kyljvebRpp9j71Hp@cluster0.03bfuhr.mongodb.net/"
)
.then(() => {
  console.log("Connected Database");
})
.catch(() => {
  console.log("Faild Connected DB");
});


  export default connection;
//   export {connection} 