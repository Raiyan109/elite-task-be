import { RequestOrderModel } from './requestOrder.model';
import { IRequestOrder } from './requestOrder.interface';
import { Types } from 'mongoose';
import { checkProductAvailability } from '../../utils/checkAvailability';
import { IProductInterface } from '../Product/product.interface';

// CREATE RequestOrder
const postRequestOrderService = async (payload: IRequestOrder): Promise<IRequestOrder> => {
    const existingRequestOrder = await RequestOrderModel.findOne({ user_id: payload.user_id, requestOrder_status: "pending" });

    if (existingRequestOrder) {
        // const alreadyExists = existingRequestOrder.product_id.includes(payload.product_id as any);

        // if (alreadyExists) {
        //     throw new Error('Product already in requestOrder');
        // }

        existingRequestOrder.product_id.push(payload.product_id as any);
        await existingRequestOrder.save();
        return existingRequestOrder;
    } else {
        const newRequestOrder = await RequestOrderModel.create({
            user_id: payload.user_id,
            product_id: [payload.product_id],
        });
        return newRequestOrder;
    }
};

// GET RequestOrder (by user ID)
const getRequestOrderService = async (userId: Types.ObjectId): Promise<any | undefined> => {
    const result = await RequestOrderModel.findOne({ user_id: userId, requestOrder_status: "pending" }).populate('product_id');
    // const productsWithAvailability = result?.product_id.map(product => ({
    //     ...product,
    //     availability: checkProductAvailability(product as IProductInterface)
    // }))
    // console.log(productsWithAvailability);
    // const productsWithAvailability = result?.product_id.flatMap(productDoc => {
    //     const product = (productDoc as any).toObject(); // Convert from Mongoose doc to plain JS object

    //     return {
    //         ...product,
    //         availability: checkProductAvailability(product as IProductInterface)
    //     };
    // });

    // return productsWithAvailability;

    if (!result) return undefined;

    // Convert Mongoose doc to plain object
    const requestOrder = result.toObject();

    // Replace product_id array with enriched version
    requestOrder.product_id = requestOrder.product_id.map((product: any) => {
        return {
            ...product,
            availability: checkProductAvailability(product as IProductInterface),
        };
    });

    return requestOrder;

};

// GET RequestOrder (by user ID)
const getRequestOrderDashboardService = async (userId: Types.ObjectId): Promise<any | undefined> => {
    const result = await RequestOrderModel.find()
        .populate('product_id', '-meta_title -meta_description -meta_keywords -product_is_delivery_dhaka_only')
        .populate('user_id')

    return result;
};


// UPDATE RequestOrder (replace product list for a user)
const updateRequestOrderService = async (
    product_id: string,
    updatedData: Partial<IRequestOrder>
): Promise<IRequestOrder | null> => {
    console.log(product_id, 'product_id');

    const result = await RequestOrderModel.findOneAndUpdate(
        { product_id },
        { $set: updatedData },
        { new: true }
    );
    return result;
};

// update request order by admin
const updateRequestOrderByAdminService = async (payload: Partial<IRequestOrder>) => {
    const { _id, ...updateData } = payload;

    if (!_id || !Types.ObjectId.isValid(_id)) {
        throw new Error("Invalid request order ID");
    }

    // Ensure it exists
    const existingOrder = await RequestOrderModel.findById(_id);
    if (!existingOrder) {
        throw new Error("Request Order not found");
    }

    // Apply update
    const updatedOrder = await RequestOrderModel.findByIdAndUpdate(
        _id,
        { $set: updateData },
        { new: true, runValidators: true }
    )
    // .populate("product_id")
    // .populate("user_id")
    // .populate("requestOrder_updatedBy")
    // .populate("requestOrder_details.product_id");

    return updatedOrder;
};

// Remove RequestOrder 
const removeFromRequestOrderService = async (userId: string, productId: string): Promise<IRequestOrder | null> => {
    const requestOrder = await RequestOrderModel.findOne({ user_id: userId });

    if (!requestOrder) throw new Error('RequestOrder not found');

    requestOrder.product_id = requestOrder.product_id.filter(
        (id) => id.toString() !== productId
    );

    // 🚨 If requested orders is now empty, delete the requested orders document
    if (requestOrder.product_id.length === 0) {
        await RequestOrderModel.deleteOne({ user_id: userId });
        return null; // or return a message saying "Cart deleted"
    }

    await requestOrder.save();
    return requestOrder;
};


export const RequestOrderServices = {
    postRequestOrderService,
    getRequestOrderService,
    updateRequestOrderService,
    updateRequestOrderByAdminService,
    removeFromRequestOrderService,
    getRequestOrderDashboardService
};
