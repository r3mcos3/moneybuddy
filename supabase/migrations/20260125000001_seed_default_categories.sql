-- This migration adds a function to create default categories for new users
-- The function will be called automatically when a user profile is created

CREATE OR REPLACE FUNCTION public.create_default_categories(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Default expense categories
    INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
    (p_user_id, 'Groceries', 'expense', '#10b981', '🛒'),
    (p_user_id, 'Restaurants', 'expense', '#f59e0b', '🍽️'),
    (p_user_id, 'Transportation', 'expense', '#3b82f6', '🚗'),
    (p_user_id, 'Shopping', 'expense', '#ec4899', '🛍️'),
    (p_user_id, 'Entertainment', 'expense', '#8b5cf6', '🎬'),
    (p_user_id, 'Utilities', 'expense', '#ef4444', '⚡'),
    (p_user_id, 'Housing', 'expense', '#6366f1', '🏠'),
    (p_user_id, 'Healthcare', 'expense', '#14b8a6', '🏥'),
    (p_user_id, 'Insurance', 'expense', '#0ea5e9', '🛡️'),
    (p_user_id, 'Other', 'expense', '#64748b', '📦');

    -- Default income categories
    INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
    (p_user_id, 'Salary', 'income', '#22c55e', '💰'),
    (p_user_id, 'Freelance', 'income', '#84cc16', '💼'),
    (p_user_id, 'Investments', 'income', '#06b6d4', '📈'),
    (p_user_id, 'Other Income', 'income', '#10b981', '💵');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to also create default categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);

    -- Create default categories
    PERFORM create_default_categories(NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
