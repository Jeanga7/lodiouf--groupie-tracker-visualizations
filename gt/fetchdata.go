package gt

import (
	"fmt"
	"net/http"
	"sync"
)

var Endpoints = map[string]interface{}{
	"artists":   &[]Artist{},
	"locations": &Location{},
	"dates":     &Date{},
	"relation":  &Relation{},
}

func Parse(w http.ResponseWriter) {
	var wg sync.WaitGroup
	ch := make(chan string)

	for endpoint, data := range Endpoints {
		wg.Add(1)
		go func(endpoint string, data interface{}) {
			defer wg.Done()

			// Tente d'abord de charger les données depuis le cache
			err := LoadDataFromCache("cache_"+endpoint+".json", data)
			if err != nil {
				fmt.Println("Erreur de la lecture depuis le cache, appel à l'API ")

				// Si la lecture depuis le cache échoue, on effectue l'appel API
				err = ReadAPI(BaseURL+endpoint, w, data)
				if err != nil {
					fmt.Println("Erreur lors de l'appel à l'API ")
				}

				// Sauvegarde les données dans le cache
				err = SaveDataToLocalFile("cache_"+endpoint+".json", data)
				if err != nil {
					fmt.Println("Erreur lors de la sauvegarde dans le cache ")
				}
			}

			// Signale la fin du traitement de cet endpoint via le canal
			ch <- endpoint
		}(endpoint, data)
	}

	go func() {
		wg.Wait()
		close(ch)
	}()
	// Attente que toutes les goroutines aient signalé la fin via le canal
	for range Endpoints {
		<-ch
	}
}
