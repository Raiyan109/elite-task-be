"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QueryBuilder {
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    search(searchableFields) {
        var _a;
        const rawSearchTerm = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.searchTerm;
        // console.log('raw >>>>>>>>>', rawSearchTerm);
        const searchTerm = typeof rawSearchTerm === 'string' ? rawSearchTerm.toLowerCase() : undefined;
        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map(field => ({
                    [field]: { $regex: searchTerm, $options: 'i' },
                }
                // {
                //     [field]: { $regex: transliteratedTerm, $options: 'i' },
                // }
                )),
            });
        }
        return this;
    }
    sort() {
        var _a, _b, _c;
        const sortFields = ((_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.sort) === null || _b === void 0 ? void 0 : _b.split(',')) === null || _c === void 0 ? void 0 : _c.join(' ')) || '-createdAt';
        // Apply both dynamic sorting and static sorting
        this.modelQuery = this.modelQuery.sort(Object.assign({ brand_serial: 1 }, (sortFields ? { [sortFields]: 1 } : {})));
        return this;
    }
    paginate() {
        var _a, _b;
        const searchTerm = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.searchTerm;
        const page = Number((_b = this === null || this === void 0 ? void 0 : this.query) === null || _b === void 0 ? void 0 : _b.page) || 1;
        const limit = Number(this === null || this === void 0 ? void 0 : this.query.limit) || 50;
        const skip = (page - 1) * limit;
        if (searchTerm) {
            const page = 1;
            const limit = 10;
            const skip = (page - 1) * limit;
            this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        }
        else {
            this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        }
        return this;
    }
    filter() {
        const queryObj = Object.assign({}, this.query);
        queryObj['status'] = 'active';
        // filtering
        const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);
        this.modelQuery = this.modelQuery.find(queryObj);
        return this;
    }
}
exports.default = QueryBuilder;
