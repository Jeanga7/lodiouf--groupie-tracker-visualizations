package gt

type Artist struct {
	Id           int      `json:"id"`
	Image        string   `json:"image"`
	Name         string   `json:"name"`
	Members      []string `json:"members"`
	CreationDate int      `json:"creationDate"`
	FirstAlbum   string   `json:"firstAlbum"`
	Locations    string   `json:"locations"`
	ConcertDates string   `json:"concertDates"`
	Relations    string   `json:"relations"`
}

type LocationIndex []struct {
	Id        int      `json:"id"`
	Locations []string `json:"locations"`
	Dates     string   `json:"dates"`
}

type Location struct {
	Index LocationIndex `json:"index"`
}

type Date struct {
	Index []struct {
		Id    int      `json:"id"`
		Dates []string `json:"dates"`
	} `json:"index"`
}

type Relation struct {
	Index []struct {
		Id             int                 `json:"id"`
		DatesLocations map[string][]string `json:"datesLocations"`
	} `json:"index"`
}

type Index struct {
	Content string `json:"index"`
}

//======================================================================================

type AllData struct {
	Artists      []Artist
	Locations    Location
	Dates        Date
	Relations    Relation
	FinalArtists []FinalArtist
	UniqueCities []string
}

// Données Artistes à afficher
type FinalArtist struct {
	Id           int    `json:"id"`
	Image        string `json:"image"`
	Name         string `json:"name"`
	MemberList   []string
	Members      []string `json:"members"`
	CreationDate int      `json:"creationDate"`
	FirstAlbum   string   `json:"firstAlbum"`
	Locations    struct {
		Id        int      `json:"id"`
		Locations []string `json:"locations"`
		Dates     string   `json:"dates"`
	}
	ConcertDates struct {
		Id    int      `json:"id"`
		Dates []string `json:"dates"`
	}
	Relations struct {
		Id             int                 `json:"id"`
		DatesLocations map[string][]string `json:"datesLocations"`
	}
}

type Place struct {
	Place_Id string `json:"place_id"`
	Name     string `json:"display_name"`
	Lat      string `json:"lat"`
	Lon      string `json:"lon"`
}
