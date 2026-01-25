-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_default_categories(UUID);

-- Recreate simplified version that won't fail
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create profile, don't create categories yet
    -- This prevents the trigger from failing
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the signup
        RAISE WARNING 'Error creating profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to manually create default categories (call this separately)
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
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error creating default categories: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
