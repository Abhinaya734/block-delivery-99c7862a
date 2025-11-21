-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for delivery status
CREATE TYPE delivery_status AS ENUM ('Pending', 'In Transit', 'Delivered');

-- Create deliveries table
CREATE TABLE public.deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number TEXT UNIQUE NOT NULL,
    sender_address TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    status delivery_status NOT NULL DEFAULT 'Pending',
    transaction_hash TEXT NOT NULL,
    block_number BIGINT,
    estimated_delivery TIMESTAMPTZ NOT NULL,
    package_weight TEXT,
    package_dimensions TEXT,
    package_description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create delivery_locations table for tracking history
CREATE TABLE public.delivery_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT NOT NULL,
    transaction_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create delivery_transactions table for blockchain records
CREATE TABLE public.delivery_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL, -- 'create', 'status_update', 'location_update'
    transaction_hash TEXT NOT NULL,
    block_number BIGINT,
    from_address TEXT NOT NULL,
    gas_used TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_deliveries_tracking_number ON public.deliveries(tracking_number);
CREATE INDEX idx_deliveries_status ON public.deliveries(status);
CREATE INDEX idx_deliveries_created_by ON public.deliveries(created_by);
CREATE INDEX idx_delivery_locations_delivery_id ON public.delivery_locations(delivery_id);
CREATE INDEX idx_delivery_transactions_delivery_id ON public.delivery_transactions(delivery_id);

-- Enable Row Level Security
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deliveries table
-- Anyone can view deliveries (public tracking)
CREATE POLICY "Anyone can view deliveries"
    ON public.deliveries
    FOR SELECT
    USING (true);

-- Authenticated users can create deliveries
CREATE POLICY "Authenticated users can create deliveries"
    ON public.deliveries
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Only the creator or system can update deliveries
CREATE POLICY "Creators can update their deliveries"
    ON public.deliveries
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

-- RLS Policies for delivery_locations table
-- Anyone can view location history
CREATE POLICY "Anyone can view delivery locations"
    ON public.delivery_locations
    FOR SELECT
    USING (true);

-- Only authenticated users can add locations
CREATE POLICY "Authenticated users can add locations"
    ON public.delivery_locations
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policies for delivery_transactions table
-- Anyone can view transactions (blockchain transparency)
CREATE POLICY "Anyone can view transactions"
    ON public.delivery_transactions
    FOR SELECT
    USING (true);

-- Only authenticated users can record transactions
CREATE POLICY "Authenticated users can record transactions"
    ON public.delivery_transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_deliveries_updated_at
    BEFORE UPDATE ON public.deliveries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();