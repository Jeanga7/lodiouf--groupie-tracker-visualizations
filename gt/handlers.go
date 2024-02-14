package gt

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"text/template"
	"time"
)

var BaseURL = "https://groupietrackers.herokuapp.com/api/"
var FileNames = []string{"vues/index.html", "vues/_header.html", "vues/_footer.html", "vues/_search_part.html"}
var ErrorFileNames = []string{"vues/error.html", "vues/_header.html", "vues/_footer.html", "vues/_search_part.html"}

func HandlePage(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		ErrorPage(errors.New("PAGE NOT FOUND"), w, 404)
		return
	}

	switch r.Method {
	case "POST":
		ErrorPage(errors.New("METHOD NOT ALLOWED"), w, 405)
		return

	default:
		tStart := time.Now()
		var data AllData
		parseDone := make(chan struct{})

		go func() {
			Parse(w)
			close(parseDone)
		}()

		<-parseDone

		data.Artists = *Endpoints["artists"].(*[]Artist)
		data.Locations = *Endpoints["locations"].(*Location)
		data.Dates = *Endpoints["dates"].(*Date)
		// data.Relations = RedableRelations(*Endpoints["relation"].(*Relation))
		data.Relations = *Endpoints["relation"].(*Relation)
		data.UniqueCities = UniqueCities(data.Locations.Index)

		allCreationDate, allFirstAlbum := []int{}, []int{}

		for _, val := range data.Artists {
			// data.FinalArtists = append(data.FinalArtists, FinalArtist{val.Id, val.Image, val.Name, []string{strings.Join(val.Members, ", ")}, val.CreationDate, FormatDates([]string{val.FirstAlbum})[0], data.Locations.Index[val.Id-1], data.Dates.Index[val.Id-1], data.Relations.Index[val.Id-1]})
			data.FinalArtists = append(data.FinalArtists, FinalArtist{val.Id, val.Image, val.Name, val.Members, []string{strings.Join(val.Members, ", ")}, val.CreationDate, val.FirstAlbum, data.Locations.Index[val.Id-1], data.Dates.Index[val.Id-1], data.Relations.Index[val.Id-1]})
			firstAlbum, err := strconv.Atoi(strings.Split(val.FirstAlbum, "-")[2])
			if err != nil {
				log.Fatal(err)
			}
			allCreationDate, allFirstAlbum = append(allCreationDate, val.CreationDate), append(allFirstAlbum, firstAlbum)
		}

		data.RangeFirstAlbum, data.RangeCreationDate = GetRange(allFirstAlbum), GetRange(allCreationDate)

		t, err := (template.ParseFiles(FileNames...))
		if err != nil {
			ErrorPage(err, w, http.StatusInternalServerError)
			return
		}
		tmpl := template.Must(t, err)

		err = tmpl.Execute(w, data)
		if err != nil {
			ErrorPage(err, w, http.StatusInternalServerError)
			return
		}

		elapsed := time.Since(tStart)
		log.Printf("Parsing took %.4fs\n", elapsed.Seconds())
	}
}

func GetRange(l []int) Range {
	for i := 0; i < len(l)-1; i++ {
		for j := i; j < len(l); j++ {
			if l[i] > l[j] {
				l[i], l[j] = l[j], l[i]
			}
		}
	}
	return Range{
		Min: l[0] - 1,
		Max: l[len(l)-1] + 1,
	}
}

func FetchCoordsData(city string, places *map[string]Place) {
	for {
		var p []Place
		Geocoding(city, &p)

		if len(p) > 0 {
			(*places)[city] = p[0]
			fmt.Println("✅ ", p[0])
			break
		} else {
			fmt.Printf("❌ Aucune donnée de géocodage reçue pour la ville : %s\n", city)
			time.Sleep(time.Second) // Attendez 1 seconde avant de relancer la requête
		}
	}
}

func StoreCoordsData(cities []string) {
	var places = make(map[string]Place)

	// Lire les données existantes du fichier
	fileBytes, err := os.ReadFile("places.json")
	if err != nil && !os.IsNotExist(err) {
		fmt.Printf("❌ Erreur lors de la lecture du fichier : %s\n", err)
		return
	}

	// Si le fichier existe, démarshaler les données JSON
	if fileBytes != nil {
		err := json.Unmarshal(fileBytes, &places)
		if err != nil {
			fmt.Printf("❌ Erreur lors du démarshaling des données JSON : %s\n", err)
			return
		}
	}

	// Créez un canal pour synchroniser les goroutines
	semaphore := make(chan bool, 2)

	for _, city := range cities {
		// Attendez que deux goroutines soient disponibles avant d'en lancer une nouvelle
		semaphore <- true

		go func(city string) {
			// Libérez le canal une fois la goroutine terminée
			defer func() { <-semaphore }()

			// Vérifier si les données de la ville existent déjà
			if _, ok := places[city]; ok {
				fmt.Println("📁 Données de la ville existantes pour la ville :", city)
				return
			}

			var p []Place
			Geocoding(city, &p)

			if len(p) > 0 && p[0] != (Place{}) {
				fmt.Println("✅ ", p[0])
				places[city] = p[0]

				// Sauvegardez les données dans le fichier
				file, _ := os.Create("places.json")
				defer file.Close()
				encoder := json.NewEncoder(file)
				encoder.Encode(places)
			} else {
				fmt.Printf("❌ Aucune donnée de géocodage reçue pour la ville : %s\n", city)
			}

			// Attendez 1000 millisecondes avant la prochaine requête pour respecter la limitation de 2 requêtes par seconde
			time.Sleep(time.Second)
		}(city)
	}

	// Attendez que toutes les goroutines soient terminées
	for i := 0; i < cap(semaphore); i++ {
		semaphore <- true
	}

	fmt.Println("✅ Succès de chargement de toutes les coordonnées géographiques !")
}

func HandleCoordinates(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/coords" {
		ErrorPage(errors.New("PAGE NOT FOUND"), w, 404)
		return
	}

	switch r.Method {
	case "GET":
		ErrorPage(errors.New("METHOD NOT ALLOWED"), w, 405)
		return
	default:
		// Analysez le formulaire envoyé dans la requête POST
		err := r.ParseForm()
		FrontEndErr(err)

		// Obtenez la valeur de la ville
		city := r.FormValue("ville")

		// Lire les données existantes du fichier
		fileBytes, err := os.ReadFile("places.json")
		if err != nil && !os.IsNotExist(err) {
			fmt.Printf("❌ Erreur lors de la lecture du fichier : %s\n", err)
			return
		}

		// Si le fichier existe, démarshaler les données JSON
		var places = make(map[string]Place)
		if fileBytes != nil {
			err := json.Unmarshal(fileBytes, &places)
			if err != nil {
				fmt.Printf("❌ Erreur lors du démarshaling des données JSON : %s\n", err)
				return
			}

			// Vérifier si les données de la ville existent déjà
			if place, ok := places[city]; ok {
				output, err := json.Marshal(place)
				FrontEndErr(err)

				w.Header().Set("Content-Type", "application/json")
				w.Write(output)
				return
			}
		}

		var p []Place
		Geocoding(city, &p)

		if len(p) > 0 && p[0] != (Place{}) {
			places[city] = p[0]

			// Sauvegardez les données dans le fichier
			file, _ := os.Create("places.json")
			defer file.Close()
			encoder := json.NewEncoder(file)
			encoder.Encode(places)

			output, err := json.Marshal(p)
			FrontEndErr(err)

			w.Header().Set("Content-Type", "application/json")
			w.Write(output)
		} else {
			fmt.Printf("❌ Aucune donnée de géocodage reçue pour la ville : %s\n", city)
		}
	}
}

func Geocoding(location string, data *[]Place) {
	const token = "pk.2f226e3203c56af77056c10e939e3a0a"
	url := "https://us1.locationiq.com/v1/search?key=" + token + "&q=" + location + "&format=json&"

	r, err := http.Get(url)
	FrontEndErr(err)

	defer r.Body.Close()

	apiData, err1 := io.ReadAll(r.Body)
	FrontEndErr(err1)

	err1 = json.Unmarshal(apiData, &data)
	FrontEndErr(err1)
}

func GetLocations(data *Location) {
	url := BaseURL + "locations"

	r, err := http.Get(url)
	FrontEndErr(err)

	defer r.Body.Close()

	apiData, err1 := io.ReadAll(r.Body)
	FrontEndErr(err1)

	err1 = json.Unmarshal(apiData, &data)
	FrontEndErr(err1)
}

func FrontEndErr(err error) {
	if err != nil {
		fmt.Sprint(err)
	}
}

func UniqueCities(i LocationIndex) []string {
	var citiesBool = make(map[string]bool)
	for _, loc := range i {
		for _, city := range loc.Locations {
			citiesBool[city] = true
		}
	}
	var citiesList []string
	for city := range citiesBool {
		citiesList = append(citiesList, city)
	}
	return citiesList
}

func ErrorPage(err error, w http.ResponseWriter, code int) {
	if err != nil {
		errorName := map[int]string{
			http.StatusNotFound:            http.StatusText(http.StatusNotFound),
			http.StatusMethodNotAllowed:    http.StatusText(http.StatusMethodNotAllowed),
			http.StatusInternalServerError: http.StatusText(http.StatusInternalServerError),
			http.StatusBadRequest:          http.StatusText(http.StatusBadRequest),
		}

		w.WriteHeader(code)

		tmpl, err := template.ParseFiles(ErrorFileNames...)
		if err != nil {
			panic(err)
		}
		tmpl = template.Must(tmpl, err)
		data := map[string]string{
			"error_code": strconv.Itoa(code),
			"error_name": errorName[code],
		}
		tmpl.Execute(w, data)
	}
}
