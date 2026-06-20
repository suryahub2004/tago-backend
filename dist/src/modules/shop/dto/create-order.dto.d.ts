export declare class ShippingAddressDto {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pinCode: string;
}
export declare class CreateOrderDto {
    productId: string;
    quantity: number;
    ringSize?: string;
    shippingAddress: ShippingAddressDto;
    paymentMethod: string;
    paymentId?: string;
    notes?: string;
}
