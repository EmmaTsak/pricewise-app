import { Request, Response } from "express";
import { mailTransporter } from "../config/mail";
import { isValidEmail } from "../utils/validateEmail";

type ShoppingListItem = {
  name?: string;
  supermarket?: string;
  price?: number | string;
};

export const sendShoppingList = async (req: Request, res: Response) => {
  try {
    const { email, items } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        error: "Please provide an email address.",
      });
    }

    const receiverEmail = email.trim();

    if (!isValidEmail(receiverEmail)) {
      return res.status(400).json({
        error: "Please enter a valid email address.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Your shopping list is empty.",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        error: "Email service is not configured correctly.",
      });
    }

    const listText = items
      .map((item: ShoppingListItem) => {
        const name = item.name ?? "Unnamed item";
        const supermarket = item.supermarket ?? "Unknown supermarket";
        const price = item.price ?? "-";

        return `• ${name} (${supermarket}) - €${price}`;
      })
      .join("\n");

    await mailTransporter.sendMail({
      from: `"PriceWise" <${process.env.EMAIL_USER}>`,
      to: receiverEmail,
      subject: "Your Shopping List",
      text:
        `Here is your shopping list:\n\n${listText}\n\n` +
        `This email was sent because you requested it in PriceWise.\n` +
        `PriceWise does not store your email address.`,
    });

    return res.status(200).json({
      message: "Shopping list sent successfully.",
    });
  } catch (error) {
    console.error("Failed to send shopping list email:", error);

    return res.status(500).json({
      error: "We could not send your shopping list right now. Please try again later.",
    });
  }
};