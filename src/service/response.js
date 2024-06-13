export const SendCreate =(res,message,data)=>{
    res.status(201).json({success: true,message,data}) // 201 Create Status code
}
export const SendSuccess = (res,message,data)=>{
    res.status(200).json({success: true,message,data}); // 200 OK Status Code
}
export const SendAlready = (res,message,data)=>{
    res.status(208).json({success: false,message,data}); // 208 Already Status Code
}
export const SendError400 = (res,message,error)=>{
    res.status(400).json({success: false,message,error,data:{}}); // 400 Bad Request Status Code
}
export const SendError401 = (res,message,error)=>{
    res.status(401).json({success: false,message,error,data:{}}); // 401 unauthorized Status Code
}
export const SendError404 = (res,message,error)=>{
    res.status(404).json({success: false,message,error,data:{}}); // 400 Not Found Status Code
}
export const SendError500 = (res,message,error)=>{
    res.status(500).json({success: false,message,error,data:{}}); // 500 Server Error Internal Status Code
}