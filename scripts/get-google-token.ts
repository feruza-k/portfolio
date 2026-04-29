import * as readline from "readline";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";

// Load .env.local so the script works without dotenv-cli
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SCOPE = "https://www.googleapis.com/auth/calendar";
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob"; // Desktop app OOB flow

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Error: Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local first.\n" +
    "Then run: npx dotenv -e .env.local -- npx tsx scripts/get-google-token.ts"
  );
  process.exit(1);
}

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPE)}` +
  `&access_type=offline` +
  `&prompt=consent`;

console.log("\n─────────────────────────────────────────────────");
console.log("Open this URL in your browser and authorise:");
console.log("\n" + authUrl + "\n");
console.log("─────────────────────────────────────────────────\n");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Paste the authorisation code here: ", (code) => {
  rl.close();

  const postData = new URLSearchParams({
    code: code.trim(),
    client_id: CLIENT_ID!,
    client_secret: CLIENT_SECRET!,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  }).toString();

  const options = {
    hostname: "oauth2.googleapis.com",
    path: "/token",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res) => {
    let body = "";
    res.on("data", (chunk: string) => (body += chunk));
    res.on("end", () => {
      const tokens = JSON.parse(body) as {
        access_token?: string;
        refresh_token?: string;
        error?: string;
      };

      if (tokens.error || !tokens.refresh_token) {
        console.error("\nError getting tokens:", tokens);
        process.exit(1);
      }

      console.log("\n─────────────────────────────────────────────────");
      console.log("Success! Add these to your .env.local:\n");
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log("\nOptionally set:");
      console.log("GOOGLE_CALENDAR_ID=primary  # or your calendar's email address");
      console.log("─────────────────────────────────────────────────\n");
    });
  });

  req.on("error", (e: Error) => {
    console.error("Request error:", e.message);
  });

  req.write(postData);
  req.end();
});
