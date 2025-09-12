// Types for Vercel API routes
interface VercelRequest {
  method?: string;
  headers: { [key: string]: string | string[] | undefined };
  body?: any;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  end: () => void;
}
import { getSession } from "./auth";

// Only allow these users to upload
const UPLOAD_WHITELIST = process.env.UPLOAD_WHITELIST?.split(',') || ["dnbmashup1@gmail.com"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Check method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 2. Get logged in user using the auth helper
  const session = await getSession(req);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userEmail = session.user.email;

  // 3. Check if user is in whitelist
  if (!UPLOAD_WHITELIST.includes(userEmail)) {
    return res.status(403).json({ error: "Forbidden: No upload rights" });
  }

  // 4. Handle file upload
  try {
    // Parse multipart form data
    if (!req.body || !req.body.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const file = req.body.file;
    
    // Validate file type
    if (!file.type || !file.type.startsWith('audio/')) {
      return res.status(400).json({ error: "Invalid file type. Only audio files allowed." });
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ error: "File too large. Maximum size is 50MB." });
    }

    // Here you would save the file to your storage (S3, local storage, etc.)
    // For now, we'll return success
    // await saveToStorage(file);

    return res.status(200).json({ 
      success: true, 
      message: "File uploaded successfully!",
      filename: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
