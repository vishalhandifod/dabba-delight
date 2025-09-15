-- Create enum for user types
CREATE TYPE user_type AS ENUM ('customer', 'housewife', 'vendor', 'deliveryPartner', 'admin');

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    user_type user_type NOT NULL,
    phone_number TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create housewife_profiles table for additional housewife information
CREATE TABLE housewife_profiles (
    id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    kitchen_name TEXT NOT NULL,
    specialties TEXT[],
    rating DECIMAL(3,2) DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT false
);

-- Create vendor_profiles table for additional vendor information
CREATE TABLE vendor_profiles (
    id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    business_name TEXT NOT NULL,
    business_address TEXT NOT NULL,
    license_number TEXT,
    is_verified BOOLEAN DEFAULT false
);

-- Create delivery_partner_profiles table
CREATE TABLE delivery_partner_profiles (
    id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    vehicle_type TEXT NOT NULL,
    vehicle_number TEXT NOT NULL,
    license_number TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    current_status TEXT DEFAULT 'offline'
);

-- Create menu_items table
CREATE TABLE menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    housewife_id UUID REFERENCES housewife_profiles(id),
    delivery_partner_id UUID REFERENCES delivery_partner_profiles(id),
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    special_instructions TEXT
);

-- Create reviews table
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE housewife_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Menu items: viewable by everyone, but only creators can modify
CREATE POLICY "Menu items are viewable by everyone" ON menu_items
    FOR SELECT USING (true);

CREATE POLICY "Creators can modify their menu items" ON menu_items
    FOR ALL USING (auth.uid() = creator_id);

-- Orders: customers can see their orders, housewives can see orders assigned to them
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        auth.uid() = housewife_id OR 
        auth.uid() = delivery_partner_id
    );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, user_type)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'user_type')::user_type);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 