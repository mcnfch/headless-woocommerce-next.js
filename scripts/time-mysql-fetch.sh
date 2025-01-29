#!/bin/bash

echo "Starting MySQL fetch..."
start=$(date +%s%N)

# Step 1: Get all product IDs first
echo "Fetching product IDs..."
mysql -u wpuser -p'way2mcnfch@WSX' woo_groovy -N -r -e "
SELECT JSON_ARRAYAGG(p.ID) as product_ids
FROM wp_posts p
WHERE p.post_type = 'product' 
AND p.post_status = 'publish';" > product_ids.json

# Step 2: Get details for each product
mysql -u wpuser -p'way2mcnfch@WSX' woo_groovy -N -r -e "
SELECT JSON_ARRAYAGG(
  JSON_OBJECT(
    'id', p.ID,
    'name', p.post_title,
    'slug', p.post_name,
    'permalink', CONCAT('https://woo.groovygallerydesigns.com/product/', p.post_name, '/'),
    'date_created', p.post_date,
    'date_modified', p.post_modified,
    'type', p.post_type,
    'status', p.post_status,
    'sku', COALESCE(pm_sku.meta_value, ''),
    'price', COALESCE(pm_price.meta_value, ''),
    'regular_price', COALESCE(pm_regular_price.meta_value, ''),
    'sale_price', COALESCE(pm_sale_price.meta_value, ''),
    'stock_status', COALESCE(pm_stock.meta_value, 'instock'),
    'stock_quantity', NULLIF(CAST(COALESCE(pm_stock_qty.meta_value, 0) AS SIGNED), 0),
    'manage_stock', CASE WHEN pm_manage_stock.meta_value = 'yes' THEN CAST(1 AS JSON) ELSE CAST(0 AS JSON) END,
    'categories', COALESCE((
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', terms.term_id,
          'name', terms.name,
          'slug', terms.slug
        )
      )
      FROM wp_term_relationships tr
      JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
      JOIN wp_terms terms ON tt.term_id = terms.term_id
      WHERE tr.object_id = p.ID AND tt.taxonomy = 'product_cat'
    ), JSON_ARRAY()),
    'tags', COALESCE((
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', terms.term_id,
          'name', terms.name,
          'slug', terms.slug
        )
      )
      FROM wp_term_relationships tr
      JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
      JOIN wp_terms terms ON tt.term_id = terms.term_id
      WHERE tr.object_id = p.ID AND tt.taxonomy = 'product_tag'
    ), JSON_ARRAY())
  )
) as json_data
FROM wp_posts p
LEFT JOIN wp_postmeta pm_sku ON p.ID = pm_sku.post_id AND pm_sku.meta_key = '_sku'
LEFT JOIN wp_postmeta pm_price ON p.ID = pm_price.post_id AND pm_price.meta_key = '_price'
LEFT JOIN wp_postmeta pm_regular_price ON p.ID = pm_regular_price.post_id AND pm_regular_price.meta_key = '_regular_price'
LEFT JOIN wp_postmeta pm_sale_price ON p.ID = pm_sale_price.post_id AND pm_sale_price.meta_key = '_sale_price'
LEFT JOIN wp_postmeta pm_stock ON p.ID = pm_stock.post_id AND pm_stock.meta_key = '_stock_status'
LEFT JOIN wp_postmeta pm_stock_qty ON p.ID = pm_stock_qty.post_id AND pm_stock_qty.meta_key = '_stock'
LEFT JOIN wp_postmeta pm_manage_stock ON p.ID = pm_manage_stock.post_id AND pm_manage_stock.meta_key = '_manage_stock'
WHERE p.post_type = 'product' AND p.post_status = 'publish';" > data2.json

# Clean up temporary files
rm product_ids.json

end=$(date +%s%N)
execution_time=$(( ($end - $start) / 1000000 ))

echo "MySQL data written to data2.json"
echo "Total execution time: ${execution_time}ms"
