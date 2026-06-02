// payment.utils.ts
import axios from "axios"
import dotenv from 'dotenv'

dotenv.config()



export const initialPayment = async (paymentData: any) => {
    const response = await axios.post(process.env.PAYMENT_URL!, {
        store_id: process.env.STORE_ID,
        signature_key: process.env.SIGNATURE_KEY,
        tran_id: paymentData.transactionId,
        success_url: `https://sports-facility-booking-platform-be.vercel.app/api/payment/confirmation?transactionId=${paymentData.transactionId}&status=success`,
        fail_url: `https://sports-facility-booking-platform-be.vercel.app/api/payment/confirmation?status=failed`,
        cancel_url: "https://sports-facility-booking-platform-fe.vercel.app/",
        amount: paymentData.payableAmount,
        currency: "BDT",
        desc: "Merchant Registration Payment",
        cus_name: paymentData.customerName,
        cus_email: paymentData.customerEmail,
        cus_add1: paymentData.customerAddress,
        cus_add2: "N/A",
        cus_city: "N/A",
        cus_state: "N/A",
        cus_postcode: "N/A",
        cus_country: "N/A",
        cus_phone: paymentData.customerPhone,
        type: "json"
    })

    return response.data
}


export const verifyPayment = async (tnxId: string) => {

    try {
        const response = await axios.get(process.env.PAYMENT_VERIFY_URL!, {
            params: {
                store_id: process.env.STORE_ID,
                signature_key: process.env.SIGNATURE_KEY,
                type: "json",
                request_id: tnxId
            }
        });

        return response.data;
    }
    catch (err) {
        throw new Error("Payment validation failed!")
    }
}