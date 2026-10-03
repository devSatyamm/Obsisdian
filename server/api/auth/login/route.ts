import { NextRequest, NextResponse } from 'next/server';
import { authenticateCredentials } from '@/lib/auth/userAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const authResult = await authenticateCredentials(email, password);

    if (!authResult.success || !authResult.user || !authResult.token) {
      return NextResponse.json(
        { error: authResult.error || 'Invalid credentials.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      token: authResult.token
    });

    // Set secure HTTP-only session cookie
    response.cookies.set('verity_session', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Authentication failed.' },
      { status: 500 }
    );
  }
}
