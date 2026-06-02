import AppError from "../../errors/AppError";
import { checkProductAvailability } from "../../utils/checkAvailability";
import { IHotDeal } from "./hotDeal.interface";
import { HotDealModel } from "./hotDeal.model";
import httpStatus from "http-status";

const createHotDealServices = async (hotDeal: IHotDeal) => {
    const isHotDealExists = await HotDealModel.findOne({ name: hotDeal.hotDeal_title })
    if (isHotDealExists) {
        throw new AppError(httpStatus.CONFLICT, 'This hotDeal is already exists!');
    }
    const result = await HotDealModel.create(hotDeal)
    return result
};

// const findHotDealServices = async () => {
//     const currentDate = new Date();

//     const result = await HotDealModel.find({ hotDeal_status: 'active', hotDeal_end_date: { $gte: currentDate } }).populate('hotDeal_products.product_id')
//     return result[0]
// }
const findHotDealServices = async () => {
    const currentDate = new Date();

    const hotDeal = await HotDealModel
        .find({ hotDeal_status: 'active', hotDeal_end_date: { $gte: currentDate } })
        //.populate('hotDeal_products.product_id')
        .populate({
            path: 'hotDeal_products.product_id',
            match: { product_status: { $in: ['active', 'temporary-in-active'] } }, // ✅ only active products
        })
        .lean()

    const response = hotDeal.map(deal => {
        const hotDeal_products = deal.hotDeal_products.filter((p) => p.product_id && typeof p.product_id === "object" && "product_name" in p.product_id).map(product => { //filter out null products from hotdeals
            const prod = product.product_id;

            if (prod && typeof prod === 'object' && 'product_name' in prod) {
                const product_id = {
                    ...product.product_id,
                    availability: checkProductAvailability(prod),

                }
                return {
                    product_id,
                    discount_amount: product.discount_amount ?? 0,
                }
            }
        });

        return {
            hotDeal_title: deal.hotDeal_title,
            hotDeal_description: deal.hotDeal_description,
            hotDeal_slug: deal.hotDeal_slug,
            hotDeal_start_date: deal.hotDeal_start_date,
            hotDeal_end_date: deal.hotDeal_end_date,
            hotDeal_status: deal.hotDeal_status,
            hotDeal_image: deal.hotDeal_image,
            hotDeal_image_key: deal.hotDeal_image_key,
            hotDeal_products
        };
    });

    return response[0];
}

const findDashboardHotDealServices = async () => {
    const result = await HotDealModel.find({}).populate({
        path: 'hotDeal_products.product_id',
        select: 'product_name thumbnail_image product_price product_discount_price product_quantity'
    })
    return result
}

// get single products
const findSingleHotDealServices = async (id: string) => {
    const hotDeal = await HotDealModel.findOne({
        hotDeal_slug: id,
        hotDeal_status: { $in: ['active'] }
    }).populate('hotDeal_products.product_id')
        .select("-__v")
        .lean(); // Use .lean() to return a plain JavaScript object

    if (!hotDeal) {
        throw new AppError(404, "HotDeal Not Found !");
    }

    return { ...hotDeal };
}

// get hotDeals by IDs (cart)
const findHotDealsByIdsServices = async (ids: Array<string>) => {
    const hotDeals = await HotDealModel.find({ _id: { $in: ids } }).populate('hotDeal_products.product_id')
    return hotDeals
}

const updateHotDealServices = async (updateData: Partial<IHotDeal>) => {
    // Since there's only one hot deal, we'll find and update it directly
    const existingHotDeal = await HotDealModel.findOne();

    if (!existingHotDeal) {
        throw new AppError(httpStatus.NOT_FOUND, 'Hot deal not found');
    }

    // Check if title is being updated and if it already exists
    if (updateData.hotDeal_title && updateData.hotDeal_title !== existingHotDeal.hotDeal_title) {
        const isTitleExists = await HotDealModel.findOne({
            hotDeal_title: updateData.hotDeal_title
        });

        if (isTitleExists) {
            throw new AppError(httpStatus.CONFLICT, 'This hot deal title already exists!');
        }
    }

    // Update fields
    const updatedHotDeal = await HotDealModel.findOneAndUpdate(
        {}, // Empty filter since we're updating the only hot deal
        { $set: updateData },
        { new: true, runValidators: true }
    );

    return updatedHotDeal;
};

export const HotDealServices = {
    createHotDealServices,
    findHotDealServices,
    findDashboardHotDealServices,
    findSingleHotDealServices,
    findHotDealsByIdsServices,
    updateHotDealServices
}