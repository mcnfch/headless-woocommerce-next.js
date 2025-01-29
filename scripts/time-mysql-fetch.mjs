#!/usr/bin/env node

import mysql from 'mysql2/promise';
import fs from 'fs/promises';

const start = process.hrtime();

async function getProductIds(connection) {
  const [rows] = await connection.execute(`
    SELECT ID 
    FROM wp_posts 
    WHERE post_type = 'product' 
    AND post_status = 'publish'
  `);
  return rows.map(row => row.ID);
}

async function getProductDetails(connection, productId) {
  // Basic product info
  const [basicInfo] = await connection.execute(`
    SELECT 
      p.ID as id,
      p.post_title as name,
      p.post_name as slug,
      p.post_content as description,
      p.post_excerpt as short_description,
      p.post_date as date_created,
      p.post_modified as date_modified
    FROM wp_posts p
    WHERE p.ID = ?
  `, [productId]);

  // Product meta
  const [meta] = await connection.execute(`
    SELECT meta_key, meta_value
    FROM wp_postmeta
    WHERE post_id = ?
  `, [productId]);

  // Categories
  const [categories] = await connection.execute(`
    SELECT 
      t.term_id as id,
      t.name,
      t.slug
    FROM wp_terms t
    JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
    JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
    WHERE tr.object_id = ?
    AND tt.taxonomy = 'product_cat'
  `, [productId]);

  // Images
  const [images] = await connection.execute(`
    SELECT DISTINCT
      p.ID as id,
      p.post_title as name,
      pm.meta_value as file_path,
      pm_alt.meta_value as alt
    FROM wp_posts p
    JOIN wp_postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_wp_attached_file'
    LEFT JOIN wp_postmeta pm_alt ON p.ID = pm_alt.post_id AND pm_alt.meta_key = '_wp_attachment_image_alt'
    WHERE (
      p.post_parent = ?
      OR p.ID IN (
        SELECT meta_value FROM wp_postmeta 
        WHERE post_id = ? AND meta_key = '_thumbnail_id'
        UNION
        SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(meta_value, ',', n.n), ',', -1) as image_id
        FROM wp_postmeta
        CROSS JOIN (
          SELECT a.N + b.N * 10 + 1 n
          FROM (SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a
          CROSS JOIN (SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b
          ORDER BY n
        ) n
        WHERE post_id = ? 
        AND meta_key = '_product_image_gallery'
        AND n.n <= 1 + (LENGTH(meta_value) - LENGTH(REPLACE(meta_value, ',', '')))
      )
    )
    AND p.post_type = 'attachment'
  `, [productId, productId, productId]);

  // Product attributes
  const [attributes] = await connection.execute(`
    SELECT DISTINCT
      pa.attribute_id as id,
      pa.attribute_label as name,
      (
        SELECT GROUP_CONCAT(t2.name)
        FROM wp_terms t2
        JOIN wp_term_taxonomy tt2 ON t2.term_id = tt2.term_id
        JOIN wp_term_relationships tr2 ON tt2.term_taxonomy_id = tr2.term_taxonomy_id
        WHERE tr2.object_id = ?
        AND tt2.taxonomy = CONCAT('pa_', pa.attribute_name)
      ) as options
    FROM wp_woocommerce_attribute_taxonomies pa
    JOIN wp_term_taxonomy tt ON tt.taxonomy = CONCAT('pa_', pa.attribute_name)
    JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
    WHERE tr.object_id = ?
  `, [productId, productId]);

  // Process meta into a more usable format
  const metaObj = {};
  meta.forEach(({ meta_key, meta_value }) => {
    if (meta_key.startsWith('_')) {
      metaObj[meta_key.substring(1)] = meta_value;
    }
  });

  // Process images
  const processedImages = images.map(img => ({
    id: img.id,
    name: img.name,
    src: `https://woo.groovygallerydesigns.com/wp-content/uploads/${img.file_path}`,
    alt: img.alt || ''
  }));

  // Process attributes
  const processedAttributes = attributes.map(attr => ({
    id: attr.id,
    name: attr.name,
    options: attr.options ? attr.options.split(',') : []
  }));

  return {
    ...basicInfo[0],
    permalink: `https://woo.groovygallerydesigns.com/product/${basicInfo[0].slug}/`,
    type: metaObj.product_type || 'simple',
    status: 'publish',
    featured: metaObj.featured === 'yes',
    catalog_visibility: metaObj.catalog_visibility || 'visible',
    sku: metaObj.sku || '',
    price: metaObj.price || '',
    regular_price: metaObj.regular_price || '',
    sale_price: metaObj.sale_price || '',
    date_created_gmt: basicInfo[0].date_created,
    date_modified_gmt: basicInfo[0].date_modified,
    images: processedImages,
    attributes: processedAttributes,
    categories: categories,
    variations: []
  };
}

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'wpuser',
    password: 'way2mcnfch@WSX',
    database: 'woo_groovy'
  });

  try {
    const productIds = await getProductIds(connection);
    const products = [];
    
    for (const productId of productIds) {
      const product = await getProductDetails(connection, productId);
      products.push(product);
    }

    console.log(JSON.stringify(products));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

main();
