import OpenAI from "https://deno.land/x/openai@v4.69.0/mod.ts";

type InferenceReturnProps = {
    experienceRequired: string;
    jobDesc: string;
    skillsRequired: string[]; 
    skillsPreferred: string[]; 
    salaryRange: string;
    remote: boolean;
}

export default async function getJobDetails(apiKey: string, description: string): Promise<InferenceReturnProps | null> {
    try {
        // Initialize the OpenAI object
        const openai = new OpenAI({ apiKey: apiKey });
        
        // Prepare your prompt 
        const prompt = `
        Analyze this job description and extract the following information in JSON format:
        
        {
          "skillsRequired": ["python", "React"],
          "skillsPreferred": ["GPU experience", "hugging face"],
          "experienceRequired": "1yrs|0-3yrs",
          "salaryRange": "50k-70k",
          "remote": true,
          "jobDesc": "Brief 2-3 sentence job description of the role and what I will need to learn"
        }
        
        Job Description:
        ${description}
        
        Return only valid JSON without any additional text.
        `;
        
        // Send the data to OpenAI to get relevant data
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: 'system',
                    content: 'You are a job analysis expert. Extract structured information from job descriptions and return only valid JSON.'
                },
                { 
                    role: 'user', 
                    content: prompt 
                }
            ],
            stream: false,
            max_tokens: 1000,
            temperature: 0.1
        });

        const content = response.choices[0]?.message?.content;
        
        if (!content) {
            throw new Error('No content returned from OpenAI');
        }

        // Parse and return the JSON response
        return JSON.parse(content.trim());
        
    } catch (error) {
        console.error('OpenAI inference failed:', error);
        return null; 
    }
}