import { Collection, Favorite, Product, ProductView } from '../models/index.js';

function daysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

async function topProductsByCollection(Model, productField = 'product', limit = 8) {
  const rows = await Model.aggregate([
    { $group: { _id: `$${productField}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        productId: { $toString: '$_id' },
        count: 1,
        name: '$product.name',
        slug: '$product.slug',
        productType: '$product.productType',
        status: '$product.status',
      },
    },
  ]);

  return rows.map((row) => ({
    productId: row.productId,
    count: row.count,
    name: row.name || 'Unknown plate',
    slug: row.slug || null,
    productType: row.productType || null,
    status: row.status || null,
  }));
}

/**
 * Phase 15 — basic staff analytics from existing ProductView / Favorite / Collection data.
 * No new tracking schema; informational archive signals only.
 */
export async function getAdminAnalytics() {
  const since7 = daysAgo(7);
  const since30 = daysAgo(30);

  const [
    viewsTotal,
    viewsLast7Days,
    viewsLast30Days,
    favoritesTotal,
    collectionsTotal,
    productsApproved,
    productsPending,
    topViewed,
    topFavorited,
    viewsBySource,
    collectionObjectSum,
  ] = await Promise.all([
    ProductView.countDocuments(),
    ProductView.countDocuments({ createdAt: { $gte: since7 } }),
    ProductView.countDocuments({ createdAt: { $gte: since30 } }),
    Favorite.countDocuments(),
    Collection.countDocuments(),
    Product.countDocuments({ status: 'approved', deletedAt: null }),
    Product.countDocuments({ status: 'pending', deletedAt: null }),
    topProductsByCollection(ProductView, 'product', 8),
    topProductsByCollection(Favorite, 'product', 8),
    ProductView.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Collection.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: ['$objectCount', 0] } } } },
    ]),
  ]);

  const objectsInCollections = collectionObjectSum[0]?.total || 0;

  return {
    generatedAt: new Date().toISOString(),
    views: {
      total: viewsTotal,
      last7Days: viewsLast7Days,
      last30Days: viewsLast30Days,
      bySource: viewsBySource.map((row) => ({
        source: row._id || 'other',
        count: row.count,
      })),
      topProducts: topViewed,
    },
    favorites: {
      total: favoritesTotal,
      topProducts: topFavorited,
    },
    collections: {
      total: collectionsTotal,
      objectsSaved: objectsInCollections,
    },
    catalog: {
      productsApproved,
      productsPending,
    },
    disclaimer:
      'Informational archive signals only — not a guarantee of traffic, demand, or market outcome.',
  };
}
