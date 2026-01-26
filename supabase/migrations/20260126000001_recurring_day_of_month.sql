-- Add day_of_month column to recurring_transactions
-- This stores which day of the month the transaction should occur (1-31)
ALTER TABLE public.recurring_transactions
ADD COLUMN IF NOT EXISTS day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31);

-- Update existing rows to extract day from start_date
UPDATE public.recurring_transactions
SET day_of_month = EXTRACT(DAY FROM start_date)
WHERE day_of_month IS NULL;

-- Make it NOT NULL after populating existing data
ALTER TABLE public.recurring_transactions
ALTER COLUMN day_of_month SET NOT NULL;

-- Update the process_recurring_transactions function
-- Now it creates transactions with the correct day of the month
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
  v_transaction_date DATE;
  v_year INTEGER;
  v_month INTEGER;
BEGIN
  -- Get current year and month from process date
  v_year := EXTRACT(YEAR FROM p_process_date);
  v_month := EXTRACT(MONTH FROM p_process_date);

  -- Find all active recurring transactions
  -- We process them based on whether they're due in the current month
  FOR v_recurring IN
    SELECT *
    FROM public.recurring_transactions
    WHERE user_id = p_user_id
      AND active = true
      AND (
        last_processed_date IS NULL
        OR last_processed_date < DATE_TRUNC('month', p_process_date)
      )
  LOOP
    -- Build transaction date using the day_of_month
    -- Handle edge cases where day doesn't exist in month (e.g., Feb 30 -> Feb 28)
    BEGIN
      v_transaction_date := make_date(v_year, v_month, v_recurring.day_of_month);
    EXCEPTION WHEN OTHERS THEN
      -- If day doesn't exist (e.g., Feb 31), use last day of month
      v_transaction_date := (DATE_TRUNC('month', p_process_date) + INTERVAL '1 month - 1 day')::DATE;
    END;

    -- Only process if the transaction date is not in the future
    IF v_transaction_date <= p_process_date THEN
      -- Create the transaction with the correct day of the month
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
        v_transaction_date
      ) RETURNING id INTO v_transaction_id;

      -- Update the recurring transaction
      UPDATE public.recurring_transactions
      SET
        last_processed_date = v_transaction_date,
        next_due_date = calculate_next_due_date(v_transaction_date, v_recurring.frequency),
        updated_at = NOW()
      WHERE id = v_recurring.id;

      -- Return the result
      RETURN QUERY SELECT
        v_recurring.id,
        v_transaction_id,
        v_recurring.description,
        v_recurring.amount;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the getDueCount logic
-- A recurring transaction is "due" if it hasn't been processed this month yet
COMMENT ON COLUMN public.recurring_transactions.day_of_month IS
  'The day of the month (1-31) when this recurring transaction should be processed';
