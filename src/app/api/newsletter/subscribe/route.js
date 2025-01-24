import mailchimp from '@mailchimp/mailchimp_marketing';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid email address' }),
        { status: 400 }
      );
    }

    try {
      await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID, {
        email_address: email,
        status: 'subscribed',
      });

      return new Response(
        JSON.stringify({ message: 'Successfully subscribed to our newsletter!' }),
        { status: 200 }
      );
    } catch (error) {
      // Check if the error is because the email is already subscribed
      if (error.status === 400 && error.response.text.includes('Member Exists')) {
        return new Response(
          JSON.stringify({ error: 'You are already subscribed to our newsletter.' }),
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return new Response(
      JSON.stringify({ error: 'Error subscribing to newsletter. Please try again later.' }),
      { status: 500 }
    );
  }
}
