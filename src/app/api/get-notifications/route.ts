import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const college = searchParams.get('college');

  if (!college) {
    return NextResponse.json(
      { success: false, message: 'College name is required.' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`http://14.139.187.229:8081/univault/fetch_notices.php?college=${encodeURIComponent(college)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch notices via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the notification service.', error: error.message },
      { status: 500 }
    );
  }
}
