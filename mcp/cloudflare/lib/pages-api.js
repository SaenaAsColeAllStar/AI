/**
 * Cloudflare Pages API methods.
 */

/** @typedef {import('./cloudflare-client.js').CloudflareClient} CloudflareClient */

export const pagesApi = {
  /**
   * @this {CloudflareClient}
   * @param {Record<string, unknown>} projectConfig
   */
  async createPagesProject(projectConfig) {
    return this.request('POST', `/accounts/${this.accountId}/pages/projects`, projectConfig);
  },

  /**
   * @this {CloudflareClient}
   * @param {string} projectName
   * @param {Record<string, unknown>} [deployBody]
   */
  async deployPagesProject(projectName, deployBody = {}) {
    return this.request(
      'POST',
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/deployments`,
      deployBody
    );
  },

  /**
   * @this {CloudflareClient}
   * @param {{ page?: number, per_page?: number }} [params]
   */
  async listPagesProjects(params = {}) {
    return this.request('GET', `/accounts/${this.accountId}/pages/projects`, undefined, params);
  },

  /**
   * @this {CloudflareClient}
   * @param {string} projectName
   * @param {string} deploymentId
   */
  async getPagesDeployment(projectName, deploymentId) {
    return this.request(
      'GET',
      `/accounts/${this.accountId}/pages/projects/${encodeURIComponent(projectName)}/deployments/${encodeURIComponent(deploymentId)}`
    );
  },
};
