// src/app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logout successful' });
  response.cookies.set('session', '', { httpOnly: true, path: '/', expires: new Date(0) });
  return response;
}