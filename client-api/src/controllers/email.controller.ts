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
    const { email, items, language } = req.body;

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

    const selectedLanguage = language === "el" ? "el" : "en";

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        error: "Email service is not configured correctly.",
      });
    }

    const translations = {
      en: {
        subject: "Your Shopping List",
        intro: "Here is your shopping list:",
        footer:
          "This email was sent because you requested it in PriceWise.\n" +
          "PriceWise does not store your email address.",
        unnamedItem: "Unnamed item",
        unknownSupermarket: "Unknown supermarket",
      },
      el: {
        subject: "Η λίστα αγορών σας",
        intro: "Αυτή είναι η λίστα αγορών σας:",
        footer:
          "Αυτό το email στάλθηκε επειδή το ζητήσατε μέσα από το PriceWise.\n" +
          "Το PriceWise δεν αποθηκεύει τη διεύθυνση email σας.",
        unnamedItem: "Προϊόν χωρίς όνομα",
        unknownSupermarket: "Άγνωστο σούπερ μάρκετ",
      },
    };

    const emailText = translations[selectedLanguage];

    const listText = items
      .map((item: ShoppingListItem) => {
        const name = item.name ?? emailText.unnamedItem;
        const supermarket = item.supermarket ?? emailText.unknownSupermarket;
        const price = item.price ?? "-";

        return `• ${name} (${supermarket}) - €${price}`;
      })
      .join("\n");

    await mailTransporter.sendMail({
      from: `"PriceWise" <${process.env.EMAIL_USER}>`,
      to: receiverEmail,
      subject: emailText.subject,
      text: `${emailText.intro}\n\n${listText}\n\n${emailText.footer}`,
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