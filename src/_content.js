let targetDiscount = 0;

const itemsContainer = document.querySelector('.browsingitemcontainer');
const classItemDiscountElement = '.price-box__header-text';

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === 'getDiscount') {
        // The popup is asking for the current discount value.
        sendResponse({discount: targetDiscount});
    } else {
        // The popup is sending a new discount value.
        targetDiscount = request.discount;
        filterItems();
    }
  });

function filterItems() {
  // If targetDiscount is 0 or itemsContainer doesn't exist don't do anything.
  if (!itemsContainer) return;
  
  // Get direct children of the itemsContainer.
  const items = Array.from(itemsContainer.children);

  items.forEach(item => {
    if (targetDiscount == 0) {
      item.style.display = 'flex';
      return;
    }

    const discountElement = item.querySelector(classItemDiscountElement);
    if (!discountElement) {
      item.style.display = 'none';
      return;
    }

    const discountText = discountElement.textContent;
    const discountValue = parseInt(discountText.split('-')[1], 10);

    item.style.display = discountValue >= targetDiscount ? 'flex' : 'none';
  });
};

// Set up an observer for container of shopping items
if (itemsContainer) {
  const observer = new MutationObserver(filterItems);
  // Observes direct children
  observer.observe(itemsContainer, { childList: true });
}

// Set up a mutation observer to call filterItems when nodes are added to the document.
// const observer = new MutationObserver(filterItems);
// observer.observe(document.body, { childList: true, subtree: true });
