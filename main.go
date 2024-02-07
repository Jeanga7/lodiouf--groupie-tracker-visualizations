package main

import (
	"fmt"
	"gt/gt"
	"log"
	"net/http"
)

func main() {
	port := ":8080"
	http.HandleFunc("/", gt.HandlePage)
	http.HandleFunc("/coords", gt.HandleCoordinates)

	var locations gt.Location
	gt.GetLocations(&locations)
	gt.StoreCoordsData(gt.UniqueCities(locations.Index))

	// Create MUX Routing
	fs := http.FileServer(http.Dir("./vues/assets/"))
	http.Handle("/assets/", http.StripPrefix("/assets/", fs))

	fmt.Println("Server Online...")
	fmt.Println("Access to the app using this link : http://localhost" + port)

	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}
