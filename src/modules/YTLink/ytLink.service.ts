import httpStatus from 'http-status';
import { IYTLink } from './ytLink.interface';
import { YTLinkModel } from './ytLink.model';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';


// Create YTLinks
const createYTLinkServices = async (ytLink: IYTLink) => {
  const isYTLinkExists = await YTLinkModel.findOne({ name: ytLink.ytLink_link })
  if (isYTLinkExists) {
    throw new AppError(httpStatus.CONFLICT, 'This ytLink is already exists!');
  }
  const result = await YTLinkModel.create(ytLink)
  return result
};

// Find YTLinks
const findYTLinksServices = async (queryParams: Record<string, unknown>) => {
  const modelQuery = YTLinkModel.find({ ytLink_status: "active" }).sort({ ytLink_serial: 1 }) // Initial Mongoose query

  const query = new QueryBuilder(modelQuery, queryParams)
    .search(['ytLink_link']) // Provide searchable fields
    // .filter()
    .sort()
    .paginate()
  // .fields();

  const result = await query.modelQuery; // Execute the query
  // const result = await query.modelQuery.sort({ sequence: 1 }); // Execute the query
  return result;
};

// find all dashboard YTLinks
export const findAllDashboardYTLinkServices = async (queryParams: Record<string, unknown>) => {
  const modelQuery = YTLinkModel.find().sort({ ytLink_serial: 1 });

  const query = new QueryBuilder(modelQuery, queryParams)
    .search(['ytLink_link', 'ytLink_status']) // Provide searchable fields
    // .filter()
    .sort()
    .paginate()
  // .fields();

  const totalCount = await YTLinkModel.countDocuments(query.modelQuery.getFilter());

  const result = await query.modelQuery; // Execute the query
  return {result, totalCount};
};

// Update YTLinks
const updateYTLinkServices = async (ytLink: IYTLink, _id: string): Promise<IYTLink | any> => {
  const updateYTLinkInfo = await YTLinkModel.findOne({ _id: _id });
  if (!updateYTLinkInfo) {
    return {};
  }
  const Brand = await YTLinkModel.findByIdAndUpdate({ _id: _id },
    { $set: ytLink }, // ✅ This ensures only provided fields are updated
    { new: true, runValidators: true, context: "query" }
  );
  return Brand;
};

// Delete a YTLink
export const deleteYTLinkServices = async (_id: string): Promise<IYTLink | any> => {
  const updateYTLinkInfo = await YTLinkModel.findOne({ _id: _id });
  if (!updateYTLinkInfo) {
    throw new AppError(httpStatus.NOT_FOUND, 'YTLink does not exist!');
  }
  const YTLink = await YTLinkModel.findByIdAndDelete({ _id: _id }
  );
  return YTLink;
};

export const YTLinkService = {
  createYTLinkServices,
  findYTLinksServices,
  updateYTLinkServices,
  findAllDashboardYTLinkServices,
  deleteYTLinkServices
};