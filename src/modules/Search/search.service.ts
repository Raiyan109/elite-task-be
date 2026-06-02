import { ISearch } from './search.interface';
import { SearchModel } from './search.model';

// POST: Create a new search entry
const postSearchService = async (payload: ISearch): Promise<ISearch> => {
    const result = await SearchModel.create(payload);
    return result;
};

// GET: Retrieve all search history by user
const getSearchesByUserService = async (userId: string): Promise<ISearch[]> => {
    const result = await SearchModel.find({ user_id: userId }).sort({ searchedAt: -1 });
    return result;
};

export const SearchServices = {
    postSearchService,
    getSearchesByUserService,
};
