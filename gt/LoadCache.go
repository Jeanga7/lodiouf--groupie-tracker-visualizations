package gt

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

func ReadAPI(url string, w http.ResponseWriter, allDatas interface{}) error {
	r, err := http.Get(url)
	if err != nil {
		ErrorPage(err, w, 500)
	}
	defer r.Body.Close()

	data, err1 := io.ReadAll(r.Body)
	if err != nil {
		ErrorPage(err1, w, 500)
	}

	err1 = json.Unmarshal(data, &allDatas)
	if err != nil {
		ErrorPage(err1, w, 500)
	}
	_, errNetwork := http.Get(url)
	if errNetwork != nil {
		return fmt.Errorf("erreur lors de l'appel à l'API : %v", err)
	}

	return nil
}

func SaveDataToLocalFile(filename string, data interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	err = os.WriteFile(filename, jsonData, 0644)
	if err != nil {
		return err
	}

	return nil
}

func LoadDataFromCache(filename string, data interface{}) error {
	jsonData, err := os.ReadFile(filename)
	if err != nil {
		return err
	}

	err = json.Unmarshal(jsonData, data)
	if err != nil {
		return err
	}

	return nil
}

func FetchAndCacheData(w http.ResponseWriter) {
	var allDatas AllData

	ReadAPI(BaseURL, w, &allDatas)

	SaveDataToLocalFile("cached_data.json", allDatas)
}
