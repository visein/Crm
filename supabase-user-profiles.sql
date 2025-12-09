-- Kullanıcı profilleri tablosu oluştur
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'sales' CHECK (role IN ('admin', 'sales', 'finance', 'operations')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) politikaları
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcılar tüm profilleri okuyabilir
CREATE POLICY "Admin users can read all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Kullanıcılar kendi profillerini okuyabilir
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Admin kullanıcılar tüm profilleri güncelleyebilir
CREATE POLICY "Admin users can update all profiles" ON public.user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin kullanıcılar yeni profil oluşturabilir
CREATE POLICY "Admin users can insert profiles" ON public.user_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin kullanıcılar profilleri silebilir
CREATE POLICY "Admin users can delete profiles" ON public.user_profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Yeni kullanıcı kaydolduğunda otomatik profil oluştur (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'sales')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Updated_at otomatik güncelleme trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Mevcut kullanıcılar için profil oluştur (eğer varsa)
INSERT INTO public.user_profiles (id, full_name, role)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    COALESCE(raw_user_meta_data->>'role', 'sales') as role
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;