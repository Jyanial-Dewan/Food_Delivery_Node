const { FIREBASE_PRIVATE_KEY_BASE64 } = require("../../Variables/variables");
const prisma = require("../../DB/db.config");

const decodedKey = Buffer.from(FIREBASE_PRIVATE_KEY_BASE64, "base64").toString(
  "utf-8",
);

const admin = require("firebase-admin");

const serviceAccount = JSON.parse(decodedKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//To store the tokens
const userTokens = {};

// Register device tokens with usernames
exports.registerToken = (req, res) => {
  const { token, user_id } = req.body;
  const user = Number(user_id);

  if (!user || !token) {
    return res.status(400).send("User and token are required");
  }

  // Add the token to the user's list of tokens
  if (!userTokens[user]) {
    userTokens[user] = new Set();
  }
  userTokens[user].add(token);

  res.send("Token registered successfully");
};

// Unregister device tokens
exports.unregisterToken = (req, res) => {
  const { token, userId } = req.body;
  const user = Number(userId);

  if (!user || !token) {
    return res.status(400).send("User and token are required");
  }

  // Check if the user and token exist
  if (userTokens[user] && userTokens[user].has(token)) {
    userTokens[user].delete(token);

    // If no more tokens are registered for the user, clean up the entry
    if (userTokens[user].size === 0) {
      delete userTokens[user];
    }

    res.send("Token unregistered successfully");
  } else {
    res.status(404).send("Token or user not found");
  }
};

//To send notification to every individual fcm token
exports.sendUpdatedStatus = async (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).send("Order id is required");
  }

  try {
    const order = await prisma.order_summary_view.findUnique({
      where: {
        order_id: Number(order_id),
      },
    });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const customerId = order.customer_id;

    const tokens = userTokens[customerId];

    if (!tokens || tokens.size === 0) {
      return res.status(404).send("No registered device tokens for this user");
    }

    const tokenArray = Array.from(tokens);

    const message = {
      notification: {
        title: "Order Status Updated",
        body: `Your order #${order.order_id} status is now ${order.status_code}`,
      },
      tokens: tokenArray,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send notification");
  }
};

console.log(userTokens);
