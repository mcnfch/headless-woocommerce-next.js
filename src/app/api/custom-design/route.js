import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// Initialize the WooCommerce API client
const WooCommerce = WooCommerceRestApi.default;
const api = new WooCommerce({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL,
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY,
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET,
  version: "wc/v3"
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const formType = formData.get('formType');

    // Base order data with customer information
    const orderData = {
      status: 'processing',
      payment_method: 'bacs',
      payment_method_title: 'Custom Design Order',
      billing: {
        first_name: formData.get('customerName').split(' ')[0] || '',
        last_name: formData.get('customerName').split(' ').slice(1).join(' ') || '',
        email: formData.get('customerEmail'),
        phone: formData.get('customerPhone') || ''
      },
      shipping: {
        first_name: formData.get('customerName').split(' ')[0] || '',
        last_name: formData.get('customerName').split(' ').slice(1).join(' ') || ''
      },
      meta_data: [
        {
          key: 'custom_design_type',
          value: formType
        }
      ]
    };

    // Add form-specific data
    switch (formType) {
      case 'modify':
        orderData.meta_data.push(
          {
            key: 'original_design_url',
            value: formData.get('designUrl')
          },
          {
            key: 'target_product',
            value: formData.get('targetProduct')
          },
          {
            key: 'notes',
            value: formData.get('notes')
          }
        );
        break;

      case 'upload':
        orderData.meta_data.push(
          {
            key: 'design_name',
            value: formData.get('designName')
          },
          {
            key: 'product_type',
            value: formData.get('productType')
          }
        );
        // Handle file upload here
        const file = formData.get('file');
        if (file) {
          // TODO: Implement file storage
          orderData.meta_data.push({
            key: 'has_design_file',
            value: 'yes'
          });
        }
        break;

      case 'custom':
        orderData.meta_data.push(
          {
            key: 'design_vision',
            value: formData.get('vision')
          },
          {
            key: 'product_type',
            value: formData.get('productType')
          },
          {
            key: 'notes',
            value: formData.get('notes')
          }
        );
        // Handle reference files here
        const referenceFiles = formData.getAll('referenceFiles');
        if (referenceFiles.length > 0) {
          // TODO: Implement file storage
          orderData.meta_data.push({
            key: 'has_reference_files',
            value: 'yes'
          });
        }
        break;
    }

    // Create the order
    const response = await api.post('orders', orderData);

    return Response.json({
      success: true,
      orderId: response.data.id,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to create order'
      },
      { status: 500 }
    );
  }
}
