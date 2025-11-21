import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
      deliveryId,
      status,
      transactionHash,
      blockNumber,
      senderAddress,
    } = await req.json();

    console.log('Updating delivery status:', { deliveryId, status });

    // Update delivery status
    const { data: delivery, error: updateError } = await supabase
      .from('deliveries')
      .update({ status })
      .eq('id', deliveryId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating delivery:', updateError);
      throw updateError;
    }

    console.log('Delivery status updated:', delivery.id);

    // Record transaction
    const { error: txError } = await supabase
      .from('delivery_transactions')
      .insert({
        delivery_id: deliveryId,
        transaction_type: 'status_update',
        transaction_hash: transactionHash,
        block_number: blockNumber,
        from_address: senderAddress,
        status: 'confirmed',
      });

    if (txError) {
      console.error('Error recording transaction:', txError);
      throw txError;
    }

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
    console.error('Error in update-delivery-status function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
