const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(bodyParser.json());
const cors = require("cors");
app.use(cors());
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 18, max: 65 },
  selectedBatch: { type: String, required: true, enum: ["6-7AM", "7-8AM", "8-9AM", "5-6PM"] },
  phoneNumber: { type: String, required: true, unique: true, trim: true, match: /^\d{10}$/ },
  enrollmentDates: { type: [Date], default: [] },
});

const NewUser = mongoose.model("NewUser", UserSchema);

async function CompletePayment(userId, amount, description) {
  console.log(`Processing payment for user ${userId} - ${description}: ₹${amount}`);

  const randomSuccess = Math.random() < 0.8;

  if (randomSuccess) {
    console.log(`Payment for user ${userId} successful.`);
    return true;
  } else {
    console.log(`Payment for user ${userId} failed.`);
    return false;
  }
}

// Enroll user API
app.post("/api/yoga-enroll", async (req, res) => {
  const { name, age, selectedBatch, phoneNumber } = req.body;

  // Validate user data
  if (
    !name ||
    !age ||
    !selectedBatch ||
    !phoneNumber ||
    age < 18 ||
    age > 65 ||
    !["6-7AM", "7-8AM", "8-9AM", "5-6PM"].includes(selectedBatch) ||
    !/^\d{10}$/.test(phoneNumber)
  ) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  try {
    // Check if the user with the given phone number already exists
    const existingUser = await NewUser.findOne({ phoneNumber });

    if (existingUser) {
      return res.status(409).json( "User with this phone number already exists");
    }

    // Create new user
    const newUser = new NewUser({
      name,
      age,
      selectedBatch,
      phoneNumber,
      enrollmentDates: [currentDate],
    });

    try {
      await newUser.save();
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }

    // Mock payment call
    const success = await CompletePayment(newUser._id, 500, "Yoga Monthly Fee");

    if (!success) {
      await NewUser.deleteOne({ _id: newUser._id }); // Rollback user creation on payment failure
      return res.status(500).json({ error: "Payment failed" });
    }

    return res.json({
      success: true,
      user: {
        id: newUser._id,
        name,
        age,
        selectedBatch,
        phoneNumber,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
