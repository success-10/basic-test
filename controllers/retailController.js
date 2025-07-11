const Retail = require('../models/Retail');

// Upload retail data
exports.createRetail = async (req, res, next) => {
    try {
      const retail = await Retail.create({
        ...req.body,
        uploadedBy: req.user._id,
      });
      res.status(201).json(retail);
    } catch (error) {
      next(error);
    }
  };
  

// Get all retail data
exports.getAllRetail = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const data = await Retail.find()
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'name');

    // Format each document
    const formattedData = data.map((item) => {
      // Convert to plain object to edit fields
      const obj = item.toObject();

      // Format uploadDate to just date string
      obj.uploadDate = obj.uploadDate
        ? new Date(obj.uploadDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : null;
      return obj;
    });

    const total = await Retail.countDocuments();

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

  


// delete retail data
exports.deleteRetail = async (req, res, next) => {
    try {
      const retail = await Retail.findById(req.params.id);
  
      if (!retail) {
        return res.status(404).json({ message: 'Retail data not found' });
      }
  
      await retail.deleteOne();
      res.json({ message: 'Retail data deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

// search functionality for retail data.
exports.searchRetail = async (req, res, next) => {
    try {
      const { search, fillingStation, region, state, product, uploadedBy, date, page, limit } = req.query;

  
      let query = {};
  
      if (fillingStation) {
        query.fillingStation = { $regex: fillingStation, $options: 'i' };
      }
      if (region) {
        query.region = { $regex: region, $options: 'i' };
      }
      if (state) {
        query.state = { $regex: state, $options: 'i' };
      }
      if (product) {
        query.product = { $regex: product, $options: 'i' };
      }
      if (uploadedBy) {
        query.uploadedBy = uploadedBy;
      }
      if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);
        query.createdAt = { $gte: start, $lt: end };
      }
  
      // Convert page and limit to integers
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      // Query first, but do not execute yet
      let dataQuery = Retail.find(query).populate('uploadedBy', 'name -_id');

      // Execute count for pagination info
      const total = await Retail.countDocuments(query);

      // Apply pagination
      let data = await dataQuery.skip(skip).limit(limitNumber);
  
      // Additional free text search
      if (search) {
      data = data.filter(item =>
      (item.uploadedBy?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.fillingStation || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.region || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.state || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.product || "").toLowerCase().includes(search.toLowerCase())
    );
}


    // Format uploadDate
      data = data.map(item => {
        const obj = item.toObject();
        obj.uploadDate = obj.createdAt
          ? new Date(obj.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : null;
        delete obj.createdAt;
        delete obj.updatedAt;
        return obj;
      });
  
      res.json(data);
    } catch (error) {
      next(error);
    }
  };
  
const formatPerformance = (rawPerf) => {
  if (rawPerf == null) return null;
  const rounded = Math.round((rawPerf + Number.EPSILON) * 100) / 100;
  const sign = rounded > 0 ? '+' : rounded < 0 ? '–' : '';
  const absStr = Math.abs(rounded).toFixed(2);
  return `${sign}${absStr}%`;
};

exports.getCurrentPrices = async (req, res, next) => {
  try {
    const products = await Retail.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$product",
          prices: { $push: "$retailPrice" },
        }
      }
    ]);

    const result = products.map(p => {
      const current = p.prices[0];
      const prev = p.prices[1] ?? null;
      const rawPerf = prev !== null ? ((current - prev) / prev) * 100 : null;
      return {
        product: p._id,
        currentPrice: current,
        performance: formatPerformance(rawPerf),
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};




exports.getRetailAnalysis = async (req, res, next) => {
  try {
    const { product, region, state, range } = req.query;

    let query = {};

    if (product) query.product = product;
    if (region) query.region = { $regex: region, $options: "i" };
    if (state) query.state = { $regex: state, $options: "i" };

    // Add proper date range logic here
    if (range) {
      const now = new Date();
      let startDate;

      switch (range) {
        case "1D":
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case "1W":
          startDate = new Date();
          startDate.setDate(now.getDate() - 7);
          break;
        case "1M":
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "3M":
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "6M":
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "YTD":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "All":
          startDate = null; // No filter
          break;
        default:
          startDate = null; // No filter
      }

      if (startDate) {
        query.createdAt = { $gte: startDate, $lte: now };
      }
    }

    const data = await Retail.find(query)
      .sort({ createdAt: 1 })
      .select("retailPrice createdAt -_id");

    // Format createdAt to only date string
    const formattedData = data.map(item => ({
      retailPrice: item.retailPrice,
      date: item.createdAt ? item.createdAt.toISOString().split("T")[0] : null,
    }));

    res.json(formattedData);
  } catch (error) {
    next(error);
  }
};

//search functionality on the analysis page
exports.searchAnalysisRetail = async (req, res, next) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let matchQuery = {};

    if (search) {
      matchQuery.product = { $regex: search, $options: 'i' };
    }

    // Find distinct products matching query
    const productNames = await Retail.distinct("product", matchQuery);

    const paginatedProductNames = productNames.slice(skip, skip + limit);

    const results = await Promise.all(
      paginatedProductNames.map(async (productName) => {
        // Find latest record for this product
        const latest = await Retail.findOne({ product: productName })
          .sort({ createdAt: -1 });

        // Find previous record for this product (before latest)
        const previous = await Retail.findOne({ product: productName, createdAt: { $lt: latest.createdAt } })
          .sort({ createdAt: -1 });

        const currentPrice = latest ? latest.retailPrice : 0;
        const prevPrice = previous ? previous.retailPrice : currentPrice;

        let performance = 0;
        if (previous && prevPrice !== 0) {
          performance = ((currentPrice - prevPrice) / prevPrice) * 100;
        }

        // Format with + or - and two decimal places
        const performanceFormatted = `${performance >= 0 ? '+' : ''}${performance.toFixed(2)}%`;

        return {
          product: productName,
          currentPrice,
          performance: performanceFormatted,
        };
      })
    );

    res.json({
      total: productNames.length,
      page,
      pages: Math.ceil(productNames.length / limit),
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllProductsWithPerformance = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get all distinct product names
    const productNames = await Retail.distinct("product");

    // Apply pagination to product names
    const paginatedProductNames = productNames.slice(skip, skip + limit);

    const results = await Promise.all(
      paginatedProductNames.map(async (productName) => {
        // Get latest record
        const latest = await Retail.findOne({ product: productName })
          .sort({ createdAt: -1 });

        // Get previous record
        const previous = await Retail.findOne({ product: productName, createdAt: { $lt: latest.createdAt } })
          .sort({ createdAt: -1 });

        const currentPrice = latest ? latest.retailPrice : 0;
        const prevPrice = previous ? previous.retailPrice : currentPrice;

        let performance = 0;
        if (previous && prevPrice !== 0) {
          performance = ((currentPrice - prevPrice) / prevPrice) * 100;
        }

        // Format performance with + or - sign
        const performanceFormatted = `${performance >= 0 ? '+' : ''}${performance.toFixed(2)}%`;

        return {
          product: productName,
          currentPrice,
          performance: performanceFormatted,
        };
      })
    );

    res.json({
      total: productNames.length,
      page,
      pages: Math.ceil(productNames.length / limit),
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

