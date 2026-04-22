import { useEffect } from "react";
import { io } from "socket.io-client";
import { env } from "../config/env";

// Create one shared socket connection for the app.
const socket = io(env.socketUrl, {
  transports: ["websocket", "polling"],
});

export const useSocket = (onPricesChanged: () => void) => {
  useEffect(() => {
    const handleRefresh = () => {
      console.log("Realtime refresh event received");
      onPricesChanged();
    };

    socket.on("price-updated", handleRefresh);
    socket.on("prices-refreshed", handleRefresh);

    return () => {
      socket.off("price-updated", handleRefresh);
      socket.off("prices-refreshed", handleRefresh);
    };
  }, [onPricesChanged]);
};