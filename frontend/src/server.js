const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://Kaif2:Kaif2@cluster0.ml22r8k.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error(err));

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 18, max: 65 },
  selectedBatch: { type: String, required: true, enum: ["6-7AM", "7-8AM", "8-9AM", "5-6PM"] },
  enrollmentDates: { type: [Date], default: [] },
});

const NewUser = mongoose.model("NewUser", UserSchema);

// Enroll user API
app.post("/api/yoga-enroll", async (req, res) => {
  const { name, age, selectedBatch } = req.body;

  // Validate user data
  if (!name || !age || !selectedBatch ||
      age < 18 || age > 65 ||
      !["6-7AM", "7-8AM", "8-9AM", "5-6PM"].includes(selectedBatch)) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if already enrolled in current month
  const existingUser = await NewUser.findOne({
    enrollmentDates: { $elemMatch: { $eq: currentDate } },
  });

  if (existingUser) {
    return res.status(400).json({ error: "Already enrolled for this month" });
  }

  // Create new user
  const newUser = new NewUser({ name, age, selectedBatch, enrollmentDates: [currentDate] });

  try {
    await newUser.save();

    // Mock payment call
    const success = await CompletePayment(newUser._id, 500, "Yoga Monthly Fee");

    if (!success) {
      await NewUser.deleteOne({ _id: newUser._id }); // Rollback user creation on payment failure
      return res.status(500).json({ error: "Payment failed" });
    }

    return res.json({ success: true, user: { id: newUser._id, name, age, selectedBatch } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => console.log("Server listening on port 3000"));
