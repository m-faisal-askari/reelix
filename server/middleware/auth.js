import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
    try {
        const {userId} = req.Auth()

        const user = clerkClient.users.getUser(userId)

        if ((await user).privateMetadata.role !== "admin") {
            return res.json({success: false, message: "not authorized"})
        }
    } catch (error) {

        return res.json({success: false, message: "not authorized"})
        
    }
    
}