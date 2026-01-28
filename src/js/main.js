import { MealDBAPI, OpenFoodFactsAPI } from './api/mealdb.js';
import AppState from './state/appState.js';
import UIComponents from './ui/render.js';

class NutriPlanApp {
  constructor() {
    this.mealAPI = new MealDBAPI();
    this.productAPI = new OpenFoodFactsAPI();
    this.state = new AppState();
    this.ui = new UIComponents();
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadInitialData();
    this.checkURLParams();
    this.hideLoadingOverlay();
  }

  async loadInitialData() {
    try {
      // Load categories
      const categoriesData = await this.mealAPI.getCategories();
      this.state.setCategories(categoriesData.categories);
      this.renderCategories();

       // Load areas
        this.renderAreaButtons();

      // Load meals
      const meals = await this.mealAPI.getMultipleMeals(25);
      this.state.setMeals(meals);
      this.renderMeals();
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load data. Please refresh the page.'
      });
    }
  }

  setupEventListeners() {
    // Sidebar Navigation
    document.querySelectorAll('.nav-link').forEach((link, index) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pages = ['meals', 'products', 'foodlog'];
        this.navigateToPage(pages[index]);
      });
    });

    // Search
    document.getElementById('search-input')?.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    // Category filters
    document.getElementById('categories-grid')?.addEventListener('click', (e) => {
      const card = e.target.closest('.category-card');
      if (card) {
        const category = card.dataset.category;
        this.filterByCategory(category);
      }
    });
     
  //    document.getElementById('categories-grid')?.addEventListener('click', (e) => {
  //   const btn = e.target.closest('.area-btn');
  //   if (btn) {
  //     const area = btn.dataset.area;
      
  //     // Update active button
  //     document.querySelectorAll('.area-btn').forEach(b => {
  //       b.classList.remove('bg-emerald-600', 'text-white');
  //       b.classList.add('bg-gray-100', 'text-gray-700');
  //     });
      
  //     btn.classList.remove('bg-gray-100', 'text-gray-700');
  //     btn.classList.add('bg-emerald-600', 'text-white');
      
  //     this.filterByArea(area);
  //   }
  // });

    // Recipe cards - Updated to handle both view details and quick log
    document.getElementById('recipes-grid')?.addEventListener('click', (e) => {
      const quickLogBtn = e.target.closest('.quick-log-meal-btn');
      if (quickLogBtn) {
        e.stopPropagation();
        const mealId = quickLogBtn.dataset.mealId;
        this.quickLogMeal(mealId);
        return;
      }

      const card = e.target.closest('.recipe-card');
      if (card && e.target.closest('[data-action="view-details"]')) {
        const mealId = card.dataset.mealId;
        this.showMealDetails(mealId);
      }
    });

    // Back button
    document.getElementById('back-to-meals-btn')?.addEventListener('click', () => {
      this.hideMealDetails();
    });

    // Log meal button
    document.getElementById('log-meal-btn')?.addEventListener('click', () => {
      this.logCurrentMeal();
    });

    // Product search
    document.getElementById('search-product-btn')?.addEventListener('click', () => {
      this.searchProducts();
    });

    document.getElementById('product-search-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.searchProducts();
    });

    // Barcode lookup
    document.getElementById('lookup-barcode-btn')?.addEventListener('click', () => {
      this.lookupBarcode();
    });

    document.getElementById('barcode-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.lookupBarcode();
    });

    // Nutri-score filters
    document.querySelectorAll('.nutri-score-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterProductsByNutriScore(e.target.dataset.grade);
        
        // Update active state
        document.querySelectorAll('.nutri-score-filter').forEach(b => {
          b.classList.remove('bg-emerald-600', 'text-white');
        });
        e.target.classList.add('bg-emerald-600', 'text-white');
      });
    });

    // Clear food log
    document.getElementById('clear-foodlog')?.addEventListener('click', () => {
      this.clearFoodLog();
    });

    // Delete individual log items - Event delegation
    document.getElementById('logged-items-list')?.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-log-item-btn');
      if (deleteBtn) {
        const timestamp = parseInt(deleteBtn.dataset.timestamp);
        this.deleteLogItem(timestamp);
      }
    });

    // Sidebar toggle (mobile)
    document.getElementById('header-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.add('open');
      document.getElementById('sidebar-overlay')?.classList.add('active');
    });

    document.getElementById('sidebar-close-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('sidebar-overlay')?.classList.remove('active');
    });

    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('sidebar-overlay')?.classList.remove('active');
    });

    // Quick action buttons
    document.querySelectorAll('.quick-log-btn').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        if (index === 0) this.navigateToPage('meals');
        if (index === 1) this.navigateToPage('products');
      });
    });
  }

  // Navigation
  navigateToPage(page) {
    this.state.setCurrentPage(page);
    
    // Hide all sections
    document.getElementById('search-filters-section').style.display = 'none';
    document.getElementById('meal-categories-section').style.display = 'none';
    document.getElementById('all-recipes-section').style.display = 'none';
    document.getElementById('meal-details').style.display = 'none';
    document.getElementById('products-section').style.display = 'none';
    document.getElementById('foodlog-section').style.display = 'none';

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('bg-emerald-50', 'text-emerald-700');
      link.classList.add('text-gray-600', 'hover:bg-gray-50');
    });

    // Show selected page
    if (page === 'meals') {
      document.getElementById('search-filters-section').style.display = '';
      document.getElementById('meal-categories-section').style.display = '';
      document.getElementById('all-recipes-section').style.display = '';
      document.querySelectorAll('.nav-link')[0].classList.add('bg-emerald-50', 'text-emerald-700');
      document.querySelectorAll('.nav-link')[0].classList.remove('text-gray-600', 'hover:bg-gray-50');
      document.querySelector('#header h1').textContent = 'Meals & Recipes';
      document.querySelector('#header p').textContent = 'Discover delicious and nutritious recipes tailored for you';
    } else if (page === 'products') {
      document.getElementById('products-section').style.display = '';
      document.querySelectorAll('.nav-link')[1].classList.add('bg-emerald-50', 'text-emerald-700');
      document.querySelectorAll('.nav-link')[1].classList.remove('text-gray-600', 'hover:bg-gray-50');
      document.querySelector('#header h1').textContent = 'Product Scanner';
      document.querySelector('#header p').textContent = 'Search for packaged food products to view nutrition information';
    } else if (page === 'foodlog') {
      document.getElementById('foodlog-section').style.display = '';
      document.querySelectorAll('.nav-link')[2].classList.add('bg-emerald-50', 'text-emerald-700');
      document.querySelectorAll('.nav-link')[2].classList.remove('text-gray-600', 'hover:bg-gray-50');
      document.querySelector('#header h1').textContent = 'Daily Food Log';
      document.querySelector('#header p').textContent = 'Track and monitor your daily nutrition intake';
      this.updateFoodLog();
    }
  }

  checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page) {
      this.navigateToPage(page);
    }
  }

  // Meals
  renderCategories() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    grid.innerHTML = this.state.categories
      .slice(0, 12)
      .map(cat => this.ui.createCategoryCard(cat))
      .join('');
  }



  renderMeals() {
    const grid = document.getElementById('recipes-grid');
    const count = document.getElementById('recipes-count');
    
    if (!grid) return;

    if (this.state.filteredMeals.length === 0) {
      grid.innerHTML = this.ui.createEmptyState('No recipes found');
      if (count) count.textContent = 'No recipes found';
      return;
    }

    grid.innerHTML = this.state.filteredMeals
      .map(meal => this.ui.createRecipeCard(meal))
      .join('');
    
    if (count) {
      count.textContent = `Showing ${this.state.filteredMeals.length} recipes`;
    }
  }

  handleSearch(query) {
    this.state.searchMeals(query);
    this.renderMeals();
  }

  async filterByCategory(category) {
    try {
      const data = await this.mealAPI.filterByCategory(category);
      if (data.meals) {
        this.state.setMeals(data.meals);
        this.renderMeals();
      }
    } catch (error) {
      console.error('Error filtering by category:', error);
    }
  }

  // Quick Log Meal 
  async quickLogMeal(mealId) {
    try {
      const data = await this.mealAPI.getMealById(mealId);
      if (data.meals && data.meals[0]) {
        const meal = data.meals[0];
        const nutrition = this.estimateNutrition(meal);
        
        this.state.addToFoodLog({
          id: meal.idMeal,
          name: meal.strMeal,
          image: meal.strMealThumb,
          type: 'meal',
          ...nutrition
        });

        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: `${meal.strMeal} added to your food log`,
          timer: 1500,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      }
    } catch (error) {
      console.error('Error quick logging meal:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to log meal',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  async showMealDetails(mealId) {
    try {
      const data = await this.mealAPI.getMealById(mealId);
      if (data.meals && data.meals[0]) {
        const meal = data.meals[0];
        this.state.setSelectedMeal(meal);
        this.renderMealDetails(meal);
        
        // Hide recipe list, show details
        document.getElementById('search-filters-section').style.display = 'none';
        document.getElementById('meal-categories-section').style.display = 'none';
        document.getElementById('all-recipes-section').style.display = 'none';
        document.getElementById('meal-details').style.display = '';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error loading meal details:', error);
    }
  }

  renderMealDetails(meal) {
    // Update hero image and title
    document.querySelector('#meal-details img').src = meal.strMealThumb;
    document.querySelector('#meal-details h1').textContent = meal.strMeal;
    
    // Update badges
    const badges = document.querySelectorAll('#meal-details .absolute.bottom-0 span');
    if (badges.length >= 3) {
      badges[0].textContent = meal.strCategory;
      badges[1].textContent = meal.strArea;
      badges[2].textContent = 'Main Course';
    }

    // Render ingredients
    const ingredients = this.getIngredients(meal);
    const ingredientsContainer = document.querySelector('#meal-details .grid.grid-cols-1.md\\:grid-cols-2');
    if (ingredientsContainer) {
      ingredientsContainer.innerHTML = ingredients.map(ing => `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
          <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
          <span class="text-gray-700">
            <span class="font-medium text-gray-900">${ing.measure}</span> ${ing.ingredient}
          </span>
        </div>
      `).join('');
    }

    // Render instructions
    const instructions = meal.strInstructions.split('\n').filter(i => i.trim());
    const instructionsContainer = document.querySelector('#meal-details .space-y-4');
    if (instructionsContainer) {
      instructionsContainer.innerHTML = instructions.map((inst, idx) => `
        <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
            ${idx + 1}
          </div>
          <p class="text-gray-700 leading-relaxed pt-2">${inst}</p>
        </div>
      `).join('');
    }

    // Update video
    if (meal.strYoutube) {
      const videoId = meal.strYoutube.split('v=')[1];
      document.querySelector('#meal-details iframe').src = `https://www.youtube.com/embed/${videoId}`;
    }

    // Calculate and display nutrition (estimated)
    const nutrition = this.estimateNutrition(meal);
    this.renderNutrition(nutrition);
    
    // Update log button
    document.getElementById('log-meal-btn').dataset.mealId = meal.idMeal;
  }

  getIngredients(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({ ingredient, measure });
      }
    }
    return ingredients;
  }

  estimateNutrition(meal) {
    // Simplified nutrition estimation based on category
    const baseNutrition = {
      'Chicken': { calories: 485, protein: 42, carbs: 52, fat: 8, fiber: 4, sugar: 12 },
      'Beef': { calories: 520, protein: 38, carbs: 45, fat: 18, fiber: 3, sugar: 8 },
      'Seafood': { calories: 380, protein: 35, carbs: 48, fat: 6, fiber: 2, sugar: 10 },
      'Pasta': { calories: 450, protein: 15, carbs: 75, fat: 10, fiber: 5, sugar: 6 },
      'Vegetarian': { calories: 320, protein: 12, carbs: 58, fat: 8, fiber: 8, sugar: 12 },
      'Default': { calories: 400, protein: 25, carbs: 50, fat: 12, fiber: 4, sugar: 10 }
    };

    return baseNutrition[meal.strCategory] || baseNutrition['Default'];
  }

  renderNutrition(nutrition) {
    // Update calories
    document.querySelector('#meal-details .text-4xl').textContent = nutrition.calories;
    
    // Update macro bars
    const macros = [
      { name: 'Protein', value: nutrition.protein, color: 'emerald' },
      { name: 'Carbs', value: nutrition.carbs, color: 'blue' },
      { name: 'Fat', value: nutrition.fat, color: 'purple' },
      { name: 'Fiber', value: nutrition.fiber, color: 'orange' },
      { name: 'Sugar', value: nutrition.sugar, color: 'pink' }
    ];

    const container = document.querySelector('#nutrition-facts-container .space-y-4');
    if (container) {
      container.innerHTML = macros.map(macro => `
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-${macro.color}-500"></div>
              <span class="text-gray-700">${macro.name}</span>
            </div>
            <span class="font-bold text-gray-900">${macro.value}g</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div class="bg-${macro.color}-500 h-2 rounded-full" style="width: ${(macro.value / 100) * 100}%"></div>
          </div>
        </div>
      `).join('');
    }
  }

  hideMealDetails() {
    document.getElementById('search-filters-section').style.display = '';
    document.getElementById('meal-categories-section').style.display = '';
    document.getElementById('all-recipes-section').style.display = '';
    document.getElementById('meal-details').style.display = 'none';
  }

  logCurrentMeal() {
    const meal = this.state.selectedMeal;
    if (!meal) return;

    const nutrition = this.estimateNutrition(meal);
    
    this.state.addToFoodLog({
      id: meal.idMeal,
      name: meal.strMeal,
      image: meal.strMealThumb,
      type: 'meal',
      ...nutrition
    });

    Swal.fire({
      icon: 'success',
      title: 'Meal Logged!',
      text: `${meal.strMeal} has been added to your food log`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  // Products
  async searchProducts() {
    const query = document.getElementById('product-search-input').value.trim();
    if (!query) return;

    try {
      const data = await this.productAPI.searchProducts(query);
      if (data.products) {
        this.state.setProducts(data.products);
        this.renderProducts(data.products);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to search products'
      });
    }
  }

  async lookupBarcode() {
    const barcode = document.getElementById('barcode-input').value.trim();
    if (!barcode) return;

    try {
      const data = await this.productAPI.getProductByBarcode(barcode);
      if (data.product) {
        this.renderProducts([data.product]);
        document.getElementById('products-count').textContent = '1 product found';
      }
    } catch (error) {
      console.error('Error looking up barcode:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Product not found'
      });
    }
  }



  renderProducts(products) {
    const grid = document.getElementById('products-grid');
    const count = document.getElementById('products-count');

    if (!grid) return;

    if (products.length === 0) {
      grid.innerHTML = this.ui.createEmptyState('No products found', 'fa-barcode');
      if (count) count.textContent = 'No products found';
      return;
    }

    grid.innerHTML = products
      .map(product => this.ui.createProductCard(product))
      .join('');
    
    if (count) {
      count.textContent = `${products.length} products found`;
    }

    // Add click handlers for logging
    grid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const barcode = card.dataset.barcode;
        this.logProduct(products.find(p => p.code === barcode));
      });
    });
  }

  // area function
   
renderAreaButtons() {
  // Find the container after search input
  const searchSection = document.getElementById('search-filters-section');
  if (!searchSection) return;

  // Check if buttons already exist
  let buttonsContainer = searchSection.querySelector('.area-buttons-row');
  
  if (!buttonsContainer) {
    // Create container after search input
    const searchDiv = searchSection.querySelector('.mb-6');
    
    buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'area-buttons-row flex items-center gap-3 overflow-x-auto pb-2';
    
    // Insert after search
    searchDiv.parentNode.insertBefore(buttonsContainer, searchDiv.nextSibling);
  }

  // All areas with flags
  const areas = [
    { name: 'All Recipes', value: '' },
    { name: 'American', value: 'American' },
    { name: 'British', value: 'British'},
    { name: 'Canadian', value: 'Canadian' },
    { name: 'Chinese', value: 'Chinese'},
    { name: 'Croatian', value: 'Croatian'},
    { name: 'Dutch', value: 'Dutch'},
    { name: 'Egyptian', value: 'Egyptian'},
    { name: 'French', value: 'French'},
    { name: 'Greek', value: 'Greek'},
    { name: 'Indian', value: 'Indian'},
    { name: 'Irish', value: 'Irish'},
    { name: 'Italian', value: 'Italian' },
    { name: 'Jamaican', value: 'Jamaican'},
    { name: 'Japanese', value: 'Japanese'},
    { name: 'Kenyan', value: 'Kenyan'},
    { name: 'Malaysian', value: 'Malaysian'},
    { name: 'Mexican', value: 'Mexican'},
    { name: 'Moroccan', value: 'Moroccan'},
    { name: 'Polish', value: 'Polish'},
    { name: 'Portuguese', value: 'Portuguese'},
    { name: 'Russian', value: 'Russian'},
    { name: 'Spanish', value: 'Spanish'},
    { name: 'Thai', value: 'Thai'},
    { name: 'Tunisian', value: 'Tunisian'},
    { name: 'Turkish', value: 'Turkish'},
    { name: 'Ukrainian', value: 'Ukrainian'},
    { name: 'Vietnamese', value: 'Vietnamese'}
  ];

  // Create buttons HTML
  buttonsContainer.innerHTML = areas.map((area, index) => {
    const isActive = index === 0; // First button (All Recipes) is active by default
    const activeClass = isActive 
      ? 'bg-emerald-600 text-white' 
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    
    return `
      <button class="area-filter-btn px-4 py-2 ${activeClass} rounded-full font-medium text-sm whitespace-nowrap transition-all"
              data-area="${area.value}">
        ${area.flag ? area.flag + ' ' : ''}${area.name}
      </button>
    `;
  }).join('');

  // Add click event listeners
  buttonsContainer.querySelectorAll('.area-filter-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const clickedBtn = e.target;
      const area = clickedBtn.dataset.area;
      
      // Update active state
      buttonsContainer.querySelectorAll('.area-filter-btn').forEach(b => {
        b.classList.remove('bg-emerald-600', 'text-white');
        b.classList.add('bg-gray-100', 'text-gray-700');
      });
      
      clickedBtn.classList.remove('bg-gray-100', 'text-gray-700');
      clickedBtn.classList.add('bg-emerald-600', 'text-white');
      
      // Filter meals
      await this.filterByArea(area);
    });
  });

  console.log(' Area buttons rendered:', areas.length);
}
  
 async filterByArea(area) {
  try {
    const grid = document.getElementById('recipes-grid');
    const count = document.getElementById('recipes-count');
    
    // Show loading
    if (grid) {
      grid.innerHTML = Array(8).fill(0).map(() => this.ui.createSkeletonCard()).join('');
    }
    if (count) {
      count.textContent = 'Loading...';
    }

    let meals;
    
    if (!area || area === '') {
      // Load random meals for "All Recipes"
      meals = await this.mealAPI.getMultipleMeals(25);
    } else {
      // Load meals by area
      const data = await this.mealAPI.filterByArea(area);
      meals = data.meals || [];
    }
    
    this.state.setMeals(meals);
    this.renderMeals();
    
    console.log(` Loaded ${meals.length} ${area || 'all'} recipes`);
    
  } catch (error) {
    console.error('Error filtering by area:', error);
    
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Failed to load recipes. Please try again.',
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false
    });
    
    // Fallback to random meals
    const meals = await this.mealAPI.getMultipleMeals(25);
    this.state.setMeals(meals);
    this.renderMeals();
  }
 


}

  filterProductsByNutriScore(grade) {
    if (!grade) {
      this.renderProducts(this.state.products);
      return;
    }

    const filtered = this.state.products.filter(p => 
      p.nutriscore_grade && p.nutriscore_grade.toLowerCase() === grade.toLowerCase()
    );
    
    this.renderProducts(filtered);
  }

  logProduct(product) {
    if (!product) return;

    const nutriments = product.nutriments || {};
    
    Swal.fire({
      title: 'Log Product',
      text: `How many servings of ${product.product_name}?`,
      input: 'number',
      inputValue: 1,
      inputAttributes: {
        min: 0.1,
        step: 0.1
      },
      showCancelButton: true,
      confirmButtonText: 'Log',
      confirmButtonColor: '#10b981'
    }).then((result) => {
      if (result.isConfirmed) {
        const servings = parseFloat(result.value) || 1;
        
        this.state.addToFoodLog({
          id: product.code,
          name: product.product_name,
          image: product.image_url || product.image_front_url,
          type: 'product',
          calories: (nutriments['energy-kcal_100g'] || 0) * servings,
          protein: (nutriments.proteins_100g || 0) * servings,
          carbs: (nutriments.carbohydrates_100g || 0) * servings,
          fat: (nutriments.fat_100g || 0) * servings
        });

        Swal.fire({
          icon: 'success',
          title: 'Product Logged!',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // Food Log
  // updateFoodLog() {
  //   const todayLog = this.state.getTodayLog();
  //   const totals = this.state.getTodayTotals();
  //   const goals = this.state.dailyGoals;

  //   // Update date
  //   document.getElementById('foodlog-date').textContent = 
  //     new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  //   // Update progress bars
  //   this.updateProgressBar('calories', totals.calories, goals.calories);
  //   this.updateProgressBar('protein', totals.protein, goals.protein);
  //   this.updateProgressBar('carbs', totals.carbs, goals.carbs);
  //   this.updateProgressBar('fat', totals.fat, goals.fat);

  //   // Update logged items
  //   const list = document.getElementById('logged-items-list');
  //   if (!list) return;

  //   if (todayLog.length === 0) {
  //     list.innerHTML = `
  //       <div class="text-center py-8 text-gray-500">
  //         <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
  //         <p class="font-medium">No meals logged today</p>
  //         <p class="text-sm">Add meals from the Meals page or scan products</p>
  //       </div>
  //     `;
  //     document.getElementById('clear-foodlog').style.display = 'none';
  //   } else {
  //     list.innerHTML = todayLog.map(item => this.ui.createFoodLogItem(item)).join('');
  //     document.getElementById('clear-foodlog').style.display = '';
  //   }

  //   // Update weekly chart
  //   this.renderWeeklyChart();
  // }

  // updateFoodLog function 

updateFoodLog() {
  console.log(' Updating Food Log...');
  
  const todayLog = this.state.getTodayLog();
  const totals = this.state.getTodayTotals();
  const goals = this.state.dailyGoals;

  console.log('Today Log Items:', todayLog.length);
  console.log('Totals:', totals);
  console.log('Goals:', goals);

  // Update date
  document.getElementById('foodlog-date').textContent = 
    new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // Update progress bars with proper values
  this.updateProgressBar('calories', totals.calories, goals.calories);
  this.updateProgressBar('protein', totals.protein, goals.protein);
  this.updateProgressBar('carbs', totals.carbs, goals.carbs);
  this.updateProgressBar('fat', totals.fat, goals.fat);

  // Update logged items count
  const loggedItemsTitle = document.querySelector('#foodlog-today-section h4');
  if (loggedItemsTitle) {
    loggedItemsTitle.textContent = `Logged Items (${todayLog.length})`;
  }

  // Update logged items list
  const list = document.getElementById('logged-items-list');
  if (!list) {
    console.error(' logged-items-list element not found!');
    return;
  }

  if (todayLog.length === 0) {
    list.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
        <p class="font-medium">No meals logged today</p>
        <p class="text-sm">Add meals from the Meals page or scan products</p>
      </div>
    `;
    document.getElementById('clear-foodlog').style.display = 'none';
  } else {
    list.innerHTML = todayLog.map(item => this.ui.createFoodLogItem(item)).join('');
    document.getElementById('clear-foodlog').style.display = '';
  }

  // Update weekly chart
  this.renderWeeklyChart();
  
  console.log(' Food Log updated successfully');
}

// Also update the progress bar function
updateProgressBar(type, current, goal) {
  const section = document.getElementById('foodlog-today-section');
  if (!section) {
    console.error(' foodlog-today-section not found!');
    return;
  }

  const bars = section.querySelectorAll('.bg-emerald-50, .bg-blue-50, .bg-amber-50, .bg-purple-50');
  let bar;
  
  if (type === 'calories') bar = bars[0];
  else if (type === 'protein') bar = bars[1];
  else if (type === 'carbs') bar = bars[2];
  else if (type === 'fat') bar = bars[3];

  if (!bar) {
    console.error(`Progress bar for ${type} not found!`);
    return;
  }

  const percentage = Math.min((current / goal) * 100, 100);
  const text = bar.querySelector('.text-gray-500');
  const progressBar = bar.querySelector('.h-2\\.5');
  
  // Format the display value
  const displayValue = type === 'calories' 
    ? Math.round(current) 
    : current.toFixed(1);
  
  const unit = type === 'calories' ? 'kcal' : 'g';
  
  if (text) {
    text.textContent = `${displayValue} / ${goal} ${unit}`;
  } else {
    console.error(` Text element not found for ${type}`);
  }
  
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
  } else {
    console.error(` Progress bar element not found for ${type}`);
  }
  
  console.log(` ${type}: ${displayValue}/${goal} (${percentage.toFixed(1)}%)`);
}

  updateProgressBar(type, current, goal) {
    const section = document.getElementById('foodlog-today-section');
    if (!section) return;

    const bars = section.querySelectorAll('.bg-emerald-50, .bg-blue-50, .bg-amber-50, .bg-purple-50');
    let bar;
    
    if (type === 'calories') bar = bars[0];
    else if (type === 'protein') bar = bars[1];
    else if (type === 'carbs') bar = bars[2];
    else if (type === 'fat') bar = bars[3];

    if (bar) {
      const percentage = Math.min((current / goal) * 100, 100);
      const text = bar.querySelector('.text-gray-500');
      const progressBar = bar.querySelector('.h-2\\.5');
      
      if (text) text.textContent = `${Math.round(current)} / ${goal} ${type === 'calories' ? 'kcal' : 'g'}`;
      if (progressBar) progressBar.style.width = `${percentage}%`;
    }
  }

  renderWeeklyChart() {
    const weekData = this.state.getWeeklyData();
    
    const trace = {
      x: weekData.map(d => d.day),
      y: weekData.map(d => d.calories),
      type: 'bar',
      marker: {
        color: '#10b981'
      }
    };

    const layout = {
      title: 'Weekly Calorie Intake',
      xaxis: { title: 'Day' },
      yaxis: { title: 'Calories' },
      margin: { t: 40, r: 20, b: 40, l: 50 }
    };

    Plotly.newPlot('weekly-chart', [trace], layout, { responsive: true });
  }

  // Delete individual log item - NEW FUNCTION
  deleteLogItem(timestamp) {
    Swal.fire({
      title: 'Delete this item?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.state.deleteLogItem(timestamp);
        // this.storageService.remove(timestamp); 
        this.updateFoodLog();
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          timer: 1500,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      }
    });
  }

  clearFoodLog() {
    Swal.fire({
      title: 'Clear All Logs?',
      text: 'This will remove all logged items permanently',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, clear all'
    }).then((result) => {
      if (result.isConfirmed) {
        this.state.clearFoodLog();
        this.updateFoodLog();
        Swal.fire({
          icon: 'success',
          title: 'Cleared!',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById('app-loading-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 500);
    }
  }
}

// Initialize app
const app = new NutriPlanApp();
console.log(app.state.areas);