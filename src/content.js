class DiscountFilter {
  constructor(targetDiscount, itemsContainerSelector, discountValueExtractor) {
    this.targetDiscount = targetDiscount;
    this.itemsContainer = document.querySelector(itemsContainerSelector);
    this.discountValueExtractor = discountValueExtractor;
  }

  filterItems() {
    if (!this.itemsContainer) return;

    const items = Array.from(this.itemsContainer.children);

    items.forEach(item => {
      if (this.targetDiscount == 0) {
        this.displayItem(item);
        return;
      }

      this.discountValueExtractor(item) >= this.targetDiscount ? this.displayItem(item) : this.hideItem(item);
    });
  }

  hideItem(item) {
    item.style.display = 'none';
  }

  displayItem(item) {
    item.style.display = 'flex';
  }

  setTargetDiscount(targetDiscount) {
    this.targetDiscount = targetDiscount;
    this.filterItems();
  }

  observeItemsContainer() {
    if (this.itemsContainer) {
      const observer = new MutationObserver(this.filterItems.bind(this));
      observer.observe(this.itemsContainer, { childList: true });
    }
  }
}

const alzaItemsContainerClass = '.browsingitemcontainer';
const alzaItemDiscountValueExtractor = (item) => {
  const discountElement = item.querySelector('.price-box__header-text');
  if (!discountElement) {
    return null;
  }
  return parseInt(discountElement.textContent.split('-')[1], 10);
};

const discountFilter = new DiscountFilter(0, alzaItemsContainerClass, alzaItemDiscountValueExtractor);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getDiscount') {
    sendResponse({ discount: discountFilter.targetDiscount });
  } else {
    discountFilter.setTargetDiscount(request.discount);
  }
});

discountFilter.observeItemsContainer();
