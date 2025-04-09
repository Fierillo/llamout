'use server';

interface SendySubscribeResponse {
    success: boolean;
    message: string;
  }
  
  export async function subscribeToSendy(email: string, name: string, listId: string): Promise<SendySubscribeResponse> {
    try {
      const sendyUrl = process.env.NEXT_SENDY_URL;
      const apiKey = process.env.NEXT_SENDY_API_KEY;

      if (!sendyUrl || !apiKey) {
        throw new Error('Sendy configuration is missing');
      }
  
      if (!email || !listId) {
        return {
          success: false,
          message: 'Email and listId are required'
        };
      }
  
      const formData = new URLSearchParams({
        api_key: apiKey,
        email: email,
        name: name,
        list: listId,
        boolean: 'true'
      });
  
      const response = await fetch(`${sendyUrl}/sendy/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });
  
      const result = await response.text();
  
      if (result === '1' || result.toLowerCase().includes('already subscribed')) {
        return {
          success: true,
          message: 'Subscription successful'
        };
      }
  
      return {
        success: false,
        message: result
      };
  
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }