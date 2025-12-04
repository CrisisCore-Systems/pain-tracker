import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/hashnode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const result = await subscribeToNewsletter(email);

    if (result.success) {
      return NextResponse.json({
        success: true,
        status: result.status,
        message:
          result.status === 'PENDING'
            ? 'Please check your email to confirm your subscription!'
            : 'You are now subscribed!',
      });
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
