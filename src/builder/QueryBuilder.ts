import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public query: Record<string, unknown>;

    constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    search(searchableFields: string[]) {
        const rawSearchTerm = this?.query?.searchTerm;
        // console.log('raw >>>>>>>>>', rawSearchTerm);
        const searchTerm = typeof rawSearchTerm === 'string' ? rawSearchTerm.toLowerCase() : undefined;

        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map(
                    field =>
                        (
                            {
                                [field]: { $regex: searchTerm, $options: 'i' },

                            }
                            // {
                            //     [field]: { $regex: transliteratedTerm, $options: 'i' },
                            // }
                        ) as FilterQuery<T>
                ),
            });
        }

        return this;
    }

    sort() {
        const sortFields = (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';

        // Apply both dynamic sorting and static sorting
        this.modelQuery = this.modelQuery.sort({ brand_serial: 1, ...(sortFields ? { [sortFields]: 1 } : {}) });

        return this;
    }

    paginate() {
        const searchTerm = this?.query?.searchTerm;
        const page = Number(this?.query?.page) || 1;
        const limit = Number(this?.query.limit) || 50;
        const skip = (page - 1) * limit;

        if (searchTerm) {
            const page = 1;
            const limit = 10;
            const skip = (page - 1) * limit;
            this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        } else {
            this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        }
        return this;
    }

    filter() {
        const queryObj = { ...this.query };
        queryObj['status'] = 'active';

        // filtering
        const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];

        excludeFields.forEach(el => delete queryObj[el]);

        this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
        return this;
    }
}

export default QueryBuilder;