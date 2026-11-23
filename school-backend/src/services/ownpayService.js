const axios = require('axios');

class OwnPayService {
  constructor() {
    this.apiUrl = process.env.OWNPAY_API_URL;
    this.apiKey = process.env.OWNPAY_API_KEY;
    this.webhookSecret = process.env.OWNPAY_WEBHOOK_SECRET;
  }

  /**
   * Create a checkout session in OwnPay
   * @param {Object} paymentData
   * @returns {Promise<Object>} checkout data with redirect URL
   */
  async createCheckout(paymentData) {
    try {
      const response = await axios.post(`${this.apiUrl}/v1/checkout/create`, {
        amount: paymentData.amount, // in paise
        currency: paymentData.currency || 'INR',
        reference_id: paymentData.referenceId, // Our Bill ID or Payment ID
        description: paymentData.description,
        callback_url: paymentData.callbackUrl,
        customer: {
          name: paymentData.customerName,
          email: paymentData.customerEmail,
          phone: paymentData.customerPhone
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('OwnPay Checkout Error:', error.response ? error.response.data : error.message);
      throw new Error('Failed to initiate payment with OwnPay');
    }
  }

  /**
   * Verify webhook signature from OwnPay
   * @param {string} signature
   * @param {Object} payload
   * @returns {boolean}
   */
  verifyWebhookSignature(signature, payload) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const digest = hmac.update(JSON.stringify(payload)).digest('hex');
    return signature === digest;
  }
}

module.exports = new OwnPayService();
