import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export const useSocket = (onPriceUpdate: () => void) => {
  useEffect(() => {
    socket.on("price-updated", () => {
      console.log("Price updated event received");
      onPriceUpdate();
    });

    return () => {
      socket.off("price-updated");
    };
  }, [onPriceUpdate]);
};