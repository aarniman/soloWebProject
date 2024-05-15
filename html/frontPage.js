window.onscroll = function () { scrollFunction() };

const header = document.getElementById("myHeader");

const sticky = header.offsetTop;

const restaurants = [];
const coords = [];

(async function () {
  try {
    Promise.all([getUserLocation(), getRestaurants()]).then(() => {
      console.log("All promises resolved");

      restaurants.forEach((r) => {
        r.distance = map.distance([coords[0], coords[1]], [r.location.coordinates[1], r.location.coordinates[0]]) / 1000;
      });

      restaurants.sort((a, b) => a.distance - b.distance);
      console.log("Restaurants sorted by distance: ", restaurants);
      refreshRestaurants();
    });
  } catch (error) {
    console.error(error);
  }
})();

const elementMaker = (type, text = "", id) => {
  const element = document.createElement(type);
  element.textContent = text;
  element.id = id;
  return element;
}

// Function to refresh restaurants

const refreshRestaurants = () => {
  markergroup.clearLayers();
  const marker = L.marker(coords);
  marker.bindPopup("You are here");
  marker.addTo(markergroup);
  const list = elementMaker("ul", "", "restaurant-list");
  restaurants.forEach((r) => {
    var greenIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    const modal = elementMaker("div", "", "modal");
    document.body.appendChild(modal);
    const marker = L.marker([r.location.coordinates[1], r.location.coordinates[0]], { icon: greenIcon });
    marker.bindPopup("<b>" + r.name + "</b><br>" + r.address + ", " + r.city + "<br>" + r.distance.toFixed(3) + " km<br>");
    marker.on("click", () => {
      console.log("Nyt mua painetaan AUTS")
      createMenu(r, modal);
    });
    marker.addTo(markergroup);

    const li = elementMaker("ul");
    li.onclick = () => {
      map.setView([r.location.coordinates[1], r.location.coordinates[0]], 15);
    };
    li.appendChild(elementMaker("li", r.name));
    li.appendChild(elementMaker("li", r.distance.toFixed(2) + " km"));
    li.appendChild(elementMaker("li", r.address + ", " + r.city));
    list.appendChild(li);
  });
  document.getElementById("restaurant-list").replaceWith(list);
};
// Function to fetch restaurants

async function getRestaurants() {
  try {
    await fetch('https://10.120.32.94/restaurant/api/v1/restaurants', { signal: AbortSignal.timeout(5000) })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        data.forEach((r) => {
          restaurants.push(r);
        });
      });
    return Promise.resolve("Restaurants fetched");
  } catch (error) {
    console.error(error);
  }
}

// Function to get Restaurants daily/weekly menu

const getMenu = async (id) => {

  const responseDaily = await fetch(`https://10.120.32.94/restaurant/api/v1/restaurants/daily/${id}/fi`)
    .then(response => response.json());
  if (responseDaily.courses == null) {
    responseDaily.error = "Daily NOPE";
  };

  const responseWeekly = await fetch(`https://10.120.32.94/restaurant/api/v1/restaurants/weekly/${id}/fi`)
    .then(response => response.json());
  if (responseWeekly.days == null) {
    responseWeekly.error = "Weekly NOPE";
  };

  return Promise.all([responseDaily, responseWeekly]);
};

// Function to create menu

const createMenu = async (restaurant, modal) => {
  const menuContainer = document.getElementById("menu-container");
  const dailyList = document.getElementById("daily-menu");
  dailyList.innerHTML = "";
  const weeklyList = document.getElementById("weekly-menu");
  weeklyList.innerHTML = "";
  let dailyMenu = [];
  let weeklyMenu = [];

  getMenu(restaurant._id).then((response) => {
    if (response) {
      const [daily, weekly] = [response[0], response[1]];

      if (daily.error) {
        dailyMenu.appendChild(elementMaker("li", "No daily menu available"));
      } else {
        daily.courses.forEach((course) => {
          dailyMenu.push(course);
        });
      }
      console.log("Nyt menee dailymenu!")
      dailyMenu.forEach((course) => {
        const dish = document.createElement("li");
        dish.textContent = course.name
        const details = document.createElement("ul");
        dish.appendChild(details);
        if (course.price) {
          const price = document.createElement("li");
          price.textContent = course.price;
          details.appendChild(price);
        };
        if (course.dietary) {
          const dietary = document.createElement("li");
          dietary.textContent = "Dietary: " + course.diets;
          details.appendChild(dietary);
        };
        dailyList.appendChild(dish);
      });

      if (weekly.error) {
        weeklyList.appendChild(elementMaker("li", "No weekly menu available"));
      } else {
        weekly.date
      }
      weekly.days.forEach((day) => {
        const oneday = document.createElement("li");
        oneday.textContent = day.date;
        weeklyList.appendChild(oneday);
        const daydishes = document.createElement("ul");
        oneday.appendChild(daydishes);
        day.courses.forEach((course) => {
          const dish = document.createElement("li");
          const priceElement = course.price ? course.price : "No price available";
          const dietary = course.dietary ? " | " + course.dietary : "";
          dish.textContent = (course.name + " | " + priceElement + dietary);
          daydishes.appendChild(dish);
        });
      });
      console.log("Nyt menee weeklymenu!")
    } else {
      dailyMenu.appendChild(elementMaker("li", "Failed to fetch menu"));
      weeklyMenu.appendChild(elementMaker("li", "Failed to fetch menu"));
    }
  });
};

// Functions to get user location

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}
function success(pos) {
  coords.push(pos.coords.latitude, pos.coords.longitude);
  map.setView(coords, 13);
  console.log(coords);
}
async function getUserLocation() {
  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };
  try {
    console.log("Fetching user position...");
    navigator.geolocation.getCurrentPosition(success, error, options);
    Promise.resolve("User position fetched");
  } catch (error) {
    console.error(error);
  }
};

