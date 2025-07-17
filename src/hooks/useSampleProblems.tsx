
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SampleProblem {
  text: string;
}

export const useSampleProblems = () => {
  const [problems, setProblems] = useState<SampleProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSampleProblems = async () => {
      try {
        console.log('Fetching sample problems...');
        
        // Try to get the table schema first
        const { data: schemaData, error: schemaError } = await supabase
          .from('Sample Problems')
          .select('*')
          .limit(1);

        console.log('Schema check - data:', schemaData);
        console.log('Schema check - error:', schemaError);

        // Now get all the data
        const { data, error } = await supabase
          .from('Sample Problems')
          .select('*');

        console.log('Sample problems raw data:', data);
        console.log('Sample problems error:', error);

        if (error) {
          console.error('Error fetching sample problems:', error);
          setError(error.message);
        } else if (data && data.length > 0) {
          console.log('First item structure:', data[0]);
          console.log('Available keys:', Object.keys(data[0]));
          
          // Map the data to handle the column name properly
          const mappedProblems = data.map((item: any) => {
            // Try different possible column names
            const text = item['Sample Problems'] || 
                        item['sample_problems'] || 
                        item.text || 
                        item.problem ||
                        Object.values(item)[0] || 
                        'Unknown problem';
            
            console.log('Mapping item:', item, 'to text:', text);
            
            return {
              text: text
            };
          }).filter(problem => problem.text && problem.text !== 'Unknown problem');
          
          console.log('Mapped problems:', mappedProblems);
          setProblems(mappedProblems);
        } else {
          console.log('No data found in Sample Problems table');
          setProblems([]);
        }
      } catch (err) {
        console.error('Error fetching sample problems:', err);
        setError('Failed to fetch sample problems');
      } finally {
        setLoading(false);
      }
    };

    fetchSampleProblems();
  }, []);

  return { problems, loading, error };
};
