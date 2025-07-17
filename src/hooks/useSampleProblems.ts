
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SampleProblem {
  id: number;
  problem: string;
}

export const useSampleProblems = () => {
  const [sampleProblems, setSampleProblems] = useState<SampleProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSampleProblems = async () => {
      try {
        setLoading(true);
        console.log('Fetching sample problems...');
        
        const { data, error } = await supabase
          .from('Sample Problems')
          .select('*')
          .order('id');

        console.log('Sample problems data:', data);
        console.log('Sample problems error:', error);

        if (error) {
          throw error;
        }

        // Map the data to our interface
        const problems: SampleProblem[] = data?.map((item: any, index: number) => ({
          id: item.id || index + 1,
          problem: item['Sample Problems'] || item.problem || 'Unknown problem'
        })) || [];

        console.log('Mapped problems:', problems);
        setSampleProblems(problems);
      } catch (err) {
        console.error('Error fetching sample problems:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch sample problems');
      } finally {
        setLoading(false);
      }
    };

    fetchSampleProblems();
  }, []);

  return { sampleProblems, loading, error };
};
