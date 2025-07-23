import { env } from "@/env.js"

interface SendSMSParams {
  phoneNumber: string
  message: string
  messageType?: "transactional" | "promotional"
}

interface SMSResponse {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Service for integrating with Rwandan SMS Gateway
 * TODO: Replace with actual SMS gateway API implementation
 */
export class SMSGatewayService {
  private baseUrl = process.env.SMS_GATEWAY_BASE_URL || "https://api.sms-gateway.rw"
  private apiKey = env.SMS_GATEWAY_API_KEY

  /**
   * Sends an SMS message
   */
  async sendSMS({ phoneNumber, message, messageType = "transactional" }: SendSMSParams): Promise<SMSResponse> {
    try {
      // TODO: Implement actual SMS gateway API call
      // Example implementation for a generic SMS gateway:

      const response = await fetch(`${this.baseUrl}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to: phoneNumber,
          message,
          type: messageType,
          sender: "AgriConnect", // Your sender ID
        }),
      })

      if (!response.ok) {
        throw new Error(`SMS API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        messageId: data.messageId,
      }
    } catch (error) {
      console.error("SMS sending error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Sends OTP verification SMS
   */
  async sendOTP(phoneNumber: string, otp: string): Promise<SMSResponse> {
    const message = `Your AgriConnect verification code is: ${otp}. This code expires in 10 minutes.`

    return this.sendSMS({
      phoneNumber,
      message,
      messageType: "transactional",
    })
  }

  /**
   * Sends order notification SMS
   */
  async sendOrderNotification(phoneNumber: string, orderId: string, status: string): Promise<SMSResponse> {
    const message = `AgriConnect: Your order #${orderId} status has been updated to ${status}.`

    return this.sendSMS({
      phoneNumber,
      message,
      messageType: "transactional",
    })
  }

  /**
   * Sends payment confirmation SMS
   */
  async sendPaymentConfirmation(phoneNumber: string, amount: number, orderId: string): Promise<SMSResponse> {
    const message = `AgriConnect: Payment of RWF ${amount} for order #${orderId} has been confirmed.`

    return this.sendSMS({
      phoneNumber,
      message,
      messageType: "transactional",
    })
  }
}

// Export singleton instance
export const smsGateway = new SMSGatewayService()
