
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
        const { data, error } = await supabase
          .from('Sample Problems')
          .select('*')
          .order('id');

        if (error) {
          throw error;
        }

        // Map the data to our interface
        const problems: SampleProblem[] = data?.map((item: any) => ({
          id: item.id,
          problem: item['Sample Problems']
        })) || [];

        setSampleProblems(problems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sample problems');
      } finally {
        setLoading(false);
      }
    };

    fetchSampleProblems();
  }, []);

  return { sampleProblems, loading, error };
};
