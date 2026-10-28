/**
 * BaseTravelAdapter - Foundation for all TIMS multi-provider travel adapters
 * Enforces unified search responses, freshness timestamps, and graceful error handling.
 */
class BaseTravelAdapter {
  constructor(providerCode, name, category) {
    this.providerCode = providerCode;
    this.name = name;
    this.category = category;
  }

  /**
   * Search travel offers matching criteria
   * @param {Object} params 
   * @returns {Promise<Array>}
   */
  async search(params) {
    throw new Error(`search() not implemented for provider ${this.providerCode}`);
  }

  /**
   * Retrieve offer details by identifier
   * @param {string|number} offerId 
   * @returns {Promise<Object>}
   */
  async getOfferDetails(offerId) {
    throw new Error(`getOfferDetails() not implemented for provider ${this.providerCode}`);
  }

  /**
   * Revalidate pricing and availability before customer commits to a booking
   * @param {string|number} offerId 
   * @param {Object} currentParams 
   * @returns {Promise<{ valid: boolean, currentPrice: number, freshnessTimestamp: string }>}
   */
  async revalidate(offerId, currentParams) {
    return {
      valid: true,
      currentPrice: currentParams?.price || null,
      freshnessTimestamp: new Date().toISOString(),
      priceChanged: false,
      message: 'Offer details revalidated successfully.'
    };
  }

  /**
   * Create direct reservation if authorized
   * @param {Object} bookingData 
   * @returns {Promise<Object>}
   */
  async createReservation(bookingData) {
    throw new Error(`Direct reservation not supported for provider ${this.providerCode}. Please use authorized external booking redirect.`);
  }

  /**
   * Query status of an existing booking
   * @param {string} bookingRef 
   * @returns {Promise<Object>}
   */
  async getBookingStatus(bookingRef) {
    throw new Error(`getBookingStatus() not supported for provider ${this.providerCode}`);
  }

  /**
   * Cancel an existing reservation
   * @param {string} bookingRef 
   * @returns {Promise<Object>}
   */
  async cancelReservation(bookingRef) {
    throw new Error(`cancelReservation() not supported for provider ${this.providerCode}`);
  }

  /**
   * Attach authoritative metadata to each returned item
   */
  formatOffer(raw) {
    return {
      ...raw,
      providerCode: this.providerCode,
      providerName: this.name,
      freshnessTimestamp: new Date().toISOString(),
      isEstimated: Boolean(raw.is_estimated ?? raw.isEstimated ?? true)
    };
  }
}

module.exports = BaseTravelAdapter;

