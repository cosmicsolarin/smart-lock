import mqtt, { MqttClient } from "mqtt";

// Replace these with your HiveMQ Cloud credentials
const BROKER_URL = process.env.MQTT_BROKER_URL as String | undefined; // Replace with your HiveMQ broker URL
const USERNAME = "prajyu";
const PASSWORD = "iub1ou3b809x108xb0A";

let client: MqttClient | null = null;

// Function to connect to the MQTT broker
export const connectMqtt = () => {
  if (client && client.connected) {
    return;
  }

  client = mqtt.connect(BROKER_URL, {
    username: USERNAME,
    password: PASSWORD,
  });

  client.on("connect", () => {
    console.log("Connected to HiveMQ broker");
  });

  client.on("error", (error) => {
    console.error("MQTT Error:", error);
  });

  client.on("close", () => {
    console.log("MQTT connection closed");
  });
};

// Function to publish a message to the topic
export const publishUnlockMessage = async (message: string) => {
  if (!client || !client.connected) {
    connectMqtt();
    // Wait until connection is established before publishing
    await new Promise<void>((resolve, reject) => {
      client?.once("connect", () => resolve());
      client?.once("error", (err) => reject(err));
    });
  }
  if (client && client.connected) {
    client.publish("unlock/servo", message, (err) => {
      if (err) {
        console.error("Failed to send unlock message:", err);
      } else {
        console.log("Unlock message sent:", message);
      }
    });
  } else {
    console.log("MQTT client not connected.");
  }
};
