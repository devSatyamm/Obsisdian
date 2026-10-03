import { NextRequest, NextResponse } from 'next/server';
import { registerNewUser } from '@/lib/auth/userAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required.' },
        { status: 400 }
      );
    }

    const regResult = await registerNewUser(email, password, fullName);

    if (!regResult.success || !regResult.user || !regResult.token) {
      return NextResponse.json(
        { error: regResult.error || 'Registration failed.' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: regResult.user,
      token: regResult.token
    });

    response.cookies.set('verity_session', regResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Registration failed.' },
      { status: 500 }
    );
  }
}
