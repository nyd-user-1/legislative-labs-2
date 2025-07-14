
-- Create a table to store problem chats and their states
CREATE TABLE public.problem_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  problem_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  current_state TEXT NOT NULL DEFAULT 'Problem Identified',
  chat_session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_current_state CHECK (current_state IN ('Problem Identified', 'Policy Development', 'Policy Submission', 'Public Gallery'))
);

-- Enable Row Level Security
ALTER TABLE public.problem_chats ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own problem chats" 
ON public.problem_chats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own problem chats" 
ON public.problem_chats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own problem chats" 
ON public.problem_chats 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own problem chats" 
ON public.problem_chats 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to generate sequential problem numbers
CREATE OR REPLACE FUNCTION generate_problem_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  problem_number TEXT;
BEGIN
  -- Get the next sequential number
  SELECT COALESCE(
    (SELECT MAX(CAST(SUBSTRING(problem_number FROM 2) AS INTEGER)) + 1 
     FROM problem_chats 
     WHERE problem_number ~ '^P[0-9]+$'), 
    1
  ) INTO next_number;
  
  -- Format as P00001, P00002, etc.
  problem_number := 'P' || LPAD(next_number::TEXT, 5, '0');
  
  RETURN problem_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_problem_chats_updated_at
BEFORE UPDATE ON public.problem_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key reference to chat_sessions for linking
ALTER TABLE public.problem_chats 
ADD CONSTRAINT fk_problem_chats_chat_session 
FOREIGN KEY (chat_session_id) REFERENCES public.chat_sessions(id) ON DELETE SET NULL;
