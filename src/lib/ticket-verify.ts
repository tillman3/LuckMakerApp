/**
 * AI-powered ticket photo verification using Claude Vision API.
 * Verifies that an uploaded image is a legitimate lottery ticket
 * and extracts relevant data (game, numbers, draw date).
 */

interface VerificationResult {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  extractedData: {
    game?: string;
    numbers?: string;
    bonusNumber?: string;
    drawDate?: string;
    ticketCost?: number;
    multiplier?: string;
  };
  issues: string[];
  summary: string;
}

export async function verifyTicketPhoto(base64Image: string, expectedGame?: string, expectedDate?: string): Promise<VerificationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.warn('No ANTHROPIC_API_KEY — skipping AI verification');
    return {
      isValid: true,
      confidence: 'low',
      extractedData: {},
      issues: ['AI verification unavailable — manual review recommended'],
      summary: 'Photo accepted without AI verification (API key not configured)',
    };
  }

  // Strip data URL prefix if present
  const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const mediaType = base64Image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageData,
                },
              },
              {
                type: 'text',
                text: `Analyze this image as a lottery ticket verification system. Respond ONLY with valid JSON (no markdown, no code blocks).

Verify:
1. Is this a photo of an actual lottery ticket (not a screenshot, edited image, or random photo)?
2. Can you read the game name, numbers, and draw date?
3. Does the ticket appear legitimate (proper formatting, retailer info, barcode)?
${expectedGame ? `4. Expected game: ${expectedGame}` : ''}
${expectedDate ? `5. Expected draw date: ${expectedDate}` : ''}

Respond with this exact JSON structure:
{
  "isValid": true/false,
  "confidence": "high"/"medium"/"low",
  "extractedData": {
    "game": "game name or null",
    "numbers": "comma-separated main numbers or null",
    "bonusNumber": "bonus/powerball number or null",
    "drawDate": "YYYY-MM-DD or null",
    "ticketCost": dollar amount or null,
    "multiplier": "multiplier text or null"
  },
  "issues": ["list of any problems found"],
  "summary": "one sentence summary"
}

Be strict: if it's not clearly a real lottery ticket photo, mark isValid as false.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Claude API error:', response.status, errText);
      return {
        isValid: true,
        confidence: 'low',
        extractedData: {},
        issues: ['AI verification failed — photo accepted with manual review recommended'],
        summary: 'Verification service temporarily unavailable',
      };
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    
    // Parse JSON from response (handle possible markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        isValid: true,
        confidence: 'low',
        extractedData: {},
        issues: ['Could not parse AI response'],
        summary: 'Photo accepted — AI response was unclear',
      };
    }

    const result: VerificationResult = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error: any) {
    console.error('Ticket verification error:', error.message);
    return {
      isValid: true,
      confidence: 'low',
      extractedData: {},
      issues: [`Verification error: ${error.message}`],
      summary: 'Photo accepted with low confidence due to verification error',
    };
  }
}
