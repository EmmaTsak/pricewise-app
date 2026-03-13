import { Request, Response } from "express";
import nodemailer from "nodemailer";

export const sendShoppingList = async (req: Request, res: Response) => {
  try {
    const { email, items } = req.body;

    if (!email || !items) {
      return res.status(400).json({
        error: "Missing email or shopping list"
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const listText = items
      .map((item: any) => `• ${item.name} (${item.supermarket})`)
      .join("\n");

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your PriceWise Shopping List",
      text: `Here is your shopping list:\n\n${listText}`
    });

    res.json({ message: "Email sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to send email"
    });
  }
};