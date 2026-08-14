const db = require('../config/db');

exports.chat = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }

  const queryText = message.toLowerCase().trim();
  let responseText = '';
  let recommendations = [];
  let comparison = null;

  try {
    // 1. Check for Store Info / Contact Details / Location
    if (
      queryText.includes('location') ||
      queryText.includes('address') ||
      queryText.includes('where is') ||
      queryText.includes('map') ||
      queryText.includes('address of sdc') ||
      queryText.includes('place') ||
      queryText.includes('showroom')
    ) {
      responseText = `SDC Furniture & Electronic Canteen showroom is located at **Near Balaji Goshala, Salasar Ke Samne, Sujangarh Road, Salasar, Churu, Rajasthan – 331506**. We serve customers across Salasar, Rajasthan, and provide safe home delivery Pan India.`;
    } else if (
      queryText.includes('contact') ||
      queryText.includes('phone') ||
      queryText.includes('call') ||
      queryText.includes('whatsapp') ||
      queryText.includes('email') ||
      queryText.includes('number') ||
      queryText.includes('mobile')
    ) {
      responseText = `You can reach out to SDC Furniture & Electronic Canteen directly at:
📞 **Phone:** +91 9982827751, +91 9950105100, +91 8690787751
💬 **WhatsApp:** 9982827751, 9950105100, 8690787751
📧 **Email:** anjanamobile7751@gmail.com
Feel free to text us on WhatsApp or call for bulk orders, discounts, or delivery assistance!`;
    } else if (
      queryText.includes('time') ||
      queryText.includes('hour') ||
      queryText.includes('open') ||
      queryText.includes('schedule') ||
      queryText.includes('sunday') ||
      queryText.includes('close')
    ) {
      responseText = `We are open every day of the week, **Monday – Sunday from 10:00 AM – 5:00 PM**. Feel free to stop by!`;
    }

    // 2. Check for custom services / manufacturing
    else if (
      queryText.includes('manufacturing') ||
      queryText.includes('custom') ||
      queryText.includes('make') ||
      queryText.includes('service') ||
      queryText.includes('repair') ||
      queryText.includes('installation') ||
      queryText.includes('warranty') ||
      queryText.includes('gst')
    ) {
      responseText = `With over **15+ years of experience since 1998**, SDC Furniture & Electronic Canteen provides premium quality services:
- **Furniture Manufacturing:** Custom hand-carved Teak Wood sofas, modern L-shape fabric sofas, customized beds, mandirs, and office desks.
- **Electronics & Appliances:** Genuine products (Samsung, LG, Sony) backed by GST billing and official warranties.
- **After-Sales Support:** Professional installation, delivery, and ongoing appliance repair support.
- **Bulk supply:** We furnish guest houses, hotels, retail stores, and individual buyers at factory rates.`;
    }

    // 3. Check for comparisons
    else if (queryText.includes('compare') || queryText.includes('difference between') || queryText.includes('vs')) {
      const [allProducts] = await db.query('SELECT id, name, slug, price, sale_price, warranty, rating FROM products WHERE is_available = 1');
      const matches = [];
      
      for (const p of allProducts) {
        const cleanName = p.name.toLowerCase();
        const cleanSlug = p.slug.replace(/-/g, ' ');
        if (queryText.includes(cleanName) || queryText.includes(cleanSlug) || cleanName.split(' ').every(word => queryText.includes(word))) {
          matches.push(p);
        }
      }

      if (matches.length >= 2) {
        // Fetch detailed info
        const [prod1] = await db.query('SELECT p.*, m.name as material_name, b.name as brand_name FROM products p LEFT JOIN materials m ON p.material_id = m.id LEFT JOIN brands b ON p.brand_id = b.id WHERE p.id = ?', [matches[0].id]);
        const [prod2] = await db.query('SELECT p.*, m.name as material_name, b.name as brand_name FROM products p LEFT JOIN materials m ON p.material_id = m.id LEFT JOIN brands b ON p.brand_id = b.id WHERE p.id = ?', [matches[1].id]);

        comparison = {
          product1: prod1[0],
          product2: prod2[0]
        };
        responseText = `Here is a side-by-side comparison between **${matches[0].name}** and **${matches[1].name}**:`;
      } else {
        responseText = `I can compare any two products in our database. Please specify the exact names. For example, try: *"compare sdc royal fabric manual recliner and sdc majestic leatherette rocking recliner"*`;
      }
    }

    // 4. Product Recommendations
    else {
      let categoryMatch = null;
      let materialMatch = null;
      let brandMatch = null;

      const [categories] = await db.query('SELECT * FROM categories');
      const [materials] = await db.query('SELECT * FROM materials');
      const [brands] = await db.query('SELECT * FROM brands');

      for (const c of categories) {
        if (queryText.includes(c.name.toLowerCase()) || queryText.includes(c.slug.replace(/-/g, ' '))) {
          categoryMatch = c;
          break;
        }
      }
      for (const m of materials) {
        if (queryText.includes(m.name.toLowerCase()) || queryText.includes(m.slug.replace(/-/g, ' '))) {
          materialMatch = m;
          break;
        }
      }
      for (const b of brands) {
        if (queryText.includes(b.name.toLowerCase()) || queryText.includes(b.slug.replace(/-/g, ' '))) {
          brandMatch = b;
          break;
        }
      }

      let sql = `
        SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.rating,
               (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
        FROM products p
        INNER JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN materials m ON p.material_id = m.id
        WHERE p.is_available = 1
      `;
      const params = [];

      if (categoryMatch) {
        const [subcats] = await db.query('SELECT id FROM categories WHERE parent_id = ? OR parent_id IN (SELECT id FROM categories WHERE parent_id = ?)', [categoryMatch.id, categoryMatch.id]);
        const catIds = [categoryMatch.id, ...subcats.map(s => s.id)];
        sql += ` AND p.category_id IN (${catIds.map(() => '?').join(',')})`;
        params.push(...catIds);
      }
      if (materialMatch) {
        sql += ` AND p.material_id = ?`;
        params.push(materialMatch.id);
      }
      if (brandMatch) {
        sql += ` AND p.brand_id = ?`;
        params.push(brandMatch.id);
      }

      if (!categoryMatch && !materialMatch && !brandMatch) {
        const keywords = queryText.split(' ').filter(w => w.length > 2);
        if (keywords.length > 0) {
          sql += ` AND (`;
          const clauses = [];
          for (const kw of keywords) {
            clauses.push(`p.name LIKE ? OR p.description LIKE ?`);
            params.push(`%${kw}%`, `%${kw}%`);
          }
          sql += clauses.join(' OR ') + `)`;
        } else {
          sql += ` AND 1=0`;
        }
      }

      sql += ` LIMIT 4`;
      const [rows] = await db.query(sql, params);
      recommendations = rows;

      if (recommendations.length > 0) {
        responseText = `Based on our current stock of genuine products, here are the recommendations that match your request:`;
      } else {
        responseText = `Namaste! SDC Furniture & Electronic Canteen has been bringing quality products to homes since 1998. We offer Sofa Sets, Beds, Recliners, LED TVs, Refrigerators, Kids Toys, and God Statues. 

How can I help you? You can ask things like:
- *"Show me fabric recliners"*
- *"Where is SDC showroom located?"*
- *"Can I get custom furniture?"*
- *"Compare Samsung TV and LG Refrigerator"*`;
      }
    }

    res.status(200).json({
      success: true,
      response: responseText,
      recommendations,
      comparison
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'AI Shopping Assistant error.' });
  }
};
