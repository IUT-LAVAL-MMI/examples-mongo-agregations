const COLLECTION_NAME = 'sales';

const USERS = [
  ["Rémi", "Venant", "rvenant"],
  ["Sébastien", "Iksal", "siksal"],
  ["Christophe", "Choquet", "cchoquet"],
  ["Raphaëlle", "Crétin-Pirolli", "rcretinpirolli"]
]

const MAX_USER_FIELD_SPACES = 5;

const DATE_RANGE = [
  Date.parse('2021-01-01'),
  Date.parse('2021-03-01')
]

const MAX_PAYMENT_DATE_DELTA_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const PRODUCTS = [
  ['Chocolate frozen cheesecake', 'Dessert', 21.0],
  ['Apple Pie', 'Dessert', 17.0],
  ['Trianon', 'Dessert', 21.5],
  ['Cacao and chili lobster', 'MainCourse', 22.0],
  ['Cider and apple duck', 'MainCourse', 18.0],
  ['Bretain fisher green curry', 'MainCourse', 20.0],
  ['Secrete cake', 'SensibleDessert', 35.2],
  ['Lover eclair', 'SensibleDessert', 12.5],
  ['Sensual turbot filet', 'SensibleMainCourse', 24.0],
]

const QUANTITY_RANGE = [1, 5];

const REDUCTIONS_PERCENT = [5, 8, 10, 12];

function MyMath(randomNumberGenerator) {
  this.rng = randomNumberGenerator;
}

MyMath.prototype.getRandomIntMaxExclusive = function(min, max) {
  return Math.floor(this.rng.quick() * (max - min) + min);
};

MyMath.prototype.getRandomDateMaxExclusive = function(minDate, maxDate) {
  return new Date(this.getRandomIntMaxExclusive(minDate, maxDate));
};

MyMath.prototype.getRandomBoolean = function() {
  return this.rng.quick() < 0.5 ? true : false;
};

MyMath.prototype.getRandomArrayElement = function(array) {
  const idx = this.getRandomIntMaxExclusive(0, array.length);
  return array[idx];
};

/*
Générateur de fonction "d'écrasement"
 */
function createMash() {
  let n = 0xefc8249d; // noyau initial

  let mash = function(data) {
    data = String(data); // on force la représentation du param entre String, quel qu'il soit
    for (let i = 0; i < data.length; i++) { // pour chaque caractère de la chaine
      n += data.charCodeAt(i); // on rajoute à n le code caractère (number)
      let h = 0.02519603282416938 * n; // calcul pour faire bouger les bits de poids faible ?
      n = h >>> 0; // n reprend uniquement la représentation des 32 derniers bit
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}

/*
Générateur de nombre aléatoire sous forme d'un float 32bits
 */
function NumberGenerator(seed) {
  let mash = createMash();
  // Initialisation de l'état
  // Apply the seeding algorithm from Baagoe.
  this.c = 1;
  this.s0 = mash(' ');
  this.s1 = mash(' ');
  this.s2 = mash(' ');
  this.s0 -= mash(seed);
  if (this.s0 < 0) {
    this.s0 += 1;
  }
  this.s1 -= mash(seed);
  if (this.s1 < 0) {
    this.s1 += 1;
  }
  this.s2 -= mash(seed);
  if (this.s2 < 0) {
    this.s2 += 1;
  }
}

// Méthode de passage au nombre aléatoire suivant
NumberGenerator.prototype.next = function() {
  let t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
  this.s0 = this.s1;
  this.s1 = this.s2;
  this.c = t | 0; //this.c = partie entière de t
  this.s2 = t - this.c; // this.s2 = partie décimale de t
  return this.s2;
}

// Pour la récupération/sauvegarde de l'état interne du générateur
Object.defineProperty(NumberGenerator.prototype, 'state', {
  get: function state() {
    return {
      c: this.c,
      s0: this.s0,
      s1: this.s1,
      s2: this.s2,
    }
  },
  set: function state(st) {
    if (typeof(state) !== 'object') {
      throw new Error('Wrong state');
    }
    this.c = st.c || 0;
    this.s0 = st.s0 || 0;
    this.s1 = st.s1 || 0;
    this.s2 = st.s2 || 0;
  }
});

/*
Générateur de nombres aléatoire
 */
function Prng(seed, options) {
  this.numberGenerator = new NumberGenerator(seed);
  if (options && options.state) {
    this.numberGenerator.state = options.state;
  }
}

//32 bits of randomness in a float
Prng.prototype.quick = function() {
  return this.numberGenerator.next();
}

//32 bit (signed) integer
Prng.prototype.int32 = function() {
  return (this.numberGenerator.next() * 0x100000000) | 0;
}

//56 bits of randomness
Prng.prototype.double = function() {
  return this.numberGenerator.next() + (this.numberGenerator.next() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
}

function createRandomSpace(myMath) {
  return ' '.repeat(myMath.getRandomIntMaxExclusive(0, MAX_USER_FIELD_SPACES + 1));
}

function createDocument(myMath) {
  const user = myMath.getRandomArrayElement(USERS);
  const purchaseDate = myMath.getRandomDateMaxExclusive(...DATE_RANGE);
  const paymentDate = myMath.getRandomDateMaxExclusive(purchaseDate.getTime(), purchaseDate.getTime() + MAX_PAYMENT_DATE_DELTA_MS);
  const product = myMath.getRandomArrayElement(PRODUCTS);
  const quantity = myMath.getRandomIntMaxExclusive(...QUANTITY_RANGE);
  const reductionPercent = myMath.getRandomBoolean() ? myMath.getRandomArrayElement(REDUCTIONS_PERCENT) : 0;


  const doc = {
    user: user[2],
    userInfos: {
      firstname: createRandomSpace(myMath) + user[0] + createRandomSpace(myMath),
      lastname: createRandomSpace(myMath) + user[1] + createRandomSpace(myMath),
    },
    purchaseDate,
    paymentDate,
    product: product[0],
    category: product[1],
    quantity,
    unitPrice: product[2]
  };

  if (reductionPercent) {
    const reduction = product[2] * quantity * reductionPercent / 100;
    doc['reduction'] = Math.round(reduction * 100.) / 100.;
  }

  return doc;
}

function main() {
  const nbElements = 500;
  const myPrng = new Prng('asjeref34ed');
  const myMath = new MyMath(myPrng);

  print("Simcatch traces insertion...");
  db[COLLECTION_NAME].insertMany(Array(nbElements).fill(null).map(() => createDocument(myMath)));
}

main();
