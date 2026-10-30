import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const url = process.env.CLOUDINARY_URL;

console.log("Checking Cloudinary configuration...");

if (url) {
  console.log("✓ Found CLOUDINARY_URL");
  cloudinary.config();
} else if (cloudName && apiKey && apiSecret) {
  console.log(`✓ Found Cloud Name: ${cloudName}`);
  console.log(`✓ Found API Key: ${apiKey.slice(0, 4)}****`);
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
} else {
  console.error("\n❌ Cloudinary credentials are NOT configured in .env.local!");
  console.error("Please add the following to .env.local:");
  console.error("CLOUDINARY_CLOUD_NAME=your_cloud_name");
  console.error("CLOUDINARY_API_KEY=your_api_key");
  console.error("CLOUDINARY_API_SECRET=your_api_secret\n");
  process.exit(1);
}

try {
  console.log("\nPinging Cloudinary API...");
  const ping = await cloudinary.api.ping();
  console.log("✓ Ping response:", ping);

  console.log("\nUploading test asset...");
  // 1x1 transparent GIF base64
  const testBase64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  const result = await cloudinary.uploader.upload(testBase64, {
    folder: "goldenfalcone/test",
    public_id: `test_${Date.now()}`,
  });
  console.log("✓ Test asset uploaded successfully!");
  console.log("  URL:", result.secure_url);
  console.log("  Public ID:", result.public_id);

  console.log("\nCleaning up test asset...");
  await cloudinary.uploader.destroy(result.public_id);
  console.log("✓ Test asset deleted.");

  console.log("\n🎉 Cloudinary is connected and functioning properly!");
} catch (err) {
  console.error("\n❌ Cloudinary error:", err.message || err);
  process.exit(1);
}
