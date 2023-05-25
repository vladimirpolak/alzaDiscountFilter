class DiscountFilter {
    constructor(targetDiscount, itemsContainerSelector, itemDiscountSelector) {
      this.targetDiscount = targetDiscount;
      this.itemsContainer = document.querySelector(itemsContainerSelector);
      this.itemDiscountSelector = itemDiscountSelector;
    }
  
    filterItems() {
      if (!this.itemsContainer) return;
  
      const items = Array.from(this.itemsContainer.children);
  
      items.forEach(item => {
        if (this.targetDiscount == 0) {
          this.displayItem(item);
          return;
        }
  
        const discountElement = item.querySelector(this.itemDiscountSelector);
        if (!discountElement) {
          this.hideItem(item);
          return;
        }
  
        const discountText = discountElement.textContent;
        const discountValue = parseInt(discountText.split('-')[1], 10);
  
        discountValue >= this.targetDiscount ? this.displayItem(item) : this.hideItem(item);
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
  
  const discountFilter = new DiscountFilter(0, '.browsingitemcontainer', '.price-box__header-text');
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getDiscount') {
      sendResponse({ discount: discountFilter.targetDiscount });
    } else {
      discountFilter.setTargetDiscount(request.discount);
    }
  });
  
  discountFilter.observeItemsContainer();
  