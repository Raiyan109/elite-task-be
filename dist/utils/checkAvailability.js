"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProductAvailability = void 0;
const checkProductAvailability = (product) => {
    // Early return for active products
    if (product.product_status === "active") {
        return { isAvailable: true };
    }
    // Early return for permanently inactive products
    if (product.product_status === "in-active") {
        return { isAvailable: false };
    }
    // Handle temporary inactive products with time window
    if (product.product_status === "temporary-in-active" &&
        product.product_inactivity_start &&
        product.product_inactivity_end) {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeInMinutes = currentHours * 60 + currentMinutes;
        const [startHour, startMinute] = product.product_inactivity_start.split(':').map(Number);
        const [endHour, endMinute] = product.product_inactivity_end.split(':').map(Number);
        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;
        // Handle overnight time ranges (e.g., 22:00 to 08:00)
        if (startTimeInMinutes > endTimeInMinutes) {
            if (currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes < endTimeInMinutes) {
                return {
                    isAvailable: false,
                    message: `This item cannot be ordered now, please wait until ${product.product_inactivity_end}`
                };
            }
        }
        else {
            if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
                return {
                    isAvailable: false,
                    message: `This item cannot be ordered now, please wait until ${product.product_inactivity_end}`
                };
            }
        }
        // If we're in temporary-in-active but outside the inactive time window
        return { isAvailable: true };
    }
    // Default case for "in-active" status
    return { isAvailable: false };
};
exports.checkProductAvailability = checkProductAvailability;
