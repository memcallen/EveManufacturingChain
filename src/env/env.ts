
export const {
    
} = process.env.NODE_ENV === "development" ? require("./dev") :
    process.env.NODE_ENV === "production" ? require("./prod") :
    console.error("invalid NODE_ENV:", process.env.NODE_ENV);
