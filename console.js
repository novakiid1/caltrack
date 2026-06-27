// console.js
import repl from 'repl';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose'; // Core ODM driver

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to dynamically import all JS files in a folder
async function loadDirectory(dirName) {
  const targetDir = path.join(__dirname, dirName);
  const collection = {};

  if (!fs.existsSync(targetDir)) return collection;

  const files = fs.readdirSync(targetDir);

  for (const file of files) {
    if (file.endsWith('.js') && file !== 'index.js') {
      const moduleName = path.basename(file, '.js');
      const filePath = path.join(targetDir, file);
      
      const fileUrl = `file://${filePath}`; 
      const imported = await import(fileUrl);
      
      collection[moduleName] = imported.default || imported;
    }
  }

  return collection;
}

async function bootConsole() {
  console.log("⚡ Booting MVC Application Environment...");

  try {
    // 1. Establish Mongo connection first (Mirroring index.js)
    const mongodbUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/caltrack";
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongodbUrl);
    console.log("📁 Database connected successfully.");
    
    // 2. Load models now that mongoose is initialized
    console.log("🔍 Auto-loading application layers...");
    const models = await loadDirectory('models');
    const controllers = await loadDirectory('controllers');

    console.log(`✅ Loaded ${Object.keys(models).length} models and ${Object.keys(controllers).length} controllers.`);
    console.log("🚀 Launching REPL session... (Type '.exit' to quit)");

    // 3. Start REPL
    const replServer = repl.start({
      prompt: 'caltrack > ',
      useGlobal: true
    });

    // Make mongoose available globally in console
    replServer.context.mongoose = mongoose;

    // Flatten modules into root context
    Object.keys(models).forEach(key => {
      replServer.context[key] = models[key];
    });

    Object.keys(controllers).forEach(key => {
      replServer.context[key] = controllers[key];
    });

    // Clean disconnect on console exit
    replServer.on('exit', () => {
      mongoose.disconnect();
      console.log('\n👋 Closed DB connection. Goodbye!');
    });

  } catch (err) {
    console.error("❌ Failed to load environment:", err);
    process.exit(1);
  }
}

bootConsole();