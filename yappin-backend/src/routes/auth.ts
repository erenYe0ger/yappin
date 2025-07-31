import express from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";

const router = express.Router();

const createToken = (id: string): string => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Env variables not set properly!");
    }
    
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: "1d",
    });
};

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ msg: "All fields are required!" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ msg: "User Already Exists!" });

        const newUser = new User({ name, email, password });
        await newUser.save();

        const token = createToken(newUser._id.toString());
        res.status(200).json({
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (err) {
        console.error("Register error: ", err);
        res.status(500).json({ msg: "Server Error!" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ msg: "All fields are required!" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser)
            return res.status(400).json({ msg: "User not found!" });

        const validPass = await existingUser.comparePassword(password);
        if (!validPass)
            return res.status(400).json({ msg: "Invalid password" });

        const token = createToken(existingUser._id.toString());
        res.status(200).json({
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
            },
        });
    } catch (err) {
        res.status(500).json({ msg: "Server Error!" });
    }
});

export default router;
