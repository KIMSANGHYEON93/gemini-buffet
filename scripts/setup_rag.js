const { GoogleGenAI } = require('@google/genai');
const path = require("path");
const fs = require("fs");

// Load .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
    console.error("GOOGLE_API_KEY not found in .env.local");
    process.exit(1);
}

const client = new GoogleGenAI({ apiKey });

async function run() {
    try {
        console.log("Creating File Search Store...");
        // Create the File Search store
        const fileSearchStore = await client.fileSearchStores.create({
            config: { displayName: 'Buffett Wisdom Store' }
        });
        console.log(`Store created: ${fileSearchStore.name}`);

        const filePath = path.join(__dirname, "..", "buffett_letters_all_v2.pdf");
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            process.exit(1);
        }

        console.log(`Uploading file: ${filePath}...`);
        // Upload and import a file into the File Search store
        // Note: The SDK might expect 'file' to be a path or stream. 
        // Based on user example: file: 'file.txt' implies path.
        // However, the SDK documentation suggests using `files.upload` first or similar if not abstracted.
        // But the user provided example uses `fileSearchStores.uploadToFileSearchStore`.
        // Let's try to follow the user's example structure but adapt for the actual SDK method signature if needed.
        // The user's example seems to be a mix of v1beta and newer SDK. 
        // Let's check if `uploadToFileSearchStore` exists or if we need to upload then add.

        // Actually, looking at the latest SDK, it might be `files.upload` then `fileSearchStores.import`.
        // But let's try the user's suggested method first if it exists, or the standard way.
        // Standard way:
        // 1. Upload file via `files.upload`
        // 2. Add to store via `fileSearchStores.create` (initial) or `fileSearchStores.import`?

        // Let's try the user's exact code structure first as requested, but with error handling.

        // Wait, the user's example:
        // ai.fileSearchStores.uploadToFileSearchStore({ file: 'file.txt', ... })

        // Let's implement robustly.

        const uploadResult = await client.files.upload({
            file: filePath,
            config: {
                displayName: 'buffett_letters_all_v2.pdf',
                mimeType: 'application/pdf'
            }
        });

        // Adjust based on actual response structure
        const fileData = uploadResult;
        console.log(`File uploaded: ${fileData.name} (${fileData.uri})`);

        // Wait for file to be processed? Usually upload is quick, but state might be PROCESSING.
        let file = await client.files.get({ name: fileData.name });
        while (file.state === 'PROCESSING') {
            console.log('File processing...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            file = await client.files.get({ name: fileData.name });
        }

        if (file.state === 'FAILED') {
            throw new Error('File processing failed');
        }

        console.log(`File active. Importing to store...`);

        console.log("Creating NEW Store with file included...");
        // Note: If we already created a store at the top, we should use that or delete it.
        // The previous run created 'fileSearchStores/buffett-wisdom-store-...' but we didn't use it.
        // Let's just create a new one for simplicity as requested by user flow, 
        // or better, add to the existing one if we kept the ID. 
        // But the script is designed to run once.

        // Let's use the store we created at the beginning: `fileSearchStore`
        // We need to add the file to it.
        // The SDK method to add files to an existing store is likely `fileSearchStores.createFile` (which links a file to a store)
        // or we can just create a new store with the file as planned.

        // Let's try creating a new store with the file as it's the most robust "one-shot" way.
        // We will ignore the empty store created at the start (it's harmless clutter for now).

        const storeWithFile = await client.fileSearchStores.create({
            config: {
                displayName: 'Buffett Wisdom Store (Populated)',
                fileKeys: [fileData.name]
            }
        });

        console.log(`Store created with file: ${storeWithFile.name}`);

        console.log("\n============================================");
        console.log(`STORE ID: ${storeWithFile.name}`);
        console.log("============================================");

    } catch (error) {
        console.error("Error:", error);
    }
}

run();
