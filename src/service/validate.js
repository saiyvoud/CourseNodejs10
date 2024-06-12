export const ValidateData = async (data)=>{
 return Object.keys(data).filter((e)=> !data[e]) // key username: "" , password: 1234
}