const title = document.querySelector(".title");
const content = document.querySelector(".content");
const addBtn = document.querySelector(".addBtn");
const form = document.querySelector(".form");
const list = document.getElementById("list");
//geolocation
let map, mapEvent, geocoder, address, newList, lat, lng;
if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;

      const coords = [latitude, longitude];

      // show map
      map = L.map("map").setView(coords, 17);

      L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution:
          'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      }).addTo(map);
      ///搜尋
      geocoder = L.Control.geocoder({
        defaultMarkGeocode: false,
      }).addTo(map);
      geocoder.on("markgeocode", function (e) {
        const { center } = e.geocode; // 獲取地理編碼的中心座標
        const { lat, lng } = center;

        // 移動地圖到編碼結果的位置
        map.setView([lat, lng], 17);
      });
      //點擊地圖取得地址
      map.on("click", function (e) {
        mapEvent = e;
        form.classList.add("active");
        title.focus();
        // 取得地址
        L.Control.Geocoder.nominatim().reverse(
          e.latlng,
          map.options.crs.scale(map.getZoom()),
          function (results) {
            // console.log(results[0].center.lat);
            lat = results[0].center.lat;
            // console.log(results[0].center.lng);
            lng = results[0].center.lng;
            console.log(results);
            address =
              results[0].properties.address.city +
              results[0].properties.address.suburb +
              results[0].properties.address.road;

            console.log("Address:", address);
          },
          this
        );
      });

      //比例尺
      L.control
        .scale({
          metric: true, // 控制公制單位(m/km)顯示
          imperial: false,
        })
        .addTo(map);

      // 創建 MarkerClusterGroup
      const markerClusterGroup = L.markerClusterGroup().addTo(map);

      // list
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        inputText();
        //display marker on map
        console.log(mapEvent);
        const { lat, lng } = mapEvent.latlng;

        // 添加到 MarkerClusterGroup
        const marker = L.marker([lat, lng]);
        markerClusterGroup.addLayer(marker);
        // popup content
        const popupContent = `<h4>🚩 ${title.value}</h4>`;

        // set popup content on marker
        marker
          .bindPopup(popupContent, {
            autoClose: false,
            closeOnClick: false,
          })
          .openPopup();
        //clear input
        title.value = content.value = "";
      });
    },
    function () {
      alert("could not get your position");
    }
  );

//add list
const inputText = function () {
  const id = new Date().getTime();
  const titleText = title.value;
  const contentText = content.value;
  const newList = document.createElement("li");
  newList.classList.add("list");
  newList.setAttribute("data-id", id);
  newList.setAttribute("data-lat", lat);
  newList.setAttribute("data-lng", lng);
  newList.innerHTML = `<h3 class="title" data-id="${id}">🍽️ ${titleText}</h3>
    <section class="sectionText" data-id="${id}">
      <p class="location">📌 ${address}</p>
      <p class="content">💬 ${contentText}</p>
    </section>`;

  document.querySelector("ul").appendChild(newList);
  form.classList.remove("active");
};

//move map
list.addEventListener("click", function (e) {
  const listEl = e.target.closest(".list");
  //   console.log(listEl);
  if (!listEl) return;

  const lat = listEl.getAttribute("data-lat");

  const lng = listEl.getAttribute("data-lng");

  map.setView([lat, lng], 17, {
    animate: true,
    pan: {
      duraction: 1,
    },
  });
});
