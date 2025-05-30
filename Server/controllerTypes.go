package main

import (
	"time"

	"github.com/google/uuid"
)

type Shorten struct {
	OriginalURL string `json:"originalUrl"`
	CustomAlias string `json:"customAlias"`
	Description string `json:"description"`
}
type ShortenResponse struct {
	ShortUrl    string    `json:"shortUrl"`
	OriginalURL string    `json:"originalUrl"`
	CustomAlias string    `json:"customAlias"`
	Description string    `json:"description"`
	ID          uuid.UUID `json:"id"`
	CreatedAt   time.Time `json:"createdAt"`
	Clicks      int       `json:"clicks"`
	IsActive    bool      `json:"isActive"`
}
type AnalyticsResponse struct {
	TotalClicks  int            `json:"totalClicks"`
	UniqueClicks int            `json:"uniqueClicks"`
	ClicksByDate []ClicksByDate `json:"clicksByDate"`
	Referrers    []Referrers    `json:"referrers"`
	Countries    []Countries    `json:"countries"`
}
type SuccessResponse struct {
	Success bool `json:"success"`
}
type ToggleURL struct {
	IsActive bool `json:"isActive"`
}

type ClicksByDate struct {
	Date   string `json:"date"`
	Clicks int    `json:"clicks"`
}
type Referrers struct {
	Source string `json:"source"`
	Clicks int    `json:"clicks"`
}
type Countries struct {
	Country string `json:"country"`
	Clicks  int    `json:"clicks"`
}
type AnalyticsStorage struct {
	UrlID        uuid.UUID      `json:"urlId"`
	TotalClicks  int            `json:"totalClicks"`
	UniqueClicks int            `json:"uniqueClicks"`
	ClicksByDate []ClicksByDate `json:"clicksByDate"`
	Referrers    []Referrers    `json:"referrers"`
	Countries    []Countries    `json:"countries"`
}
type UTMStruct struct {
	Source   string `json:"source"`
	Medium   string `json:"medium"`
	Campaign string `json:"compaign"`
	Term     string `json:"term"`
	Content  string `json:"content"`
}
type DeviceStruct struct {
	UserAgent        string `json:"userAgent"`
	DeviceType       string `json:"deviceType"`
	Language         string `json:"language"`
	Platform         string `json:"platform"`
	ScreenResolution string `json:"screenResolution"`
	Timezone         string `json:"timezone"`
}
type Redirect struct {
	IsUnique   bool         `json:"isUnique"`
	IPAddress  string       `json:"ipAddress"`
	Referrer   string       `json:"referrer"`
	UTM        UTMStruct    `json:"utm"`
	Device     DeviceStruct `json:"device"`
	TimeStamp  string       `json:"timestamp"`
	PageTitle  string       `json:"pageTitle"`
	CurrentURL string       `json:"currentUrl"`
}
type RedirectResponse struct {
	OriginalURL     string `json:"originalUrl"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	IsActive        bool   `json:"isActive"`
	RequiresWarning bool   `json:"requiresWarning"`
}
type IPDetail struct {
	Status  string `json:"status"`
	Country string `json:"country"`
}
