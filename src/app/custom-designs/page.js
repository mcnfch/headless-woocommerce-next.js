'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CustomDesigns() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e, formType) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const form = e.target;
      const formData = new FormData();
      formData.append('formType', formType);

      // Add contact information for all forms
      formData.append('customerName', form.querySelector('input[name="customerName"]').value);
      formData.append('customerEmail', form.querySelector('input[name="customerEmail"]').value);
      formData.append('customerPhone', form.querySelector('input[name="customerPhone"]').value);

      // Collect form data based on type
      switch (formType) {
        case 'modify':
          formData.append('designUrl', form.querySelector('input[type="url"]').value);
          formData.append('targetProduct', form.querySelector('input[name="targetProduct"]').value);
          formData.append('notes', form.querySelector('textarea').value || '');
          break;

        case 'upload':
          formData.append('designName', form.querySelector('input[name="designName"]').value);
          formData.append('productType', form.querySelector('input[name="productType"]').value);
          const uploadFile = form.querySelector('input[type="file"]').files[0];
          if (uploadFile) {
            formData.append('file', uploadFile);
          }
          break;

        case 'custom':
          formData.append('vision', form.querySelector('textarea[name="vision"]').value);
          formData.append('productType', form.querySelector('input[name="productType"]').value);
          formData.append('notes', form.querySelector('textarea[name="notes"]').value || '');
          const referenceFiles = form.querySelector('input[type="file"]').files;
          for (let i = 0; i < referenceFiles.length; i++) {
            formData.append('referenceFiles', referenceFiles[i]);
          }
          break;
      }

      // Send to our API
      const response = await fetch('/api/custom-design', {
        method: 'POST',
        body: formData, // Send as FormData instead of JSON
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to submit design request');
      }

      const result = await response.json();

      // Redirect to success page with order ID
      router.push(`/custom-designs/success?orderId=${result.orderId}`);

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error.message || 'Failed to submit design request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ContactFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-black font-medium mb-2">Your Name*</label>
        <input
          type="text"
          name="customerName"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
          placeholder="Full Name"
        />
      </div>
      <div>
        <label className="block text-black font-medium mb-2">Email*</label>
        <input
          type="email"
          name="customerEmail"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
          placeholder="email@example.com"
        />
      </div>
      <div>
        <label className="block text-black font-medium mb-2">Phone Number</label>
        <input
          type="tel"
          name="customerPhone"
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
          placeholder="(555) 555-5555"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#FF6EC7] via-[#6A82FB] to-[#FFD200] py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Custom Designs</h2>
            <p className="text-xl text-white mb-8">Create your perfect festival outfit with our custom design service</p>
          </div>
        </div>
      </section>

      {/* Custom Design Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-black text-center mb-12">Choose Your Design Path</h2>
          
          {submitError && (
            <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
              {submitError}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Option 1: Modify Existing Design */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col h-full">
              <h3 className="text-xl font-semibold text-black mb-4">Modify Existing Design</h3>
              <form onSubmit={(e) => handleSubmit(e, 'modify')} className="flex flex-col flex-grow">
                <div className="space-y-4 flex-grow">
                  <ContactFields />
                  <div>
                    <label className="block text-black font-medium mb-2">Design URL*</label>
                    <input
                      type="url"
                      name="designUrl"
                      placeholder="https://groovygallerydesigns.com/product/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                      required
                    />
                    <p className="text-sm text-gray-900 mt-1">Copy the URL of the product with the design you like</p>
                  </div>
                  <div>
                    <label className="block text-black font-medium mb-2">Target Product*</label>
                    <input
                      type="text"
                      name="targetProduct"
                      placeholder="e.g., Hoodie, T-Shirt, Tank Top"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-black font-medium mb-2">Additional Notes</label>
                    <textarea
                      rows="3"
                      name="notes"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                    ></textarea>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 mt-6 disabled:bg-purple-300"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>

            {/* Option 2: Upload Own Design */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col h-full">
              <h3 className="text-xl font-semibold text-black mb-4">Upload Your Design</h3>
              <form onSubmit={(e) => handleSubmit(e, 'upload')} className="flex flex-col flex-grow">
                <div className="space-y-4 flex-grow">
                  <ContactFields />
                  <div>
                    <label className="block text-black font-medium mb-2">Design Name*</label>
                    <input
                      type="text"
                      name="designName"
                      placeholder="Name your design"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-black font-medium mb-2">Upload File*</label>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg"
                      className="w-full text-black"
                      required
                    />
                    <p className="text-sm text-gray-900 mt-1">Supported: PNG, JPG, SVG</p>
                  </div>
                  <div>
                    <label className="block text-black font-medium mb-2">Product Type*</label>
                    <input
                      type="text"
                      name="productType"
                      placeholder="e.g., Hoodie, T-Shirt, Tank Top"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="copyright"
                      required
                      className="mr-2"
                    />
                    <label htmlFor="copyright" className="text-sm text-black">
                      I confirm this design is non-copyrighted
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 mt-6 disabled:bg-purple-300"
                >
                  {isSubmitting ? 'Submitting...' : 'Upload Design'}
                </button>
              </form>
            </div>

            {/* Option 3: Custom Design */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col h-full">
              <h3 className="text-xl font-semibold text-black mb-4">Work with Our Designers</h3>
              <form onSubmit={(e) => handleSubmit(e, 'custom')} className="flex flex-col flex-grow">
                <div className="space-y-4 flex-grow">
                  <ContactFields />
                  <div>
                    <label className="block text-black font-medium mb-2">Your Vision*</label>
                    <textarea
                      rows="3"
                      name="vision"
                      placeholder="Describe your design idea"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-black font-medium mb-2">Reference Images</label>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg"
                      multiple
                      className="w-full text-black"
                    />
                    <p className="text-sm text-gray-900 mt-1">Optional: Upload reference images</p>
                  </div>
                  <div>
                    <label className="block text-black font-medium mb-2">Product Type*</label>
                    <input
                      type="text"
                      name="productType"
                      placeholder="e.g., Hoodie, T-Shirt, Tank Top"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-black font-medium mb-2">Additional Notes</label>
                    <textarea
                      rows="2"
                      name="notes"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                    ></textarea>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 mt-6 disabled:bg-purple-300"
                >
                  {isSubmitting ? 'Submitting...' : 'Start Design Process'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
