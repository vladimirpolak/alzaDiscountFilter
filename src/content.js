function sanitizeInput(input) {
    let sanitizedInput = input.replace('%', '');

    if (!isNaN(sanitizedInput)) {
        sanitizedInput = Number(sanitizedInput);
        
        if (sanitizedInput < 0) {
            return 0;
        }
        if (sanitizedInput > 100) {
            return 100;
        }
        return sanitizedInput;
    }
    return 0;
}

function roundToNearestIncrement(num, increment) {
    return Math.round(num / increment) * increment;
}

function processInput(value) {
    return roundToNearestFive(sanitizeInput(value))
}

class DiscountFilter {
    #sliderTitle;
    #sliderIncrement = 5;
    #filterSliderID = 'discountFilterSlider';
    #discountFilterInputID = 'discountFilterInput';
    #filterStyling = `
    #${this.#filterSliderID} {
        -webkit-appearance: none;
        width: 100%;
        background: #2F8DCD;
        height: 3px;
    }
    
    #${this.#filterSliderID}::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 13px;
        height: 13px;
        background: #00275A;
        border-radius: 50%;
        cursor: pointer;
    }
    
    #${this.#filterSliderID}::-moz-range-thumb {
        width: 13px;
        height: 13px;
        background: #00275A;
        border-radius: 50%;
        cursor: pointer;
    }
    #${this.#discountFilterInputID} {
        border: 1px solid #999;
        border-radius: 4px;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        color: #00275a;
        display: block;
        font-size: 10px;
        height: 22px;
        margin-top: 5px;
        margin-bottom: 5px;
        padding: 1px;
        text-align: center;
        vertical-align: top;
        width: 44.5%;
    }
    `

    constructor(targetDiscount, itemsContainerSelector, filtersContainer, discountValueExtractor) {
      if (window.location.hostname === 'www.alza.sk') {
        this.#sliderTitle = 'Zľava';
      } else if (window.location.hostname === 'www.alza.cz') {
        this.#sliderTitle = 'Sleva';
      }
      this.targetDiscount = targetDiscount;
      this.itemsContainer = document.querySelector(itemsContainerSelector);
      this.filtersContainer = document.querySelector(filtersContainer)
      this.discountValueExtractor = discountValueExtractor;
    }

    setupFilter() {
        if (this.filtersContainer) {
            this.injectSlider();
            this.setEvents();
            this.observeItemsContainer();
        }
    }

    #buildSliderContainer() {
        const style = document.createElement('style');
        style.textContent = this.#filterStyling;
        document.head.appendChild(style);

        const sliderContainer = document.createElement('div');
        sliderContainer.classList.add('js-basic-filter')
        sliderContainer.classList.add('basic-filter')
        
        const rangeValue = document.createElement('span');
        rangeValue.classList.add('name')
        rangeValue.id = 'rangeValue';
        rangeValue.textContent = this.#sliderTitle;
        sliderContainer.appendChild(rangeValue);
      
        const slider = document.createElement('input');
        slider.classList.add('range');
        slider.type = 'range';
        slider.name = 'discount';
        slider.id = this.#filterSliderID;
        slider.value = this.targetDiscount;
        slider.min = '0';
        slider.max = '100';
        slider.step = this.#sliderIncrement;
        sliderContainer.appendChild(slider);

        const valueInput = document.createElement('input');
        valueInput.id = this.#discountFilterInputID;
        valueInput.type = 'text';
        valueInput.value = this.formatInputFieldValue(this.targetDiscount);
        sliderContainer.appendChild(valueInput);

        return sliderContainer
    }

    injectSlider() {
        const slider = this.#buildSliderContainer();
        this.filtersContainer.prepend(slider);
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

    setEvents() {
      this.setInputEventHandler(document.querySelector('#' + this.#discountFilterInputID));
      this.setSliderEventHandler(document.querySelector('#' + this.#filterSliderID));
    }

    setInputEventHandler(inputElement) {
        const sliderElement = document.querySelector('#' + this.#filterSliderID);

        const inputEvent = (e) => {
            if (e.key === 'Enter' && inputElement === document.activeElement) {
                // Prevent the default action to stop the form from being submitted
                e.preventDefault();

                const value = this.#processInput(e.target.value);
                this.setTargetDiscount(value);
                sliderElement.value = this.targetDiscount;
                inputElement.value = this.formatInputFieldValue(this.targetDiscount);
                
            }
        };
        
        inputElement.addEventListener('keydown', inputEvent);
    }

    setSliderEventHandler(sliderElement) {
        const sliderEvent = (event) => {
            const value = this.#processInput(event.target.value)
            this.setTargetDiscount(value);
            document.querySelector('#' + this.#discountFilterInputID).value = this.formatInputFieldValue(value)
        };
      
        sliderElement.addEventListener('change', sliderEvent);
    }
    
    #processInput(value) {
        return roundToNearestIncrement(sanitizeInput(value), this.#sliderIncrement)
    }

    observeItemsContainer() {
      if (this.itemsContainer) {
        const observer = new MutationObserver(this.filterItems.bind(this));
        observer.observe(this.itemsContainer, { childList: true });
      }
    }

    formatInputFieldValue(value) {
        return value + ' %'
    }
  }

const filterConstantsAlza = {
    itemsContainerSelector: '.browsingitemcontainer',
    filtersContainerSelector: '#parametrization > div.basic-filters',
    itemDiscountValueExtractor: (item) => {
        const discountElement = item.querySelector('.price-box__header-text');
        if (!discountElement) {
          return null;
        }
        return parseInt(discountElement.textContent.split('-')[1], 10);
      }
}

const discountFilter = new DiscountFilter(
    targetDiscount=0,
    itemsContainerSelector=filterConstantsAlza.itemsContainerSelector,
    filtersContainer=filterConstantsAlza.filtersContainerSelector,
    discountValueExtractor=filterConstantsAlza.itemDiscountValueExtractor
);
discountFilter.setupFilter();