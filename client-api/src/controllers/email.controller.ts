import { Request, Response } from "express";
import nodemailer from "nodemailer";

export const sendShoppingList = async (req: Request, res: Response) => {
  try {
    const { email, items } = req.body;

    if (!email || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Missing email or shopping list"
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const listText = items
      .map(
        (item: any) =>
          `• ${item.name} (${item.supermarket}) - €${item.price}`
      )
      .join("\n");

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your PriceWise Shopping List",
      text:
        `Here is your shopping list:\n\n${listText}\n\n` +
        `This email was sent because you requested it in PriceWise. ` +
        `PriceWise does not store your email address after sending.`
    });

    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to send email"
    });
  }
};