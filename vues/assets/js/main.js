document.addEventListener("DOMContentLoaded", function(){
    var mapScaled = false;
    var modalImage = document.querySelector("#group-image");
    var modalInfos = document.querySelector("#group-infos");
 
    var screenWidth = window.matchMedia("(min-width: 968px)");
    modalImage.onload = function() {
        resizeModalInfos(screenWidth);
    }
 
    screenWidth.addEventListener("change", function(e) {
        resizeModalInfos(e);
    });

    // Initialisation de la carte
    var map = L.map('modal-map').setView([0, 180], 0);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    var markers = L.layerGroup().addTo(map);

    // Initialisation de la grande carte
    var bigMap = L.map('big-map').setView([0, 180], 0);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(bigMap);
    var bigMarkers = L.layerGroup().addTo(bigMap);

    // Afficher le Modal
    var cards = document.querySelectorAll(".artist-card");
    cards.forEach(card => {
        // Evénement clic du bouton "VOIR"
        card.querySelector(".voir-zone").addEventListener("click", function(){
            // Ajout des données de l'artiste dans le modal
            document.querySelector("#group-image").src = card.querySelector(".artist-image").src;
            document.querySelector("#modal-name").innerHTML = card.querySelector(".artist-name").innerHTML;
            document.querySelector("#modal-creation_date").innerHTML = card.querySelector(".artist-year").innerHTML;
            document.querySelector("#modal-members").innerHTML = card.querySelector(".artist-members").innerHTML;
            document.querySelector("#modal-first_album").innerHTML = card.querySelector(".artist-firstAlbum").innerHTML;
            document.querySelector("#modal-concerts").innerHTML = card.querySelector(".artist-relations").innerHTML;
            // document.querySelector("#modal-map").innerHTML = card.querySelector(".artist-locations").getAttribute("data-location");

            var concertData = {};
            // Get card concerts data
            card.querySelectorAll(".concert-place").forEach(c => {
                concertData.artist = c.getAttribute("data-artist");
                concertData.imageLink = c.getAttribute("data-image");
                var place = c.getAttribute("data-place");
                if (!concertData.concerts) {
                    concertData.concerts = [];                    
                }
                concertData.concerts.push({city: place, dates: goListToJSArray(c.getAttribute("data-dates"))});
            });

            // Affichange du modal
            openModal();
            
            // Géolocalisation
            displayMap(concertData).then(function(){
                document.querySelector("#modal-overlay").style.visibility = "hidden";
            });
        });
    });
    
    document.addEventListener("click", function(event){
        if (event.target.matches("#modal-close") || event.target.matches("#modal")) {
            closeModal();
        }
    });

    document.querySelectorAll("#see-artists, #arrow-scroll-down").forEach(function(element) {
        element.addEventListener("click", function(){
            document.querySelector("#artists").scrollIntoView({behavior: 'smooth'});
        });
    });

    // Grow map
    document.querySelectorAll(".grow-map").forEach(function(b) {
        b.addEventListener("click", function() {
            if (!mapScaled) {
                document.querySelector("#big-map").style.opacity = "1";
                document.querySelector("#big-map").style.visibility = "visible";
                mapScaled = true;
            } else {
                document.querySelector("#big-map").style.opacity = "0";
                document.querySelector("#big-map").style.visibility = "hidden";
                mapScaled = false;
            }
        })
    });
     


    // Fonctions
    // ---------------------------------------------------------------------------
    function resizeModalInfos(e) {
        if (e.matches) {
            modalInfos.style.height = modalImage.offsetHeight+"px";
        }
    }

    function openModal() {
        document.querySelector("#modal").style.visibility = "visible";
        document.querySelector("#modal").style.opacity = "1";
        document.querySelector("#modal").style.backdropFilter = "blur(6px)";
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        document.querySelector("#modal").style.visibility = "hidden";
        document.querySelector("#modal").style.opacity = "0";
        document.querySelector("#modal").style.backdropFilter = "blur(0px)";
        document.body.style.overflow = "auto";
    }

    
    // ---------------------------------------------------------------------------
    // Geocoding function
/*     async function Geocoding(address) {
        var output = null;
        const token = "pk.2f226e3203c56af77056c10e939e3a0a";
        const settings = {
            async: true,
            crossDomain: true,
            url: 'https://us1.locationiq.com/v1/search?key='+token+'&q='+address+'&format=json&',
            method: 'GET'
        };
        
        return new Promise((resolve, reject) => {
            $.ajax(settings).done(function (response) {
                output = {
                    lat : response[0].lat,
                    lon : response[0].lon,
                    name : response[0].display_name,
                };
                resolve(output);
            }).fail(function (error) {
                reject(error);
            });
        });
    } */

    async function FetchCoords(city) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: "/coords",
                data: {
                    ville: city
                },
                success: function(result){
                    let output = {
                        lat : result.lat,
                        lon : result.lon,
                        name : result.display_name,
                    };
                    resolve(output);
                },
                error: function(error){
                    reject('Erreur :', error);
                }
            });
        });
    }
    

    /*
    async function BulkGeocoding(adresses) {
        var output = null;
        const settings = {
            async: true,
            crossDomain: true,
            url: 'https://trueway-geocoding.p.rapidapi.com/Geocode?address='+adresses+'&language=en',
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '0fca6dcab2mshc493be6db351be8p13df6bjsne0859659b3c0',
                'X-RapidAPI-Host': 'trueway-geocoding.p.rapidapi.com'
            }
        };
        
        return new Promise((resolve, reject) => {
            $.ajax(settings).done(function (response) {
                resolve(response);
            }).fail(function (error) {
                reject(error);
            });
        });
    }
    */
    

    async function displayMap(concertData) {
        document.querySelector("#modal-overlay").style.visibility = "visible";
        
        var infos = {};
        for (let p of concertData.concerts) {
            if (!infos[p.city]) {
                infos[p.city] = {};
            }
            
            await FetchCoords(p.city).then(function(res){
                infos[p.city].coords = res;
            });
            infos[p.city].dates = p.dates;
            infos[p.city].artist = concertData.artist;
            infos[p.city].imageLink = concertData.imageLink;
        }
        
        // Vider les marqueurs
        markers.clearLayers();
        bigMarkers.clearLayers();
        
        var allMarkers = [];
        
        // Ajouter les marqueurs à la carte
        for (var el in infos) {
            if (infos.hasOwnProperty(el)){
                var c = infos[el].coords;
                var txt = '<img class="map-picture" src="'+infos[el].imageLink+'"><br>';
                txt += '<b>Artist: </b>'+infos[el].artist+'<br>';
                txt += '<b>City: </b>'+el+'<br>';
                txt += '<b>Dates: </b><br><ul>';
                infos[el].dates.forEach(d=>{
                    txt += '<li>'+d+'</li>';
                });
                txt += '</ul>';

                L.marker([c.lat, c.lon]).addTo(bigMarkers).bindPopup(txt);
                var marker = L.marker([c.lat, c.lon]).addTo(markers).bindPopup(txt);
                allMarkers.push(marker);
            }
        }

        // Créez un objet LatLngBounds vide
        var bounds = L.latLngBounds();

        // Parcourez tous les marqueurs et étendiez les limites à chaque marqueur
        for (var i = 0; i < allMarkers.length; i++) {
            var latlng = allMarkers[i].getLatLng();
            bounds.extend(latlng);
        }

        // Ajustez la vue de la carte pour inclure toutes les limites
        map.fitBounds(bounds);
        bigMap.fitBounds(bounds);
    }

    function goListToJSArray(txt) {
        return txt.replaceAll("[","").replaceAll("]","").split(" ");
    }
 
 });
 