const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter config from environmental settings
const smtpHost = process.env.SMTP_HOST || '';
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'anjanamobile7751@gmail.com';

const sendOrderNotification = async (order, items) => {
  console.log(`[Mailer] Preparing new order email notification for ${order.order_number}`);
  
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log('--------------------------------------------------');
    console.log(`[Mailer Warning] SMTP is not fully configured in backend/.env.`);
    console.log(`Fallback logging: Email receipt details:`);
    console.log(`To Admin: ${adminEmail}`);
    console.log(`Subject: New Order Placed - ${order.order_number}`);
    console.log(`Customer: ${order.full_name} (${order.phone})`);
    console.log(`Shipping To: ${order.address}`);
    console.log(`Payment Type: ${order.payment_method}`);
    console.log(`Grand Total (including GST): ₹${parseFloat(order.total).toLocaleString('en-IN')}`);
    console.log(`Items Purchased:`);
    items.forEach(i => console.log(`  - ${i.product_name} (Qty: ${i.quantity}) @ ₹${parseFloat(i.price).toLocaleString('en-IN')}/unit`));
    console.log('--------------------------------------------------');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border: 1px solid #e0e0e0; font-size: 0.9rem; color: #333;">${item.product_name}</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: center; font-size: 0.9rem; color: #333;">${item.quantity}</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: right; font-size: 0.9rem; color: #333;">₹${parseFloat(item.price).toLocaleString('en-IN')}</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold; font-size: 0.9rem; color: #0A2A1B;">₹${(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"SDC Furniture Canteen" <${smtpUser}>`,
      to: adminEmail,
      subject: `🛒 New Order Placed - ${order.order_number}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 3px solid #D49B28;">
            <h1 style="color: #0A2A1B; margin: 0; font-size: 1.8rem; font-family: Georgia, serif;">SDC Furniture & Electronic Canteen</h1>
            <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: #666; font-style: italic;">Premium Quality & Generational Trust since 1998</p>
          </div>
          
          <h2 style="color: #0A2A1B; font-size: 1.3rem; margin-top: 0; font-weight: 600;">Naya Order Received!</h2>
          <p style="color: #555; line-height: 1.5; font-size: 0.95rem;">Bhai, ek naya customer order place hua hai site par. details niche hain:</p>
          
          <div style="background-color: #f7f9f8; border-radius: 8px; padding: 15px; margin-bottom: 25px; border-left: 4px solid #0A2A1B;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; line-height: 1.6;">
              <tr>
                <td style="font-weight: bold; width: 140px; color: #555;">Order Number:</td>
                <td style="color: #0A2A1B; font-weight: bold;">${order.order_number}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Placed At:</td>
                <td>${new Date(order.created_at || new Date()).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Customer Name:</td>
                <td>${order.full_name}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Contact Phone:</td>
                <td>${order.phone}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Delivery Address:</td>
                <td>${order.address}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Payment Mode:</td>
                <td style="text-transform: uppercase; font-weight: bold; color: #C84B31;">${order.payment_method}</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #0A2A1B; font-size: 1.1rem; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 12px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="background-color: #0A2A1B; color: #ffffff;">
                <th style="padding: 10px; text-align: left; font-size: 0.85rem; border-top-left-radius: 4px; border-bottom-left-radius: 4px;">Item Description</th>
                <th style="padding: 10px; text-align: center; font-size: 0.85rem;">Qty</th>
                <th style="padding: 10px; text-align: right; font-size: 0.85rem;">Unit Price</th>
                <th style="padding: 10px; text-align: right; font-size: 0.85rem; border-top-right-radius: 4px; border-bottom-right-radius: 4px;">Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px 10px 5px 10px; text-align: right; font-size: 0.9rem; color: #666;">Subtotal:</td>
                <td style="padding: 10px 10px 5px 10px; text-align: right; font-size: 0.9rem; color: #333;">₹${parseFloat(order.subtotal).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 5px 10px; text-align: right; font-size: 0.9rem; color: #666;">GST (18%):</td>
                <td style="padding: 5px 10px; text-align: right; font-size: 0.9rem; color: #333;">₹${parseFloat(order.gst).toLocaleString('en-IN')}</td>
              </tr>
              <tr style="border-top: 2px solid #0A2A1B;">
                <td colspan="3" style="padding: 12px 10px; text-align: right; font-size: 1.1rem; font-weight: bold; color: #0A2A1B;">Grand Total:</td>
                <td style="padding: 12px 10px; text-align: right; font-size: 1.1rem; font-weight: bold; color: #0A2A1B;">₹${parseFloat(order.total).toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>

          <div style="text-align: center; margin-top: 35px; padding: 20px; background-color: #f7f9f8; border-radius: 8px;">
            <p style="margin: 0 0 12px 0; font-size: 0.88rem; color: #555; font-weight: 500;">Access the Admin Panel console to dispatch items or print the custom GST Invoice.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" style="display: inline-block; padding: 12px 25px; background-color: #0A2A1B; color: #ffffff; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 0.9rem; box-shadow: 0 4px 10px rgba(10,42,27,0.2);">Open Admin Dashboard</a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; font-size: 0.75rem; color: #999;">
            This email was automatically generated by the SDC Canteen Platform ordering system.
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Order alert sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error('[Mailer Error] Sending order notification failed:', error);
  }
};

module.exports = { sendOrderNotification };
