import { ShopService } from './shop.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class ShopController {
    private readonly shopService;
    constructor(shopService: ShopService);
    getProducts(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string;
        deviceType: import(".prisma/client").$Enums.DeviceType | null;
        category: string;
        price: number;
        stock: number;
        images: string[];
        features: string[];
        sizes: string[];
        colors: string[];
        isFeatured: boolean;
        rating: number | null;
        reviewCount: number;
    }[]>;
    getProduct(slug: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string;
        deviceType: import(".prisma/client").$Enums.DeviceType | null;
        category: string;
        price: number;
        stock: number;
        images: string[];
        features: string[];
        sizes: string[];
        colors: string[];
        isFeatured: boolean;
        rating: number | null;
        reviewCount: number;
    }>;
    createOrder(user: any, dto: CreateOrderDto): Promise<{
        user: {
            id: string;
            email: string;
            passwordHash: string | null;
            name: string;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            emailVerified: boolean;
            appleHealthToken: string | null;
            googleFitToken: string | null;
            fcmToken: string | null;
            phone: string | null;
            lastActiveAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        items: ({
            product: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                description: string;
                deviceType: import(".prisma/client").$Enums.DeviceType | null;
                category: string;
                price: number;
                stock: number;
                images: string[];
                features: string[];
                sizes: string[];
                colors: string[];
                isFeatured: boolean;
                rating: number | null;
                reviewCount: number;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            size: string | null;
            color: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        totalAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        discountAmount: number;
        promoCode: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue;
        paymentId: string | null;
        paymentMethod: string | null;
        trackingNumber: string | null;
        notes: string | null;
        ringSize: string | null;
    }>;
    getMyOrders(user: any): Promise<({
        items: ({
            product: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                description: string;
                deviceType: import(".prisma/client").$Enums.DeviceType | null;
                category: string;
                price: number;
                stock: number;
                images: string[];
                features: string[];
                sizes: string[];
                colors: string[];
                isFeatured: boolean;
                rating: number | null;
                reviewCount: number;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            size: string | null;
            color: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        totalAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        discountAmount: number;
        promoCode: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue;
        paymentId: string | null;
        paymentMethod: string | null;
        trackingNumber: string | null;
        notes: string | null;
        ringSize: string | null;
    })[]>;
    getOrderById(user: any, id: string): Promise<{
        items: ({
            product: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                description: string;
                deviceType: import(".prisma/client").$Enums.DeviceType | null;
                category: string;
                price: number;
                stock: number;
                images: string[];
                features: string[];
                sizes: string[];
                colors: string[];
                isFeatured: boolean;
                rating: number | null;
                reviewCount: number;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            size: string | null;
            color: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        totalAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        discountAmount: number;
        promoCode: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue;
        paymentId: string | null;
        paymentMethod: string | null;
        trackingNumber: string | null;
        notes: string | null;
        ringSize: string | null;
    }>;
    getAdminOrders(page: number, limit: number, status?: any, search?: string): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            totalAmount: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            discountAmount: number;
            promoCode: string | null;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            paymentId: string | null;
            paymentMethod: string | null;
            trackingNumber: string | null;
            notes: string | null;
            ringSize: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAdminOrderDetail(id: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        items: ({
            product: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                description: string;
                deviceType: import(".prisma/client").$Enums.DeviceType | null;
                category: string;
                price: number;
                stock: number;
                images: string[];
                features: string[];
                sizes: string[];
                colors: string[];
                isFeatured: boolean;
                rating: number | null;
                reviewCount: number;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            size: string | null;
            color: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        totalAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        discountAmount: number;
        promoCode: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue;
        paymentId: string | null;
        paymentMethod: string | null;
        trackingNumber: string | null;
        notes: string | null;
        ringSize: string | null;
    }>;
    updateOrderStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        totalAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        discountAmount: number;
        promoCode: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue;
        paymentId: string | null;
        paymentMethod: string | null;
        trackingNumber: string | null;
        notes: string | null;
        ringSize: string | null;
    }>;
}
