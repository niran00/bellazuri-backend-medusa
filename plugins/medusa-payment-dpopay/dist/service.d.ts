import { AbstractPaymentProvider, PaymentSessionStatus } from "@medusajs/framework/utils";
declare class DpoPayProvider extends AbstractPaymentProvider {
    static identifier: string;
    constructor(container: any, options: any);
    initiatePayment(input: any): Promise<any>;
    authorizePayment(data: any): Promise<{
        status: PaymentSessionStatus;
        data: any;
    }>;
    capturePayment(data: any): Promise<{
        data: any;
    }>;
    cancelPayment(data: any): Promise<{
        data: any;
    }>;
    deletePayment(data: any): Promise<{
        data: any;
    }>;
    getPaymentStatus(data: any): Promise<{
        status: PaymentSessionStatus;
    }>;
    retrievePayment(data: any): Promise<{
        data: any;
    }>;
    updatePayment(data: any): Promise<{
        data: any;
    }>;
    refundPayment(data: any): Promise<{
        data: any;
    }>;
    getWebhookActionAndData(): Promise<{
        action: any;
        data: {
            session_id: string;
            amount: number;
        };
    }>;
}
export default DpoPayProvider;
