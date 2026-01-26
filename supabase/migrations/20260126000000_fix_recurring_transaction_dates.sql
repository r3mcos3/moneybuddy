-- Update the process_recurring_transactions function to use the next_due_date
-- as the transaction date instead of the processing date
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
    -- Create the transaction with the due date (not the processing date)
    -- This ensures the transaction date matches when it was supposed to happen
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
      v_recurring.next_due_date  -- Changed from p_process_date to v_recurring.next_due_date
    ) RETURNING id INTO v_transaction_id;

    -- Update the recurring transaction
    -- Use the due date (not processing date) to calculate the next occurrence
    UPDATE public.recurring_transactions
    SET
      last_processed_date = v_recurring.next_due_date,
      next_due_date = calculate_next_due_date(v_recurring.next_due_date, v_recurring.frequency),
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
