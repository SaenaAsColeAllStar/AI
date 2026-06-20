/**
 * Cloudflare Pages custom domain API methods.
 */

/** @typedef {import('./cloudflare-client.js').CloudflareClient} CloudflareClient */

export const domainApi = {
  /**
   * @this {CloudflareClient}
   * @param {string} projectName
   * @param {string} domain
   */
  async attachDomain(projectName, domain) {
    return this.request(
      'POST',
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/domains`,
      { name: domain }
    );
  },

  /**
   * @this {CloudflareClient}
   * @param {string} projectName
   * @param {string} domain
   */
  async getDomainStatus(projectName, domain) {
    return this.request(
      'GET',
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/domains/${encodeURIComponent(domain)}`
    );
  },

  /**
   * @this {CloudflareClient}
   * @param {string} projectName
   * @param {string} domain
   */
  async verifyDomain(projectName, domain) {
    return this.request(
      'PATCH',
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/domains/${encodeURIComponent(domain)}`,
      { status: 'active' }
    );
  },
};
