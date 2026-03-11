import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const defaultGroqModel = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const systemPrompt = `
You are a flashcard creator. Your task is to generate concise and effective flashcards based on the given topic or content. Please follow these guidelines:

1. Create clear and concise questions for the front of the flashcard.
2. Provide accurate and concise answers for the back of the flashcard.
3. Ensure that each flashcard focuses on a single concept or piece of information.
4. Make the language of the flashcards accessible to a wide range of learners.
5. Incorporate various question types, such as definitions, examples, comparisons, and applications.
6. Avoid overly complex or ambiguous phrasing in both questions and answers.
7. Include essential details or memory aids to help reinforce the information.
8. Adjust the difficulty level of the flashcards to the user's specified preferences.
9. Emphasize and extract the most important and relevant information for the flashcards.

Create a balanced set of flashcards that covers the topic comprehensively. Remember that the goal is to facilitate effective learning and retention of information through these flashcards.

Return in the following JSON format:
{
    "flashcards": [
        {
            "front": "string",
            "back": "string"
        }
    ]
}
`;

export async function POST(req) {
    try {
        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: 'Missing GROQ_API_KEY. Add it to your .env.local file and restart the dev server.' },
                { status: 500 }
            );
        }

        const { text } = await req.json();

        if (!text || !text.trim()) {
            return NextResponse.json(
                { error: 'Please provide text to generate flashcards.' },
                { status: 400 }
            );
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
            ],
            model: defaultGroqModel,
            response_format: { type: 'json_object' }, 
        });

        const content = completion.choices[0].message.content;

        let flashcards;
        try {
            flashcards = JSON.parse(content);
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            throw new Error('Failed to parse JSON response');
        }

        if (!flashcards.flashcards || !Array.isArray(flashcards.flashcards)) {
            throw new Error('Invalid response format');
        }

        return NextResponse.json(flashcards);
    } catch (error) {
        console.error('Error generating flashcards:', error);
        return NextResponse.json(
            { error: error.message || 'An error occurred while generating flashcards. Please try again.' },
            { status: 500 }
        );
    }
}
