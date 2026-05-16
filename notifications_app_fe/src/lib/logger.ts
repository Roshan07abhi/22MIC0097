const LOG_URL = "http://4.224.186.213/evaluation-service/logs";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyb3NoYW5hYmhpc2hlay5wMjAyMkB2aXRzdHVkZW50LmFjLmluIiwiZXhwIjoxNzc4OTM0MTMxLCJpYXQiOjE3Nzg5MzMyMzEsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI1MDE4YWJhOC05YWMxLTQ2OGUtOTNhZi0wNTY0YmE1NWI5ZGIiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJyb3NoYW4gYWJoaXNoZWsgcCIsInN1YiI6ImFlNWYzYjIxLTFhY2EtNDNkNC1hYmFjLWUyOWI3ZGQzODAwMSJ9LCJlbWFpbCI6InJvc2hhbmFiaGlzaGVrLnAyMDIyQHZpdHN0dWRlbnQuYWMuaW4iLCJuYW1lIjoicm9zaGFuIGFiaGlzaGVrIHAiLCJyb2xsTm8iOiIyMm1pYzAwOTciLCJhY2Nlc3NDb2RlIjoiU2ZGdVdnIiwiY2xpZW50SUQiOiJhZTVmM2IyMS0xYWNhLTQzZDQtYWJhYy1lMjliN2RkMzgwMDEiLCJjbGllbnRTZWNyZXQiOiJWZFRqQ3BUdHN4TllYWkVQIn0.HiuSChaDARaNlYQMvzU8cuq2qYnTBNAZSDeGByH9w6M";

type Stack = "frontend" | "backend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type Pkg = "api" | "component" | "hook" | "utils" | "page";

export async function Log(stack: Stack, level: Level, pkg: Pkg, message: string) {
  console.log(`[${level.toUpperCase()}] [${stack}:${pkg}] ${message}`);

  let msg = message.trim();
  if (msg.length < 5) msg = msg.padEnd(5);
  if (msg.length > 48) msg = msg.slice(0, 48);

  try {
    await fetch(LOG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message: msg }),
    });
  } catch {
    // don't let logging break the app
  }
}
