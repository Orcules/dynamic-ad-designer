import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

export class BrowserManager {
  private browser: any = null;

  async launch() {
    this.browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    return this.browser;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async createPage(width: number, height: number) {
    const page = await this.browser.newPage();
    await page.setViewport({ width, height });
    return page;
  }
}