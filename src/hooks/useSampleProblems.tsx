
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
        
        const { data, error } = await supabase
          .from('Sample Problems')
          .select('*')
          .order('Sample Problems', { ascending: true });

        console.log('Sample problems data:', data);
        console.log('Sample problems error:', error);

        if (error) {
          console.error('Error fetching sample problems:', error);
          setError(error.message);
        } else {
          // Map the data to handle the column name properly
          const mappedProblems = data?.map((item: any) => ({
            text: item['Sample Problems'] || item.text || Object.values(item)[0] || ''
          })) || [];
          
          setProblems(mappedProblems);
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
