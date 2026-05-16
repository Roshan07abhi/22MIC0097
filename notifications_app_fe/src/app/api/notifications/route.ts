import { NextRequest, NextResponse } from "next/server";

const API_BASE = "http://4.224.186.213/evaluation-service/notifications";
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyb3NoYW5hYmhpc2hlay5wMjAyMkB2aXRzdHVkZW50LmFjLmluIiwiZXhwIjoxNzc4OTM0MTMxLCJpYXQiOjE3Nzg5MzMyMzEsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI1MDE4YWJhOC05YWMxLTQ2OGUtOTNhZi0wNTY0YmE1NWI5ZGIiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJyb3NoYW4gYWJoaXNoZWsgcCIsInN1YiI6ImFlNWYzYjIxLTFhY2EtNDNkNC1hYmFjLWUyOWI3ZGQzODAwMSJ9LCJlbWFpbCI6InJvc2hhbmFiaGlzaGVrLnAyMDIyQHZpdHN0dWRlbnQuYWMuaW4iLCJuYW1lIjoicm9zaGFuIGFiaGlzaGVrIHAiLCJyb2xsTm8iOiIyMm1pYzAwOTciLCJhY2Nlc3NDb2RlIjoiU2ZGdVdnIiwiY2xpZW50SUQiOiJhZTVmM2IyMS0xYWNhLTQzZDQtYWJhYy1lMjliN2RkMzgwMDEiLCJjbGllbnRTZWNyZXQiOiJWZFRqQ3BUdHN4TllYWkVQIn0.HiuSChaDARaNlYQMvzU8cuq2qYnTBNAZSDeGByH9w6M";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("notification_type");
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");

    const limit = limitParam ? parseInt(limitParam) : 10;
    const page = pageParam ? parseInt(pageParam) : 1;

    const params = new URLSearchParams();
    if (type) params.set("notification_type", type);
    params.set("limit", String(limit));
    params.set("page", String(page));

    const url = `${API_BASE}?${params.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    const notifications = data.notifications ?? [];

    // API doesn't return total count so we check if this page has items
    // to determine hasMore for the frontend
    return NextResponse.json({
      notifications,
      page,
      limit,
      hasMore: notifications.length === limit,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
