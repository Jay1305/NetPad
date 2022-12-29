import {FindTextBoxOptions} from "@application";
import {SearchImplementation} from "@application/find-text-box/search-implementations/search-implementation";

export class SearchImplementation2 extends SearchImplementation {
    constructor(private readonly options: FindTextBoxOptions) {
        super();
    }

    private removeAllSearchResults() {
        this.options.rootElement.querySelectorAll(".text-search-result")
            .forEach(el => {
                el.replaceWith(el.textContent || "");
            });

        this.options.rootElement.normalize();
    }

    public search(searchText: string): HTMLElement[] {
        this.removeAllSearchResults();
        if (!searchText) {
            return [];
        }

        searchText = this.normalizeSearchText(searchText);

        const searchable = Array.from(this.options.rootElement.querySelectorAll(this.options.searchableElementsQuerySelector)) as HTMLElement[];

        for (let iSearchableElement = 0; iSearchableElement < searchable.length; iSearchableElement++) {
            const element = searchable[iSearchableElement];

            const childNodes = Array.from(element.childNodes);
            for (let iChildNode = 0; iChildNode < childNodes.length; iChildNode++) {
                const childNode = childNodes[iChildNode];

                if (childNode.nodeType !== Node.TEXT_NODE) {
                    continue;
                }

                const contents = (childNode as Text).data;
                const searchTextFoundAtIndexes: number[] = this.findMatchingIndexes(contents.toLowerCase(), searchText);

                if (searchTextFoundAtIndexes.length === 0) {
                    continue;
                }

                const replacementNodes: (Node | string)[] = [];
                let currentIndex = 0;

                for (let i = 0; i < searchTextFoundAtIndexes.length; i++) {
                    const searchTextFoundAtIndex = searchTextFoundAtIndexes[i];

                    if (currentIndex < searchTextFoundAtIndex) {
                        replacementNodes.push(contents.substring(currentIndex, searchTextFoundAtIndex));
                        currentIndex = searchTextFoundAtIndex;
                    }

                    const span = document.createElement("span");
                    span.classList.add("text-search-result");
                    span.innerText = contents.substring(searchTextFoundAtIndex, searchTextFoundAtIndex + searchText.length);
                    replacementNodes.push(span);

                    currentIndex += searchText.length;

                    if (i == (searchTextFoundAtIndexes.length - 1)) {
                        replacementNodes.push(contents.substring(searchTextFoundAtIndex + searchText.length));
                    }
                }

                childNode.replaceWith(...replacementNodes);
            }
        }

        return Array.from(this.options.rootElement.querySelectorAll(".text-search-result")) as HTMLElement[];
    }
}
