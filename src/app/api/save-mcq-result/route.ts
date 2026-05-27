import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch('http://14.139.187.229:8081/univault/save_mcq_result.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        // Try to parse error from backend, but fallback if it's not JSON
        try {
            const errorJson = JSON.parse(errorText);
            return NextResponse.json({ success: false, message: errorJson.message || 'An error occurred on the backend.' }, { status: response.status });
        } catch {
             return NextResponse.json({ success: false, message: errorText || 'An unknown error occurred.' }, { status: response.status });
        }
    }

    const resultText = await response.text();
    const jsonStartIndex = resultText.indexOf('{');
    if (jsonStartIndex === -1) {
        console.error("No JSON object in save-mcq-result response:", resultText);
        return NextResponse.json({ success: false, message: 'Invalid response from the server.' }, { status: 500 });
    }
    
    const jsonString = resultText.substring(jsonStartIndex);
    const result = JSON.parse(jsonString);

    return NextResponse.json(result, { status: response.status });

  } catch (error: any) {
    console.error('Failed to save MCQ result via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the result saving service.', error: error.message },
      { status: 500 }
    );
  }
}
