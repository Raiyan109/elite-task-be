import AppError from "../../errors/AppError";
import statusCodes from 'http-status';
import { AddressModel } from "./address.model";
import { IAddress } from "./address.interface";

// Create Address
const postAddressService = async (
    payload: IAddress
): Promise<IAddress> => {

    const result = await AddressModel.create(payload);
    return result;
};


//get Address info
const getAddressService = async () => {
    const result = await AddressModel.find().populate('user_id');
    return result;
};

// update Address info
const updateAddressService = async (
    AddressId: string,
    payload: Partial<IAddress>
): Promise<any> => {
    const result = await AddressModel.findByIdAndUpdate({ _id: AddressId }, payload, {
        new: true, // returns the updated doc
        runValidators: true,
    });
    return result;
};

// delete Address info
export const deleteAddressService = async (_id: string): Promise<IAddress | any> => {

    const AddressInfo = await AddressModel.findById({ _id: _id });

    if (!AddressInfo) {
        throw new AppError(statusCodes.NOT_FOUND, 'Address does not exist!');
    }
    const result = await AddressModel.findByIdAndDelete({ _id: _id }
    );
    return result;
};

// find addresses by user id
const findAddressesByUserIdServices = async (user_id: string) => {
    const addresses = await AddressModel.find({ user_id }).populate('user_id').lean();

    const totalAddresses = addresses.length;

    return {
        totalAddresses,
        addresses,
    };
};

export const AddressServices = {
    postAddressService,
    getAddressService,
    updateAddressService,
    deleteAddressService,
    findAddressesByUserIdServices
};