/**
 * Cloudflare DNS API methods.
 */

/** @typedef {import('./cloudflare-client.js').CloudflareClient} CloudflareClient */

export const dnsApi = {
  /**
   * @this {CloudflareClient}
   * @param {Record<string, unknown>} record
   */
  async createDnsRecord(record) {
    return this.request('POST', `/zones/${this.zoneId}/dns_records`, record);
  },

  /**
   * @this {CloudflareClient}
   * @param {string} recordId
   * @param {Record<string, unknown>} record
   */
  async updateDnsRecord(recordId, record) {
    return this.request('PUT', `/zones/${this.zoneId}/dns_records/${recordId}`, record);
  },

  /**
   * @this {CloudflareClient}
   * @param {{ type?: string, name?: string, content?: string, page?: number, per_page?: number }} [params]
   */
  async listDnsRecords(params = {}) {
    return this.request('GET', `/zones/${this.zoneId}/dns_records`, undefined, params);
  },
};
