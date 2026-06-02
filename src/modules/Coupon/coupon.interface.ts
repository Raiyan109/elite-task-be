export interface ICoupon {
    coupon_code: string;
    coupon_start_date: string;
    coupon_end_date: string;
    coupon_discount_amount: number;
    coupon_min_order: number;
    coupon_status: 'active' | 'expired' | 'in-active'
}

// export const couponSearchableField = [
//     'coupon_code',
//     'coupon_min_order'
// ]

export const couponSearchableField = [
    { field: "coupon_code", type: "string" },
    { field: "coupon_min_order", type: "number" },
    { field: "coupon_discount_amount", type: "number" },
];