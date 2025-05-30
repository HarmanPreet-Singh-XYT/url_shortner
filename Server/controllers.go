package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"slices"

	"github.com/google/uuid"
)

var shorten = []ShortenResponse{}
var analytics = []AnalyticsStorage{}

func (cfg *apiConfig) handlerHelloWorld(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(205)
	w.Write([]byte("Hello World"))
}
func (cfg *apiConfig) handlerShorten(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	var data Shorten
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	object := ShortenResponse{
		ID:          uuid.New(),
		OriginalURL: data.OriginalURL,
		CustomAlias: data.CustomAlias,
		Clicks:      0,
		IsActive:    true,
		Description: data.Description,
		CreatedAt:   time.Now(),
		ShortUrl:    fmt.Sprintf("sht-%d", rand.Intn(10000000000-10000000+1)+10000000),
	}
	analyticsObj := AnalyticsStorage{
		UrlID:        object.ID,
		TotalClicks:  0,
		UniqueClicks: 0,
		ClicksByDate: []ClicksByDate{},
		Referrers:    []Referrers{},
		Countries:    []Countries{},
	}
	shorten = append(shorten, object)
	analytics = append(analytics, analyticsObj)
	object.ShortUrl = fmt.Sprintf("%s/%s", cfg.frontOrigin, object.ShortUrl)
	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(object)

}
func (cfg *apiConfig) handlerURL(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(shorten)
}
func (cfg *apiConfig) handlerURLAnalytics(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	prefix := "/analytics/"

	if !strings.HasPrefix(path, prefix) || len(path) <= len(prefix) {
		http.Error(w, "Missing URL ID", http.StatusBadRequest)
		return
	}

	urlIDRaw := path[len(prefix):]
	urlID, err := uuid.Parse(urlIDRaw)
	if err != nil {
		http.Error(w, "url parse failed", http.StatusBadRequest)
		return
	}
	for _, val := range analytics {
		if val.UrlID == urlID {
			w.WriteHeader(200)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(AnalyticsResponse{
				TotalClicks:  val.TotalClicks,
				UniqueClicks: val.UniqueClicks,
				ClicksByDate: val.ClicksByDate,
				Referrers:    val.Referrers,
				Countries:    val.Countries,
			})
			return
		}
	}
	http.Error(w, "url analytics not found", http.StatusNotFound)
}
func (cfg *apiConfig) handlerURLDelete(w http.ResponseWriter, r *http.Request) {
	// Expected path: /urls/{id}
	path := r.URL.Path // e.g., "/urls/123"
	prefix := "/urls/"

	if !strings.HasPrefix(path, prefix) {
		http.NotFound(w, r)
		return
	}

	idRaw := strings.TrimPrefix(path, prefix)
	idRaw = strings.Trim(idRaw, "/") // optional cleanup

	if idRaw == "" {
		http.Error(w, "Missing ID", http.StatusBadRequest)
		return
	}

	id, err := uuid.Parse(idRaw)
	if err != nil {
		http.Error(w, "url parse failed", http.StatusBadRequest)
		return
	}
	for i, val := range shorten {
		if val.ID == id {
			shorten = slices.Delete(shorten, i, i+1)
			w.WriteHeader(200)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(SuccessResponse{
				Success: true,
			})
			return
		}
	}
	http.Error(w, "url analytics not found", http.StatusNotFound)
}
func (cfg *apiConfig) handlerURLToggle(w http.ResponseWriter, r *http.Request) {
	// Path example: /urls/123/toggle
	path := r.URL.Path
	prefix := "/urls/"
	suffix := "/toggle"

	// Basic validation
	if !strings.HasPrefix(path, prefix) || !strings.HasSuffix(path, suffix) {
		http.NotFound(w, r)
		return
	}

	// Extract ID part
	idWithSuffix := strings.TrimPrefix(path, prefix)  // "123/toggle"
	idRaw := strings.TrimSuffix(idWithSuffix, suffix) // "123"

	idRaw = strings.Trim(idRaw, "/") // cleanup

	if idRaw == "" {
		http.Error(w, "Missing URL ID", http.StatusBadRequest)
		return
	}
	id, err := uuid.Parse(idRaw)
	if err != nil {
		http.Error(w, "url parse failed", http.StatusBadRequest)
		return
	}

	var data ToggleURL
	json.NewDecoder(r.Body).Decode(&data)

	for i, val := range shorten {
		if val.ID == id {
			shorten[i].IsActive = data.IsActive
			w.WriteHeader(200)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(SuccessResponse{
				Success: true,
			})
			return
		}
	}
	http.Error(w, "url analytics not found", http.StatusNotFound)
}
func (cfg *apiConfig) handlerURLUpdate(w http.ResponseWriter, r *http.Request) {
	// Expected path: /urls/{id}
	path := r.URL.Path // e.g., "/urls/123"
	prefix := "/urls/"

	if !strings.HasPrefix(path, prefix) {
		http.NotFound(w, r)
		return
	}

	idRaw := strings.TrimPrefix(path, prefix)
	idRaw = strings.Trim(idRaw, "/") // optional cleanup

	if idRaw == "" {
		http.Error(w, "Missing ID", http.StatusBadRequest)
		return
	}

	id, err := uuid.Parse(idRaw)
	if err != nil {
		http.Error(w, "url parse failed", http.StatusBadRequest)
		return
	}

	var data Shorten
	json.NewDecoder(r.Body).Decode(&data)

	for i, val := range shorten {
		if val.ID == id {
			shorten[i].OriginalURL = data.OriginalURL
			shorten[i].CustomAlias = data.CustomAlias
			shorten[i].Description = data.Description
			w.WriteHeader(200)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(SuccessResponse{
				Success: true,
			})
			return
		}
	}
	http.Error(w, "url analytics not found", http.StatusNotFound)
}

func IPLocation(ip string) (string, error) {
	client := &http.Client{}

	url := fmt.Sprintf("http://ip-api.com/json/%s?fields=status,country", ip)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("User-Agent", "MyGoClient/1.0")

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var resParameters IPDetail
	json.NewDecoder(resp.Body).Decode(&resParameters)
	return resParameters.Country, nil
}

func (body Redirect) handleAnalyticsUpdate(id uuid.UUID) error {
	for i, val := range analytics {
		if val.UrlID == id {
			analytics[i].TotalClicks++
			if body.IsUnique {
				analytics[i].UniqueClicks++
			}
			if body.UTM.Source == "" {
				body.UTM.Source = "Direct"
			}
			// Referrers
			if len(val.Referrers) == 0 {
				analytics[i].Referrers = append(analytics[i].Referrers, Referrers{Source: body.UTM.Source, Clicks: 1})
			} else {
				found := false
				for r, ref := range val.Referrers {
					if ref.Source == body.UTM.Source {
						found = true
						analytics[i].Referrers[r].Clicks++
					}
				}
				if !found {
					analytics[i].Referrers = append(analytics[i].Referrers, Referrers{Source: body.UTM.Source, Clicks: 1})
				}
			}
			// Clicks by date
			date := body.TimeStamp[:10]

			if len(val.ClicksByDate) == 0 {
				analytics[i].ClicksByDate = append(analytics[i].ClicksByDate, ClicksByDate{Date: date, Clicks: 1})
			} else {
				found := false
				for d, ref := range val.ClicksByDate {
					if ref.Date == date {
						found = true
						analytics[i].ClicksByDate[d].Clicks++
					}
				}
				if !found {
					analytics[i].ClicksByDate = append(analytics[i].ClicksByDate, ClicksByDate{Date: date, Clicks: 1})
				}
			}
			// Country
			location, err := IPLocation(body.IPAddress)
			if err != nil {
				return err
			}
			if len(val.Countries) == 0 {
				analytics[i].Countries = append(analytics[i].Countries, Countries{Country: location, Clicks: 1})
			} else {
				found := false
				for c, ref := range val.Countries {
					if ref.Country == location {
						found = true
						analytics[i].Countries[c].Clicks++
					}
				}
				if !found {
					analytics[i].Countries = append(analytics[i].Countries, Countries{Country: location, Clicks: 1})
				}
			}

		}
	}
	return nil
}

func (cfg *apiConfig) handlerURLRedirect(w http.ResponseWriter, r *http.Request) {
	prefix := "/redirect/"
	path := r.URL.Path

	if !strings.HasPrefix(path, prefix) || len(path) <= len(prefix) {
		http.NotFound(w, r)
		return
	}

	shortID := strings.TrimPrefix(path, prefix)
	shortID = strings.Trim(shortID, "/")

	if shortID == "" {
		http.Error(w, "Missing short ID", http.StatusBadRequest)
		return
	}

	var data Redirect
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "body decode failed", http.StatusFailedDependency)
		return
	}
	for i, val := range shorten {
		if val.ShortUrl == shortID {
			shorten[i].Clicks++
			if !val.IsActive {
				w.WriteHeader(410)
				http.Error(w, "url is Inactive", http.StatusGone)
			}

			err := data.handleAnalyticsUpdate(val.ID)
			if err != nil {
				http.Error(w, "Analytics failed", http.StatusFailedDependency)
				return
			}

			w.WriteHeader(200)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(RedirectResponse{
				OriginalURL:     val.OriginalURL,
				Title:           val.CustomAlias,
				Description:     val.Description,
				IsActive:        val.IsActive,
				RequiresWarning: false,
			})
			return
		}
	}
	http.Error(w, "url analytics not found", http.StatusNotFound)
}
