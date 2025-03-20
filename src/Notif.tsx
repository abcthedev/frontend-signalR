import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

const NotificationComponent = () => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [notifications, setNotifications] = useState<string[]>([]);
    const [userId, setUserId] = useState("");
    const [message, setMessage] = useState("");
    const [connectionStatus, setConnectionStatus] = useState("Connecting...");

    useEffect(() => {
        if (connection) return;
        
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5101/notificationHub")
            .withAutomaticReconnect()
            .build();

        newConnection
            .start()
            .then(() => {
                console.log("✅ SignalR Connected!");
                setConnectionStatus("✅ Connected to SignalR!");
            })
            .catch((err) => {
                console.error("❌ SignalR Connection Error:", err);
                setConnectionStatus("❌ Connection Failed!");
            });

        newConnection.on("ReceiveNotification", (message: string) => {
            console.log("📢 New Notification:", message);
            setNotifications((prev) => [...prev, message]);
        });

        setConnection(newConnection);

        // return () => {
        //     newConnection.stop();
        // };
    }, []);

    const sendNotification = async () => {
        if (!userId || !message) {
            alert("Please enter User ID and Message!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5101/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, message }),
            });

            if (!response.ok) {
                throw new Error("Failed to send notification");
            }

            console.log("✅ Notification sent successfully");
            setUserId("");
            setMessage("");
        } catch (error) {
            console.error("❌ Error sending notification:", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch("http://localhost:5101/api/notifications");
            const data = await response.json();
            setNotifications(data.map((n: { userId: string, message: string }) => `User ${n.userId}: ${n.message}`));
        } catch (error) {
            console.error("❌ Error fetching notifications:", error);
        }
    };

    return (
        <div>
            <h2>Notifications</h2>
            <h4>SignalR Status: {connectionStatus}</h4>
            <div>
                <span>User ID</span>
                <input
                    type="text"
                    placeholder="Enter User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    style={{ margin: "0.5rem" }}
                />
            </div>
            <div>
                <span>Message</span>
                <input
                    type="text"
                    placeholder="Enter Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ margin: "0.5rem" }}
                />
            </div>
            <div>
                <button onClick={sendNotification} style={{ marginLeft: "0.5rem", background: "green", color: "#fff" }}>Send Notification</button>
                <button onClick={fetchNotifications} style={{ marginLeft: "0.5rem", background: "blue", color: "#fff" }}>Refresh</button>
            </div>
            <ul>
                {notifications.map((notification, index) => (
                    <li key={index}>{notification}</li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationComponent;
