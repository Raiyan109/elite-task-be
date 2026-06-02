import { couponSearchableField, ICoupon } from "./coupon.interface";
import { CouponModel } from "./coupon.model";

export const createCouponService = async (payload: ICoupon): Promise<ICoupon> => {
    const result = await CouponModel.create(payload);
    return result;
};

export const getAllCouponsService = async (): Promise<ICoupon[]> => {
    const result = await CouponModel.find();
    return result;
};

// find all dashboard Reviews
export const findAllDashboardCouponServices = async (queryParams: Record<string, unknown>) => {

    const { searchTerm } = queryParams;
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 20;
    const skip = (page - 1) * limit;
    const andCondition = [];
    // if (searchTerm) {
    //     andCondition.push({
    //         $regex: searchTerm,
    //         $options: "i",
    //     });

    // }
    // if (searchTerm) {
    //     andCondition.push({
    //         $or: couponSearchableField.map((field) => ({
    //             [field]: {
    //                 $regex: searchTerm,
    //                 $options: "i",
    //             },
    //         })),
    //     });
    // }
    if (searchTerm) {
        const orConditions: any[] = [];

        couponSearchableField.forEach(({ field, type }) => {
            if (type === "string") {
                orConditions.push({
                    [field]: { $regex: searchTerm, $options: "i" },
                });
            } else if (type === "number" && !isNaN(Number(searchTerm))) {
                orConditions.push({
                    [field]: Number(searchTerm),
                });
            }
        });

        if (orConditions.length) {
            andCondition.push({ $or: orConditions });
        }
    }
    const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
    const result = await CouponModel.find(whereCondition)
        .skip(skip)
        .limit(limit)
        .select("-__v");

    return result
};


export const updateCouponService = async (_id: string, payload: Partial<ICoupon>): Promise<ICoupon | null> => {
    const result = await CouponModel.findByIdAndUpdate(_id, payload, { new: true });
    return result;
};

export const deleteCouponService = async (_id: string): Promise<ICoupon | null> => {
    const result = await CouponModel.findByIdAndDelete(_id);
    return result;
};
