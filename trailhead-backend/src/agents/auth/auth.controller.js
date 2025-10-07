import { registerUserService, loginUserService } from "./auth.service.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const user = await registerUserService(username, email, password);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Register Error:", error);

    // Password checklist error
    if (error.type === "password_validation") {
      return res.status(400).json({
        message: "Password does not meet the requirements",
        checklist: error.details,
      });
    }

    // Handle MongoDB duplicate key errors (more reliable)
    if (error.name === "MongoServerError" && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } already in use`,
      });
    }

    // Fallback for any other error
    res.status(400).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const data = await loginUserService(email, password);
    res.status(200).json(data);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
