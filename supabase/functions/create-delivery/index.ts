import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const {
      trackingNumber,
      recipient,
      origin,
      destination,
      weight,
      dimensions,
      description,
      senderAddress,
      transactionHash,
      blockNumber,
    } = await req.json();

    console.log('Creating delivery:', { trackingNumber, recipient, origin, destination });

    // Calculate estimated delivery (3 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    // Insert delivery record
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .insert({
        tracking_number: trackingNumber,
        sender_address: senderAddress,
        recipient_name: recipient,
        origin,
        destination,
        status: 'Pending',
        transaction_hash: transactionHash,
        block_number: blockNumber,
        estimated_delivery: estimatedDelivery.toISOString(),
        package_weight: weight,
        package_dimensions: dimensions,
        package_description: description,
        created_by: user.id,
      })
      .select()
      .single();

    if (deliveryError) {
      console.error('Error creating delivery:', deliveryError);
      throw deliveryError;
    }

    console.log('Delivery created:', delivery.id);

    // Insert initial location
    const { error: locationError } = await supabase
      .from('delivery_locations')
      .insert({
        delivery_id: delivery.id,
        address: origin,
        transaction_hash: transactionHash,
      });

    if (locationError) {
      console.error('Error creating location:', locationError);
      throw locationError;
    }

    // Record transaction
    const { error: txError } = await supabase
      .from('delivery_transactions')
      .insert({
        delivery_id: delivery.id,
        transaction_type: 'create',
        transaction_hash: transactionHash,
        block_number: blockNumber,
        from_address: senderAddress,
        status: 'confirmed',
      });

    if (txError) {
      console.error('Error recording transaction:', txError);
      throw txError;
    }

    console.log('Delivery created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        delivery,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-delivery function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
