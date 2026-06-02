import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import { IWebSettings } from "./webSettings.interface";
import { WebSettingsModel } from "./webSettings.model";
import httpStatus from "http-status";


// Create Settings
const createSettingsServices = async (settings: IWebSettings) => {
    const isSettingsExists = await WebSettingsModel.findOne({ name: settings.title })
    if (isSettingsExists) {
        throw new AppError(httpStatus.CONFLICT, 'This settings is already exists!');
    }
    const result = await WebSettingsModel.create(settings)
    return result
};

// Find Settings
const getSettingsServices = async () => {
    const result = await WebSettingsModel.find();
    return result[0];
};

// Update Settings
const updateSettingsServices = async (payload: Partial<IWebSettings>) => {
    
    const updatedSettings = await WebSettingsModel.findOneAndUpdate({}, payload, {
        new: true,
        runValidators: true,
    });
    console.log(updatedSettings, 'updatedSettings from service');
    if (!updatedSettings) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update settings');
    }

    return updatedSettings;
};


export const WebSettingsService = {
    createSettingsServices,
    getSettingsServices,
    updateSettingsServices
};