# Modèle de document d'un achat

## Exemple de document BSON mongo
```
{
  "_id": "620ace647f7bccd0c872ad9e",
  "user": "rcretinpirolli",
  "userInfos": {
    "firstname": "   Raphaëlle     ",
    "lastname": "    Crétin-Pirolli"
  },
  "purchaseDate": "2021-02-17T19:27:45.050Z",
  "paymentDate": "2021-03-15T09:01:31.451Z",
  "product": "Secrete cake",
  "category": "SensibleDessert",
  "quantity": 4,
  "unitPrice": 35.2,
  "reduction": 7.04
}
```

## Description

- **_id** *[ObjectId]* : L'identifiant du document
- **user** *[String]* : Utilisateur (username)
- **userInfos.firstname** *[String]* : Prénom de l'utilisateur (impropre : peut contenir des espaces en début ou fin)
- **userInfos.lastname** *[String]* : Nom de famille de l'utilisateur (impropre : peut contenir des espaces en début ou fin)
- **purchaseDate** *[Date]* : Date de vente
- **product** *[String]* : Produit acheté
- **category** *[String]* : Catégorie du produit
- **quantity** *[int]* : Nombre d'exemplaires achetés
- **unitPrice** *[Double]* : Date de fin attendue
- **reduction** *[Double?]* : Réduction sur la vente globale (peut ne pas exister)
