-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'every_4_weeks', 'monthly', 'yearly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_processed_date DATE,
  next_due_date DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own recurring transactions"
  ON public.recurring_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring transactions"
  ON public.recurring_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions"
  ON public.recurring_transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions"
  ON public.recurring_transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated at trigger
CREATE TRIGGER set_recurring_transactions_updated_at
  BEFORE UPDATE ON public.recurring_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to calculate next due date
CREATE OR REPLACE FUNCTION calculate_next_due_date(
  p_current_date DATE,
  p_frequency TEXT
) RETURNS DATE AS $$
BEGIN
  CASE p_frequency
    WHEN 'weekly' THEN
      RETURN p_current_date + INTERVAL '7 days';
    WHEN 'every_4_weeks' THEN
      RETURN p_current_date + INTERVAL '28 days';
    WHEN 'monthly' THEN
      RETURN p_current_date + INTERVAL '1 month';
    WHEN 'yearly' THEN
      RETURN p_current_date + INTERVAL '1 year';
    ELSE
      RETURN p_current_date + INTERVAL '1 month';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to process recurring transactions
CREATE OR REPLACE FUNCTION process_recurring_transactions(
  p_user_id UUID,
  p_process_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
  recurring_id UUID,
  transaction_id UUID,
  description TEXT,
  amount DECIMAL
) AS $$
DECLARE
  v_recurring RECORD;
  v_transaction_id UUID;
BEGIN
  -- Find all active recurring transactions that are due
  FOR v_recurring IN
    SELECT *
    FROM public.recurring_transactions
    WHERE user_id = p_user_id
      AND active = true
      AND next_due_date <= p_process_date
  LOOP
    -- Create the transaction
    INSERT INTO public.transactions (
      user_id,
      account_id,
      category_id,
      description,
      amount,
      transaction_date
    ) VALUES (
      v_recurring.user_id,
      v_recurring.account_id,
      v_recurring.category_id,
      v_recurring.description,
      v_recurring.amount,
      p_process_date
    ) RETURNING id INTO v_transaction_id;

    -- Update the recurring transaction
    UPDATE public.recurring_transactions
    SET
      last_processed_date = p_process_date,
      next_due_date = calculate_next_due_date(p_process_date, v_recurring.frequency),
      updated_at = NOW()
    WHERE id = v_recurring.id;

    -- Return the result
    RETURN QUERY SELECT
      v_recurring.id,
      v_transaction_id,
      v_recurring.description,
      v_recurring.amount;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add more expense categories for fixed costs
-- Note: These will be added for the current user running the migration
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the current user ID (or you can manually set this)
  -- For now, we'll add categories for all existing users
  FOR v_user_id IN SELECT id FROM auth.users LOOP
    INSERT INTO public.categories (user_id, name, type, icon, color)
    VALUES
      (v_user_id, 'Huur', 'expense', '🏠', '#8B4513'),
      (v_user_id, 'Energie', 'expense', '⚡', '#FFD700'),
      (v_user_id, 'Internet & TV', 'expense', '📡', '#4169E1'),
      (v_user_id, 'Verzekeringen', 'expense', '🛡️', '#2E8B57'),
      (v_user_id, 'Abonnementen', 'expense', '📱', '#9370DB'),
      (v_user_id, 'Brandstof', 'expense', '⛽', '#FF4500'),
      (v_user_id, 'Boodschappen', 'expense', '🛒', '#32CD32')
    ON CONFLICT (user_id, name) DO NOTHING;
  END LOOP;
END $$;
