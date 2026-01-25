-- First, delete any duplicate Dutch categories that were added by migration 003
-- Keep only the English originals for now
DELETE FROM public.categories
WHERE name IN ('Huur', 'Energie', 'Internet & TV', 'Verzekeringen', 'Abonnementen', 'Brandstof', 'Boodschappen')
AND user_id IN (
  SELECT user_id FROM public.categories WHERE name IN ('Groceries', 'Housing', 'Utilities', 'Insurance', 'Other')
);

-- Now update existing English categories to Dutch
UPDATE public.categories SET name = 'Boodschappen' WHERE name = 'Groceries';
UPDATE public.categories SET name = 'Restaurants' WHERE name = 'Restaurants';
UPDATE public.categories SET name = 'Vervoer' WHERE name = 'Transportation';
UPDATE public.categories SET name = 'Winkelen' WHERE name = 'Shopping';
UPDATE public.categories SET name = 'Entertainment' WHERE name = 'Entertainment';
UPDATE public.categories SET name = 'Nutsvoorzieningen' WHERE name = 'Utilities';
UPDATE public.categories SET name = 'Huisvesting' WHERE name = 'Housing';
UPDATE public.categories SET name = 'Gezondheidszorg' WHERE name = 'Healthcare';
UPDATE public.categories SET name = 'Verzekeringen' WHERE name = 'Insurance';
UPDATE public.categories SET name = 'Overig' WHERE name = 'Other';
UPDATE public.categories SET name = 'Salaris' WHERE name = 'Salary';
UPDATE public.categories SET name = 'Freelance' WHERE name = 'Freelance';
UPDATE public.categories SET name = 'Investeringen' WHERE name = 'Investments';
UPDATE public.categories SET name = 'Overig Inkomen' WHERE name = 'Other Income';

-- Now add the new categories for users who don't have them
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  FOR v_user_id IN SELECT DISTINCT user_id FROM public.categories LOOP
    -- Add new categories only if they don't exist
    INSERT INTO public.categories (user_id, name, type, color, icon)
    VALUES
      (v_user_id, 'Huur', 'expense', '#8B4513', '🏠'),
      (v_user_id, 'Energie', 'expense', '#FFD700', '⚡'),
      (v_user_id, 'Internet & TV', 'expense', '#4169E1', '📡'),
      (v_user_id, 'Abonnementen', 'expense', '#9370DB', '📱'),
      (v_user_id, 'Brandstof', 'expense', '#FF4500', '⛽')
    ON CONFLICT (user_id, name) DO NOTHING;
  END LOOP;
END $$;

-- Update the function to create Dutch categories for new users
CREATE OR REPLACE FUNCTION public.create_default_categories(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Default expense categories (Dutch)
    INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
    (p_user_id, 'Boodschappen', 'expense', '#10b981', '🛒'),
    (p_user_id, 'Restaurants', 'expense', '#f59e0b', '🍽️'),
    (p_user_id, 'Vervoer', 'expense', '#3b82f6', '🚗'),
    (p_user_id, 'Winkelen', 'expense', '#ec4899', '🛍️'),
    (p_user_id, 'Entertainment', 'expense', '#8b5cf6', '🎬'),
    (p_user_id, 'Nutsvoorzieningen', 'expense', '#ef4444', '⚡'),
    (p_user_id, 'Huisvesting', 'expense', '#6366f1', '🏠'),
    (p_user_id, 'Gezondheidszorg', 'expense', '#14b8a6', '🏥'),
    (p_user_id, 'Verzekeringen', 'expense', '#0ea5e9', '🛡️'),
    (p_user_id, 'Overig', 'expense', '#64748b', '📦');

    -- Default income categories (Dutch)
    INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
    (p_user_id, 'Salaris', 'income', '#22c55e', '💰'),
    (p_user_id, 'Freelance', 'income', '#84cc16', '💼'),
    (p_user_id, 'Investeringen', 'income', '#06b6d4', '📈'),
    (p_user_id, 'Overig Inkomen', 'income', '#10b981', '💵');

    -- Add new categories for fixed costs
    INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
    (p_user_id, 'Huur', 'expense', '#8B4513', '🏠'),
    (p_user_id, 'Energie', 'expense', '#FFD700', '⚡'),
    (p_user_id, 'Internet & TV', 'expense', '#4169E1', '📡'),
    (p_user_id, 'Abonnementen', 'expense', '#9370DB', '📱'),
    (p_user_id, 'Brandstof', 'expense', '#FF4500', '⛽');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
