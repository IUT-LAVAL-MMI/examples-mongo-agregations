const { ObjectId } = require('mongodb');

function createFullPipeline1() {
  return [
    // On commence par filtrer les achats du mois de fevrier uniquement
    {
      $match: {
        purchaseDate: {
          $gte: new Date('2021-02'),
          $lt: new Date('2021-03'),
        },
      },
    },
    // On calcule pour chaque doc restant la categorie
    {
      $set: {
        categorie: {
          $switch: {
            branches: [
              { case: { $in: ['$category', ['Dessert', 'SensibleDessert'] ] }, then: 'dessert' },
              { case: { $in: ['$category', ['MainCourse', 'SensibleMainCourse'] ] }, then: 'plat principal' },
            ],
            default: null,
          },
        },
      },
    },
    // On retire tous les potentiels docs dont la categorie est null
    {
      $match: {
        categorie: { $ne: null },
      },
    },
    // On calcule pour chaque doc restant les attributs client, et depense
    {
      $set: {
        client: {
          $concat: [
            { $toUpper: { $trim: { input: '$userInfos.lastname' } } },
            ' ',
            { $trim: { input: '$userInfos.firstname' } },
          ],
        },
        depense: {
          $subtract: [
            { $multiply: ['$unitPrice', '$quantity'] },
            { $ifNull: ['$reduction', 0] },
          ],
        },
      },
    },
    // On groupe les documents par utilisateur et catégorie, et on calcules
    // les 3 métriques d'aggrégation ainsi que la date d'achat min et la date d'achat max
    {
      $group: {
        _id: {
          client: '$client',
          categorie: '$categorie',
        },
        moyenneDepenses: { $avg: '$depense' },
        totalReduction: { $sum: '$reduction' },
        nbExemplairesAchetes: { $sum: '$quantity' },
        minPurchaseDate: { $min: '$purchaseDate' },
        maxPurchaseDate: { $max: '$purchaseDate' },
      },
    },
    // - Calcul sur les documents générés de la différence de temps entre maxPurchaseDate
    //   et minPurchaseDate en jours
    // - Arrondie de la moyenne de dépense
    // - Reformatage du document : on "extrait" de l'_id les attributs client et categorie,
    {
      $set: {
        periodeAchat: {
          $ceil : {
            $divide: [
              { $subtract: ['$maxPurchaseDate', '$minPurchaseDate'] },
              1000*60*60*24
            ]
          }
        },
        moyenneDepenses: {
          $round: ['$moyenneDepenses', 2],
        },
        client: '$_id.client',
        categorie: '$_id.categorie',
      },
    },
    // Reformatage du document : retrait de _id, minPurchaseDate et maxPurchaseDate
    {
      $unset: ['_id', 'minPurchaseDate', 'maxPurchaseDate'],
    },
    // Tri par categorie croissante puis par moyenne de dépense décroissante
    {
      $sort: {
        categorie: 1,
        moyenneDepenses: -1,
      },
    }
  ];
}

Object.defineProperty(createFullPipeline1, 'fileName', { value: 'fullPipeline' });

module.exports = {
  createFullPipeline1,
};
