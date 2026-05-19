import path from "path";
import dotenv from "dotenv";

const __dirname = path.resolve();

// explicitly load from backend root
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("ENV loaded from", path.join(__dirname, ".env"));
