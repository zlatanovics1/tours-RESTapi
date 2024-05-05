class ApiFeatures {
  constructor(modelQuery, reqQuery) {
    this.modelQuery = modelQuery;
    this.reqQuery = reqQuery;
  }

  filter() {
    const queryObj = { ...this.reqQuery };

    const excludedFields = ['sort', 'page', 'fields', 'limit'];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.modelQuery = this.modelQuery.find(JSON.parse(queryStr));

    return this;
  }
  sort() {
    if (this.reqQuery.sort) {
      //sort=price,duration
      const sortQuery = this.reqQuery.sort.split(',').join(' ');
      this.modelQuery = this.modelQuery.sort(sortQuery);
    } else {
      const sortQueryDefaults = '-createdAt';
      this.modelQuery = this.modelQuery.sort(sortQueryDefaults);
    }

    return this;
  }
  limitFields() {
    if (this.reqQuery.fields) {
      const fields = this.reqQuery.fields.split(',').join(' ');
      this.modelQuery = this.modelQuery.select(fields);
    }
    this.modelQuery = this.modelQuery.select('-__v');
    return this;
  }
  paginate() {
    const currentPage = +this.reqQuery.page || 1;
    const limit = +this.reqQuery.limit || 100;
    const skipFirstXResults = (currentPage - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skipFirstXResults).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;
