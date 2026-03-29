package propertyclient

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

// PropertyClient is used to query the property service for room existence and other property-related info
type PropertyClient struct {
	baseURL string
	client  *http.Client
}

func NewPropertyClient() *PropertyClient {
	url := os.Getenv("PROPERTY_SERVICE_URL")
	if url == "" {
		url = "http://localhost:8080"
	}
	return &PropertyClient{
		baseURL: url,
		client:  &http.Client{Timeout: 5 * time.Second},
	}
}

// RoomExists checks if a room exists in the property service
func (p *PropertyClient) RoomExists(roomID string) (bool, error) {

	url := fmt.Sprintf("%s/api/rooms/%s/exists", p.baseURL, roomID)

	resp, err := p.client.Get(url)

	if err != nil {
		// Wrap underlying HTTP error
		return false, fmt.Errorf("property service request failed: %w", err)
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		var exists bool
		if err := json.NewDecoder(resp.Body).Decode(&exists); err != nil {
			return false, fmt.Errorf("failed to parse property service response: %w", err)
		}
		return exists, nil
	case http.StatusNotFound:
		// room simply does not exist
		return false, nil
	default:
		// unexpected response
		return false, fmt.Errorf("property service returned unexpected status code: %d", resp.StatusCode)
	}

	// Explanation, because it's my first time doing this:

	// Always wrap the underlying error with %w for context (fmt.Errorf("...: %w", err)) - allows you
	// to inspect errors with errors.ls or errors.As later

	// use switch for status codes to clearly separate not found vs unexpected error

	// timeout is set for HTTP client to avoid hanging requests.

	// !! This client is layered below the service, so it just returns errors - no gRPC code here.

	// todo: remove this bellow
	//if resp.StatusCode == http.StatusNotFound {
	//	return false, nil
	//}
	//
	//if resp.StatusCode != http.StatusOK {
	//	return false, fmt.Errorf("unexpected status code from property service: %d", resp.StatusCode)
	//}
	//
	//var exists bool
	//if err := json.NewDecoder(resp.Body).Decode(&exists); err != nil {
	//	return false, fmt.Errorf("failed to parse property service response: %w", err)
	//}

	//return exists, nil
}

func (p *PropertyClient) GetRoomBasePrice(roomID string) (float64, error) {

	url := fmt.Sprintf("%s/api/rooms/%s/basePrice", p.baseURL, roomID)

	resp, err := p.client.Get(url)
	if err != nil {
		return 0, fmt.Errorf("property service request failed: %w", err)
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		var priceResp PriceResponse

		if err := json.NewDecoder(resp.Body).Decode(&priceResp); err != nil {
			return 0, fmt.Errorf("failed to decode base price response: %w", err)
		}

		return priceResp.Price, nil

	case http.StatusNotFound:
		return 0, fmt.Errorf("room not found")

	default:
		return 0, fmt.Errorf("unexpected status code from property service: %d", resp.StatusCode)
	}
}
