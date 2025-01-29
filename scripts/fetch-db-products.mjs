import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'wpuser',
    password: 'way2mcnfch@WSX',
    database: 'woo_groovy'
  });

  try {
    // Fetch products with their metadata and terms
    const [rows] = await connection.execute(`
      SELECT 
        p.ID as id,
        p.post_title as name,
        p.post_name as slug,
        p.post_type,
        p.post_status as status,
        p.post_date as date_created,
        p.post_modified as date_modified,
        p.post_content as description,
        p.post_excerpt as short_description,
        pm_sku.meta_value as sku,
        pm_price.meta_value as price,
        pm_stock.meta_value as stock_status,
        pm_manage_stock.meta_value as manage_stock,
        pm_stock_qty.meta_value as stock_quantity
      FROM wp_posts p
      LEFT JOIN wp_postmeta pm_sku ON p.ID = pm_sku.post_id AND pm_sku.meta_key = '_sku'
      LEFT JOIN wp_postmeta pm_price ON p.ID = pm_price.post_id AND pm_price.meta_key = '_price'
      LEFT JOIN wp_postmeta pm_stock ON p.ID = pm_stock.post_id AND pm_stock.meta_key = '_stock_status'
      LEFT JOIN wp_postmeta pm_manage_stock ON p.ID = pm_manage_stock.post_id AND pm_manage_stock.meta_key = '_manage_stock'
      LEFT JOIN wp_postmeta pm_stock_qty ON p.ID = pm_stock_qty.post_id AND pm_stock_qty.meta_key = '_stock'
      WHERE p.post_type = 'product'
      AND p.post_status = 'publish'
      AND p.post_title LIKE '%NO Statement%'
    `);

    // Write the results to data2.json
    await fs.writeFile(
      path.join(process.cwd(), 'data2.json'),
      JSON.stringify(rows, null, 2)
    );
    
    console.log(`Successfully wrote ${rows.length} products to data2.json`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

main();
