document.addEventListener('DOMContentLoaded', function () {
  var range = document.getElementById('discount');
  var rangeValue = document.getElementById('rangeValue');

  // Ask the content script for the current discount value.
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getDiscount'}, function(response) {
          range.value = response.discount;
          rangeValue.innerText = response.discount + '%';
      });
  });

  range.addEventListener('change', function () {
      rangeSlide(range.value);
  });
  range.addEventListener('mousemove', function () {
    rangeSlide(range.value);
});
});

function rangeSlide(value) {
  document.getElementById('rangeValue').innerText = value + '%';
  chrome.runtime.sendMessage({discount: value});
}