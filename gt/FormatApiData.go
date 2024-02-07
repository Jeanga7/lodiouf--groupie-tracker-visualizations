package gt

import "strings"

func RedableRelations(relation Relation) Relation {
	var newRelation Relation

	for _, val := range relation.Index {
		rel := struct {
			Id             int                 `json:"id"`
			DatesLocations map[string][]string `json:"datesLocations"`
		}{
			val.Id,
			TransformMap(val.DatesLocations),
		}
		newRelation.Index = append(newRelation.Index, rel)
	}
	return newRelation
}

func TransformMap(m map[string][]string) map[string][]string {
	newMap := make(map[string][]string)

	for i, val := range m {
		newMap[VillePays(i)] = FormatDates(val)
	}

	return newMap
}

func VillePays(s string) string {
	lieu := strings.Split(s, "-")
	ville, pays := strings.Title(RemoveUnderscores(lieu[0])), strings.ToUpper(RemoveUnderscores(lieu[1]))
	return ville + " (" + pays + ")"
}

func RemoveUnderscores(s string) string {
	return strings.ReplaceAll(s, "_", " ")
}

func FormatDates(date []string) []string {
	var newDate []string
	for _, val := range date {
		newDate = append(newDate, strings.ReplaceAll(strings.Trim(val, "*"), "-", "/"))
	}

	return newDate
}
