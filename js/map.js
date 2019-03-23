'use strict';

var getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
};

function numberWithSpaces(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

var getPin = function (avatars) {
  var pin = {
    author: {
      avatar: ''
    },
    offer: {
      title: PIN_TITLES[getRandomInt(0, PIN_TITLES.length - 1)],
      address: '',
      price: getRandomInt(1000, 1000000),
      type: PIN_TYPES[getRandomInt(0, PIN_TYPES.length - 1)],
      rooms: getRandomInt(1, 5),
      guests: getRandomInt(1, 30),
      checkin: PIN_CHECK_IN_OUT[getRandomInt(0, PIN_CHECK_IN_OUT.length - 1)],
      checkout: PIN_CHECK_IN_OUT[getRandomInt(0, PIN_CHECK_IN_OUT.length - 1)],
      features: PIN_FEATURES[getRandomInt(0, PIN_FEATURES.length - 1)],
      description: '',
      photos: [],
    },
    location: {
      x: getRandomInt(pinX[0], pinX[1]),
      y: getRandomInt(PIN_Y[0], PIN_Y[1])
    }
  };

  // 'avatar': Адреса изображений не повторяются
  var avatar = 0;

  do {
    avatar = getRandomInt(1, 8);
  } while (avatars.indexOf(avatar) >= 0);

  avatars.push(avatar);
  pin.author.avatar = 'img/avatars/user0' + avatar + '.png';

  // "address": строка, адрес предложения, вида "{{location.x}}, {{location.y}}", например, "600, 350"
  pin.offer.address = pin.location.x + ', ' + pin.location.y;

  // "photos": массив из строк расположенных в произвольном порядке
  var photos = [];
  var photo = '';

  for (var j = 0; j < PIN_PHOTOS.length; j++) {
    do {
      photo = PIN_PHOTOS[getRandomInt(0, PIN_PHOTOS.length - 1)];
    } while (photos.indexOf(photo) >= 0);
    photos[j] = photo;
  }

  pin.offer.photos = photos;

  // "features": массив строк случайной длины из ниже предложенных: "wifi", "dishwasher", "parking", "washer", "elevator", "conditioner",
  var features = [];
  features = PIN_FEATURES.slice();
  features.length = getRandomInt(1, PIN_FEATURES.length);
  pin.offer.features = features;

  return pin;
};

var getPins = function () {
  var pins = [];
  var avatars = [];

  for (var i = 0; i < PINS_NUM; i++) {
    pins[i] = getPin(avatars);
  }

  return pins;
};

var PIN_TITLES = ['Большая уютная квартира', 'Маленькая неуютная квартира', 'Огромный прекрасный дворец', 'Маленький ужасный дворец', 'Красивый гостевой домик', 'Некрасивый негостеприимный домик', 'Уютное бунгало далеко от моря', 'Неуютное бунгало по колено в воде'];
var PIN_TYPES = ['palace', 'flat', 'house', 'bungalo'];
var PIN_TYPES_RUS = ['Дворец', 'Квартира', 'Дом', 'Бунгало'];
var PIN_CHECK_IN_OUT = ['12:00', '13:00', '14:00'];
var PIN_FEATURES = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];
var PIN_PHOTOS = ['http://o0.github.io/assets/images/tokyo/hotel1.jpg', 'http://o0.github.io/assets/images/tokyo/hotel2.jpg', 'http://o0.github.io/assets/images/tokyo/hotel3.jpg'];
var PIN_WIDTH = 50;
var PIN_HEIGHT = 70;
var PIN_Y = [130, 630];
var PINS_NUM = 8;

var map = document.querySelector('.map');
var pinX = [PIN_WIDTH / 2, map.offsetWidth - PIN_WIDTH / 2];

var pins = getPins();

var pinsContainer = document.querySelector('.map__pins');
var filtersContainer = document.querySelector('.map__filters-container');
var pinTemplate = document.querySelector('template').content.querySelector('.map__pin');
var cardTemplate = document.querySelector('template').content.querySelector('.map__card');

for (var i = 0; i < pins.length; i++) {
  var pin = pinTemplate.cloneNode(true);
  var pinImg = pin.querySelector('img');

  pin.style = 'left: ' + (pins[i].location.x - PIN_WIDTH / 2) + 'px; top: ' + pins[i].location.y + 'px;';
  pinImg.src = pins[i].author.avatar;
  pinImg.alt = pins[i].offer.title;

  pinsContainer.appendChild(pin);
}

var card = cardTemplate.cloneNode(true);
card.querySelector('.popup__title').textContent = pins[0].offer.title;
card.querySelector('.popup__avatar').src = pins[0].author.avatar;
card.querySelector('.popup__type').textContent = PIN_TYPES_RUS[PIN_TYPES.indexOf(pins[0].offer.type)];
card.querySelector('.popup__text--address').textContent = pins[0].offer.address;
card.querySelector('.popup__text--time').textContent = 'Заезд после ' + pins[0].offer.checkin + ', выезд до ' + pins[0].offer.checkout;

// Русское название типа
var pinTypeIndex = PIN_TYPES.indexOf(pins[0].offer.type);
card.querySelector('.popup__type').textContent = PIN_TYPES_RUS[pinTypeIndex];

// Цена с разбивкой на пробелы
var price = numberWithSpaces(pins[0].offer.price, 3);
card.querySelector('.popup__text--price').textContent = price + '₽/ночь';

// Выведите количество гостейи комнат offer.rooms и offer.guests
// в блок .popup__text--capacityстрокойвида {{offer.rooms}} комнаты для {{offer.guests}} гостей. Например,2 комнаты для 3 гостей.
var roomsNum = pins[0].offer.rooms;
var roomsNumRemainder = roomsNum % 10;
var guestsNum = pins[0].offer.guests;
var guestsNumRemainder = guestsNum % 10;
var roomsLabel = 'комната';
var guestsLabel = 'гостя';

if (roomsNumRemainder > 1 && roomsNumRemainder < 5) {
  roomsLabel = 'комнаты';
} else if (roomsNumRemainder >= 5) {
  roomsLabel = 'комнат';
}

if (guestsNumRemainder > 1) {
  guestsLabel = 'гостей';
}

card.querySelector('.popup__text--capacity').textContent = roomsNum + ' ' + roomsLabel + ' для ' + guestsNum + ' ' + guestsLabel;

// .popup__features - все доступные удобства в объявлении списком
var features = pins[0].offer.features;
var featureTemplate = cardTemplate.querySelector('.popup__feature');
var featuresList = card.querySelector('.popup__features');

featureTemplate.classList.remove(featureTemplate.classList[1]);
featuresList.innerHTML = '';

for (var j = 0; j < features.length; j++) {
  var featureElement = featureTemplate.cloneNode();
  featureElement.classList.add(featureElement.classList[0] + '--' + features[j]);
}

// .popup__photos - все фотографии из списка offer.photos
var photos = pins[0].offer.photos;
var photoTemplate = cardTemplate.querySelector('.popup__photo');
var photosList = card.querySelector('.popup__photos');

photosList.innerHTML = '';

for (var k = 0; k < photos.length; k++) {
  var photoElement = photoTemplate.cloneNode();
  photoElement.src = photos[k];
  photosList.appendChild(photoElement);
}

// console.log(pins[0]);

map.insertBefore(card, filtersContainer);


map.classList.remove('map--faded');


// Доработать
// "guests": число, случайное количество гостей, которое можно разместить
// "location": { «x»: Значение ограничено раз мерами блока, в котором перетаскивается метка.
// Координаты X и Y, которые вы вставите в разметку, это не координатылевого верхнего угла блока метки, а координаты, на которые указываетметка своим острым концом. Чтобы найти эту координату нужно учестьразмеры элемента с меткой.