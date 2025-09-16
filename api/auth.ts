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

// Simple session storage (in production, use Redis or database)
const sessions = new Map<string, { email: string; role: string; expires: number }>();

export function getSession(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  const token = authHeader.substring(7);
  if (!token) return null;

  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) {
    sessions.delete(token);
    return null;
  }

  return { user: { email: session.email, role: session.role } };
}

export function createSession(email: string, role: string) {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  sessions.set(token, { email, role, expires });
  
  return token;
}

export function clearSession(token: string) {
  sessions.delete(token);
}

// Login endpoint
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // Login
    const { email, password } = req.body;
    
    // Simple authentication (replace with proper auth system)
    const authorizedEmail = process.env.AUTHORIZED_EMAIL || "dnbmashup1@gmail.com";
    const authorizedPassword = process.env.AUTHORIZED_PASSWORD || "DnB2024!Secure";
    
    if (email === authorizedEmail && password === authorizedPassword) {
      const token = createSession(email, "agency");
      return res.status(200).json({ 
        success: true, 
        token, 
        user: { email, role: "agency" } 
      });
    }
    
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  if (req.method === 'DELETE') {
    // Logout
    const authHeader = req.headers.authorization;
    if (authHeader && typeof authHeader === 'string') {
      const token = authHeader.substring(7);
      if (token) {
        clearSession(token);
      }
    }
    return res.status(200).json({ success: true });
  }
  
  return res.status(405).json({ error: "Method Not Allowed" });
}
