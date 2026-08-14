const db = require('../config/db');
const { sendOrderNotification } = require('../utils/mailer');

// 1. Place a new order (Customer only)
exports.createOrder = async (req, res) => {
  const { full_name, phone, address, payment_method, items } = req.body;
  const userId = req.user.id;

  if (!full_name || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'All details (full_name, phone, address, items) are required.' });
  }

  // Get a connection from pool to handle transactions
  const connection = await db.getPool().getConnection();
  
  try {
    await connection.beginTransaction();

    let subtotal = 0;
    const processedItems = [];

    // Verify stock and fetch prices from DB
    for (const item of items) {
      const [products] = await connection.query(
        'SELECT id, name, price, sale_price, stock, is_available FROM products WHERE id = ?',
        [item.product_id]
      );

      if (products.length === 0) {
        throw new Error(`Product with ID ${item.product_id} not found in catalog.`);
      }

      const product = products[0];

      if (product.is_available !== 1) {
        throw new Error(`Product "${product.name}" is currently unavailable.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Available stock: ${product.stock}`);
      }

      const price = product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price);
      subtotal += price * item.quantity;

      processedItems.push({
        product_id: product.id,
        product_name: product.name,
        price: price,
        quantity: item.quantity
      });

      // Decrement catalog stock
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, product.id]
      );
    }

    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    // Generate readable order number (SDC-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SDC-${dateStr}-${randSuffix}`;

    // Insert Order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_number, user_id, full_name, phone, address, payment_method, subtotal, gst, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [orderNumber, userId, full_name, phone, address, payment_method || 'cod', subtotal, gst, total]
    );

    const orderId = orderResult.insertId;

    // Insert Order Items snapshots
    for (const item of processedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.price, item.quantity]
      );
    }

    await connection.commit();
    connection.release();

    const fullOrder = {
      id: orderId,
      order_number: orderNumber,
      full_name,
      phone,
      address,
      payment_method,
      subtotal,
      gst,
      total,
      status: 'pending',
      created_at: new Date()
    };

    // Send email alert asynchronously without slowing checkout response
    sendOrderNotification(fullOrder, processedItems).catch(err =>
      console.error('[Notification failed Async]', err)
    );

    res.status(201).json({
      success: true,
      message: 'Aapka order successfully register ho gaya hai!',
      data: {
        order_id: orderId,
        order_number: orderNumber,
        total: total
      }
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('[Order Placement Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error placing order.' });
  }
};

// 2. Fetch logged-in customer's past orders (Customer only)
exports.getCustomerOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const ordersWithItems = [];
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.slug as product_slug 
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      ordersWithItems.push({
        ...order,
        items
      });
    }

    res.status(200).json({ success: true, data: ordersWithItems });
  } catch (error) {
    console.error('[Fetch Customer Orders Error]', error);
    res.status(500).json({ success: false, message: 'Server error fetching past orders.' });
  }
};

// 3. Fetch all orders (Admin only)
exports.getAdminOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, u.username as customer_username 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    const ordersWithItems = [];
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.slug as product_slug 
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      ordersWithItems.push({
        ...order,
        items
      });
    }

    res.status(200).json({ success: true, data: ordersWithItems });
  } catch (error) {
    console.error('[Admin Get Orders Error]', error);
    res.status(500).json({ success: false, message: 'Server error retrieving all orders.' });
  }
};

// 4. Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  if (!status || !['pending', 'dispatched', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status. Allowed: pending, dispatched, completed, cancelled.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.status(200).json({ success: true, message: `Order status updated to "${status}" successfully.` });
  } catch (error) {
    console.error('[Admin Update Status Error]', error);
    res.status(500).json({ success: false, message: 'Server error updating order status.' });
  }
};
