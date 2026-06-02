"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponSearchableField = void 0;
// export const couponSearchableField = [
//     'coupon_code',
//     'coupon_min_order'
// ]
exports.couponSearchableField = [
    { field: "coupon_code", type: "string" },
    { field: "coupon_min_order", type: "number" },
    { field: "coupon_discount_amount", type: "number" },
];
