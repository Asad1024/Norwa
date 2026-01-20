import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') || '')

serve(async (req) => {
  try {
    const { type, data } = await req.json()

    if (!type || !data) {
      return new Response(
        JSON.stringify({ error: 'Type and data are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@example.com'

    if (type === 'contact_form') {
      // Contact form email
      const { name, email, subject, message } = data

      const { data: emailData, error } = await resend.emails.send({
        from: 'NORWA Contact Form <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">New Contact Form Submission</h2>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">${message}</p>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              This email was sent from the NORWA contact form.
            </p>
          </div>
        `,
        replyTo: email,
      })

      if (error) {
        console.error('Resend error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to send email' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, messageId: emailData?.id }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (type === 'order_notification') {
      // Order notification email
      const { order, orderItems, userEmail, userName } = data

      const itemsHtml = orderItems
        .map(
          (item: any) => {
            const product = item.products || {}
            const productName = product.name_translations?.en || product.name || 'Product'
            return `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                  ${productName}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
                  ${item.quantity}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  $${parseFloat(item.price).toFixed(2)}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  $${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </td>
              </tr>
            `
          }
        )
        .join('')

      const { data: emailData, error } = await resend.emails.send({
        from: 'NORWA Orders <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `New Order #${order.id.substring(0, 8)} - $${parseFloat(order.total).toFixed(2)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">New Order Received</h2>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #111827;">Order Information</h3>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Customer:</strong> ${userName || userEmail}</p>
              <p><strong>Email:</strong> ${userEmail}</p>
              <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">${order.status.toUpperCase()}</span></p>
              <p><strong>Shipping Address:</strong> ${order.shipping_address || 'N/A'}</p>
              <p><strong>Phone Number:</strong> ${order.phone_number || 'N/A'}</p>
              <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
            </div>

            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #111827;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 4px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #16a34a; color: white;">
                    <th style="padding: 12px; text-align: left;">Product</th>
                    <th style="padding: 12px; text-align: center;">Quantity</th>
                    <th style="padding: 12px; text-align: right;">Unit Price</th>
                    <th style="padding: 12px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; border-top: 2px solid #16a34a;">
                      Total:
                    </td>
                    <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #16a34a; border-top: 2px solid #16a34a;">
                      $${parseFloat(order.total).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              This email was automatically sent when a new order was placed on NORWA.
            </p>
          </div>
        `,
      })

      if (error) {
        console.error('Resend error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to send email' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, messageId: emailData?.id }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid type' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
