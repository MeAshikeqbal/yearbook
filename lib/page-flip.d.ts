declare module "page-flip" {
  export class PageFlip {
    constructor(element: HTMLElement, config: any);
    loadFromHTML(pages: NodeListOf<Element> | HTMLElement[]): void;
    updateFromHtml(pages: NodeListOf<Element> | HTMLElement[]): void;
    turnToPage(pageNum: number): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    flipNext(): void;
    flipPrev(): void;
    destroy(): void;
    on(event: string, callback: (e: any) => void): void;
  }
}
