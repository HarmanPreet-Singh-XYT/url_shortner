package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"strings"

	"github.com/HarmanPreet-Singh-XYT/internal/database"
	"github.com/google/uuid"
)

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

	shortenCreation, err := cfg.dbQueries.CreateShortenURL(r.Context(), database.CreateShortenURLParams{
		Originalurl: data.OriginalURL,
		Shorturl:    fmt.Sprintf("sht-%d", rand.Intn(10000000000-10000000+1)+10000000),
		Customalias: data.CustomAlias,
		Description: data.Description,
		Isactive:    true,
		Clicks:      0,
	})
	if err != nil {
		http.Error(w, "url analytics not found", http.StatusBadGateway)
	}

	err1 := cfg.dbQueries.CreateAnalytics(r.Context(), shortenCreation.ID)
	if err1 != nil {
		http.Error(w, "url analytics not found", http.StatusBadGateway)
	}

	shortURL := fmt.Sprintf("%s/%s", cfg.frontOrigin, shortenCreation.Shorturl)
	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ShortenResponse{
		ID:          shortenCreation.ID,
		OriginalURL: shortenCreation.Originalurl,
		CustomAlias: shortenCreation.Customalias,
		Clicks:      int(shortenCreation.Clicks),
		IsActive:    shortenCreation.Isactive,
		Description: shortenCreation.Description,
		CreatedAt:   shortenCreation.Createdat.Time,
		ShortUrl:    shortURL,
	})

}
func (cfg *apiConfig) handlerURL(w http.ResponseWriter, r *http.Request) {
	var data = []ShortenResponse{}
	objects, err := cfg.dbQueries.GetAllShortens(r.Context())
	if err != nil {
		http.Error(w, "url analytics not found", http.StatusBadGateway)
	}
	if len(objects) != 0 {
		for _, val := range objects {
			data = append(data, ShortenResponse{
				OriginalURL: val.Originalurl,
				ShortUrl:    val.Shorturl,
				CustomAlias: val.Customalias,
				ID:          val.ID,
				Description: val.Description,
				CreatedAt:   val.Createdat.Time,
				Clicks:      int(val.Clicks),
				IsActive:    val.Isactive,
			})
		}
	}

	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
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
	analytic, err := cfg.dbQueries.GetAnalyticsByUrlId(r.Context(), urlID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "url analytics not found", http.StatusNotFound)
			return
		}
		http.Error(w, "db query failed", http.StatusBadGateway)
		return
	}

	clicksByDateOutput := []ClicksByDate{}
	referrersOutput := []Referrers{}
	countriesOutput := []Countries{}

	clicksByDate, err := cfg.dbQueries.GetClicksByDatesByUrlId(r.Context(), urlID)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "url parse failed", http.StatusBadRequest)
			return
		}
	}
	if len(clicksByDate) > 0 {
		for _, val := range clicksByDate {
			clicksByDateOutput = append(clicksByDateOutput, ClicksByDate{
				Date:   val.Date,
				Clicks: int(val.Clicks),
			})
		}
	}
	referrers, err := cfg.dbQueries.GetReferrersByUrlId(r.Context(), urlID)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "url parse failed", http.StatusBadRequest)
			return
		}
	}
	if len(referrers) > 0 {
		for _, val := range referrers {
			referrersOutput = append(referrersOutput, Referrers{
				Source: val.Source,
				Clicks: int(val.Clicks),
			})
		}
	}
	countries, err := cfg.dbQueries.GetCountriesByUrlId(r.Context(), urlID)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "url parse failed", http.StatusBadRequest)
			return
		}
	}
	if len(countries) > 0 {
		for _, val := range countries {
			countriesOutput = append(countriesOutput, Countries{
				Country: val.Country,
				Clicks:  int(val.Clicks),
			})
		}
	}
	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AnalyticsResponse{
		TotalClicks:  int(analytic.Totalclicks),
		UniqueClicks: int(analytic.Uniqueclicks),
		ClicksByDate: clicksByDateOutput,
		Referrers:    referrersOutput,
		Countries:    countriesOutput,
	})
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
	errDB := cfg.dbQueries.DeleteShortenURLById(r.Context(), id)
	if errDB != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "url analytics not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database Failed", http.StatusBadGateway)
		return
	}
	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
	})
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

	errDB := cfg.dbQueries.UpdateShortenURLStatusById(r.Context(), database.UpdateShortenURLStatusByIdParams{
		ID:       id,
		Isactive: data.IsActive,
	})
	if errDB != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "url analytics not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database Failed", http.StatusBadGateway)
		return
	}
	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
	})
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

	errDB := cfg.dbQueries.UpdateShortenURLById(r.Context(), database.UpdateShortenURLByIdParams{
		Originalurl: data.OriginalURL,
		Customalias: data.CustomAlias,
		Description: data.Description,
		ID:          id,
	})
	if errDB != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "url analytics not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database Failed", http.StatusBadGateway)
		return
	}
	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
	})
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

func (cfg *apiConfig) handleAnalyticsUpdate(id uuid.UUID, body Redirect, w http.ResponseWriter, r *http.Request) error {
	err := cfg.dbQueries.IncrementClick(r.Context(), id)
	if err != nil {
		return err
	}
	if body.UTM.Source == "" {
		body.UTM.Source = "Direct"
	}
	if body.IsUnique {
		errD := cfg.dbQueries.IncrementTotalClicks_UniqueClicksByUrlId(r.Context(), id)
		if errD != nil {
			if errors.Is(errD, sql.ErrNoRows) {
				http.Error(w, "url analytics not found", http.StatusNotFound)
				return errD
			}
			http.Error(w, "Database Failed", http.StatusBadGateway)
			return errD
		}
	} else {
		errD := cfg.dbQueries.IncrementClicksByUrlId(r.Context(), id)
		if errD != nil {
			if errors.Is(errD, sql.ErrNoRows) {
				http.Error(w, "url analytics not found", http.StatusNotFound)
				return errD
			}
			http.Error(w, "Database Failed", http.StatusBadGateway)
			return errD
		}
	}
	// Referrers
	referrers, err := cfg.dbQueries.GetReferrerBySourceUrlId(r.Context(), database.GetReferrerBySourceUrlIdParams{
		Source: body.UTM.Source,
		Urlid:  id,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			errD := cfg.dbQueries.CreateReferrer(r.Context(), database.CreateReferrerParams{
				Urlid:  id,
				Source: body.UTM.Source,
			})
			if errD != nil {
				http.Error(w, "Database Failed", http.StatusBadGateway)
				return errD
			}
		} else {
			http.Error(w, "Database Failed", http.StatusBadGateway)
			return err
		}
	} else {
		errD := cfg.dbQueries.IncrementReferrerClicks(r.Context(), database.IncrementReferrerClicksParams{
			Source: referrers.Source,
			Urlid:  referrers.Urlid,
		})
		if errD != nil {
			http.Error(w, "Database Failed", http.StatusBadGateway)
			return errD
		}
	}
	// Clicks by date
	date := body.TimeStamp[:10]
	clicksByDate, err := cfg.dbQueries.GetClicksByDatesByUrlIdDate(r.Context(), database.GetClicksByDatesByUrlIdDateParams{
		Urlid: id,
		Date:  date,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			errD := cfg.dbQueries.CreateClicksByDate(r.Context(), database.CreateClicksByDateParams{
				Urlid: id,
				Date:  date,
			})
			if errD != nil {
				http.Error(w, "Database Failed", http.StatusBadGateway)
				return errD
			}
		} else {
			http.Error(w, "Database Failed", http.StatusBadGateway)
			return err
		}
	} else {
		errD := cfg.dbQueries.IncrementClicksByDateByUrlIdDate(r.Context(), database.IncrementClicksByDateByUrlIdDateParams{
			Urlid: clicksByDate.Urlid,
			Date:  clicksByDate.Date,
		})
		if errD != nil {
			http.Error(w, "Database Failed", http.StatusBadGateway)
			return errD
		}
	}

	// Country
	location, err := IPLocation(body.IPAddress)
	if err != nil {
		return err
	}
	country, err := cfg.dbQueries.GetCountryClicksByUrlIdDate(r.Context(), database.GetCountryClicksByUrlIdDateParams{
		Country: location,
		Urlid:   id,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			errD := cfg.dbQueries.CreateCountryClicks(r.Context(), database.CreateCountryClicksParams{
				Urlid:   id,
				Country: location,
			})
			if errD != nil {
				http.Error(w, "Database Failed", http.StatusBadGateway)
				return errD
			}
		} else {
			http.Error(w, "Database Failed", http.StatusBadGateway)
			return err
		}
	} else {
		errD := cfg.dbQueries.IncrementCountryClicks(r.Context(), database.IncrementCountryClicksParams{
			Urlid:   country.Urlid,
			Country: country.Country,
		})
		if errD != nil {
			http.Error(w, "Database Failed", http.StatusBadGateway)
			return errD
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

	shortenData, errDB := cfg.dbQueries.GetShortenURLByShortUrl(r.Context(), shortID)
	if errDB != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "url analytics not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database Failed", http.StatusBadGateway)
		return
	}

	if !shortenData.Isactive {
		w.WriteHeader(410)
		http.Error(w, "url is Inactive", http.StatusGone)
		return
	}

	err1 := cfg.handleAnalyticsUpdate(shortenData.ID, data, w, r)
	if err1 != nil {
		http.Error(w, "Analytics failed", http.StatusFailedDependency)
		return
	}

	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(RedirectResponse{
		OriginalURL:     shortenData.Originalurl,
		Title:           shortenData.Customalias,
		Description:     shortenData.Description,
		IsActive:        shortenData.Isactive,
		RequiresWarning: false,
	})
}
