import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { IOffer } from "./offer.interface";
import { OfferModel } from "./offer.model";
import httpStatus from "http-status";

const createOfferServices = async (offer: IOffer) => {
    const isOfferExists = await OfferModel.findOne({ name: offer.offer_title })
    if (isOfferExists) {
        throw new AppError(httpStatus.CONFLICT, 'This offer is already exists!');
    }
    const result = await OfferModel.create(offer)
    return result
};

const findAllOfferServices = async () => {
    const result = await OfferModel.find({}).populate('offer_product.product_id')
    return result
}

const findWeekdayOfferServices = async () => {
    const result = await OfferModel.find({}).populate('offer_product.product_id')
    return result
}

const findDashboardOfferServices = async (queryParams: Record<string, unknown>) => {
    const modelQuery = OfferModel.find({}).sort({ _id: 1 }).populate('offer_product.product_id')

    const query = new QueryBuilder(modelQuery, queryParams)
        .search(['offer_title', 'offer_label']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate()
    // .fields();

    const totalCount = await OfferModel.countDocuments(query.modelQuery.getFilter());

    const offers = await query.modelQuery; // Execute the query

    return { offers, totalCount }
}

// get single offer
const findSingleOfferServices = async (id: string) => {
    const offer = await OfferModel.findOne({
        offer_slug: id,
        offer_status: { $in: ['active'] }
    }).populate('offer_product.product_id')
        .select("-__v")
        .lean(); // Use .lean() to return a plain JavaScript object

    if (!offer) {
        throw new AppError(404, "Offer Not Found !");
    }

    return { ...offer };
}

// get offers by IDs (cart)
const findOffersByIdsServices = async (ids: Array<string>) => {
    const offers = await OfferModel.find({ _id: { $in: ids } }).populate('offer_product.product_id')
    return offers
}

export const OfferServices = {
    createOfferServices,
    findWeekdayOfferServices,
    findDashboardOfferServices,
    findSingleOfferServices,
    findOffersByIdsServices,
    findAllOfferServices,

}