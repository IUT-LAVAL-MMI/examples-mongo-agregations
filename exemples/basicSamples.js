const { ObjectId } = require('mongodb');

function createMatch() {
  return [
    {
      $match: {
        user: 'rcretinpirolli',
        $or: [
          { unitPrice: { $gte: 22 } },
          { quantity: { $gt: 3 } }
        ],
        $expr: {
          $gt: [ '$paymentDate', '$purchaseDate' ]
        },
      }
    }
  ];
}

function createSet() {
  return [
    {
      $set: {
        totalPrice: {
          $subtract: [
            { $multiply: ['$unitPrice', '$quantity'] },
            { $ifNull: ['$reduction', 0] },
          ],
        },
        'userInfos.identity': {
          $concat: [
            { $trim: { input: '$userInfos.firstname' } },
            ' ',
            { $trim: { input: '$userInfos.lastname' } },
          ],
        },
        'creditDays': {
          $ceil : {
            $divide: [
              { $subtract: ['$paymentDate', '$purchaseDate'] },
              1000*60*60*24
            ]
          }
        },
      },
    },
    {
      $limit: 20,
    }
  ];
}

function createUnset() {
  return [
    {
      $unset: [
        'userInfos.firstname',
        'userInfos.lastname',
      ],
    },
    {
      $limit: 20,
    }
  ];
}

function createProject() {
  return [
    {
      $project: {
        '_id': '$$REMOVE',
        'user': 1,
        'purchaseDate': 1,
        'product': {
          $cond: {
            if: {
              $regexMatch: {
                input: '$category',
                regex: /^sensible/i
              }
            },
            then: '$$REMOVE',
            else: '$product',
          },
        },
      }
    },
    {
      $limit: 20,
    }
  ];
}

function createGroup() {
  return [
    {
      $group: {
        _id: {
          username: '$user',
          year: { $year: '$purchaseDate' },
          month: { $month: '$purchaseDate' },
        },
        meanUnitPrice: { $avg: '$unitPrice' },
        numSales: { $sum: 1 },
      }
    }
  ];
}

function createSort() {
  return [
    {
      $sort: {
        'user': 1,
        'purchaseDate': -1,
      },
    },
    {
      $limit: 200,
    }
  ];
}

function createLimit() {
  return [
    {
      $limit: 5,
    }
  ];
}

Object.defineProperty(createMatch, 'fileName', { value: 'match' });
Object.defineProperty(createSet, 'fileName', { value: 'set' });
Object.defineProperty(createUnset, 'fileName', { value: 'unset' });
Object.defineProperty(createProject, 'fileName', { value: 'project' });
Object.defineProperty(createGroup, 'fileName', { value: 'group' });
Object.defineProperty(createSort, 'fileName', { value: 'sort' });
Object.defineProperty(createLimit, 'fileName', { value: 'limit' });

module.exports = {
  createMatch,
  createSet,
  createUnset,
  createProject,
  createGroup,
  createSort,
  createLimit,
};
