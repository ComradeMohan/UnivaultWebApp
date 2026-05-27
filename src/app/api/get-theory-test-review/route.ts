import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testResultId = searchParams.get('test_result_id');

  if (!testResultId) {
    return NextResponse.json(
      { success: false, message: 'Test Result ID is required.' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`http://14.139.187.229:8081/univault/get_theory_review.php?test_result_id=${testResultId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch theory test review via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the test review service.', error: error.message },
      { status: 500 }
    );
  }
}
