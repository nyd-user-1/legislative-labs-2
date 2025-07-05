import { supabase } from '@/integrations/supabase/client';

export const generateProblemFromScenario = async (scenario: string): Promise<string> => {
  try {
    const prompt = `Based on this real-life scenario, generate a clear and structured problem statement that identifies the legislative issue:

Scenario: ${scenario}

Please provide a problem statement that:
1. Clearly identifies the core issue
2. Explains the impact on affected parties
3. Describes why current laws/regulations are insufficient
4. Justifies the need for legislative action
5. Is written in professional policy language

Keep it concise but comprehensive (2-3 paragraphs maximum).`;

    const { data, error } = await supabase.functions.invoke('generate-with-openai', {
      body: { prompt, type: 'problem' }
    });

    if (error) {
      console.error('Error calling OpenAI function:', error);
      throw new Error('Failed to generate problem statement');
    }

    return data.generatedText || 'Unable to generate problem statement. Please try again.';
  } catch (error) {
    console.error('Error generating problem statement:', error);
    throw new Error('Failed to generate problem statement. Please check your connection and try again.');
  }
};