class AppState {
  constructor() {
    this.currentPage = 'meals';
    this.meals = [];
    this.categories = [];
    this.areas = [];
    this.selectedMeal = null;
    this.filteredMeals = [];
    this.products = [];
    this.foodLog = this.loadFoodLog();
    this.dailyGoals = {
      calories: 2000,
      protein: 50,
      carbs: 250,
      fat: 65
    };
  }

  // Meals
  setMeals(meals) {
    this.meals = meals;
    this.filteredMeals = meals;
  }

  setCategories(categories) {
    this.categories = categories;
  }

  setSelectedMeal(meal) {
    this.selectedMeal = meal;
  }

  filterMealsByCategory(category) {
    if (!category) {
      this.filteredMeals = this.meals;
    } else {
      this.filteredMeals = this.meals.filter(meal => 
        meal.strCategory === category
      );
    }
  }

  setAreas(areas) {
  this.areas = areas;
}


  filterMealsByArea(area) {
    if (!area) {
      this.filteredMeals = this.meals;
    } else {
      this.filteredMeals = this.meals.filter(meal => 
        meal.strArea === area
      );
    }
  }


  searchMeals(query) {
    if (!query) {
      this.filteredMeals = this.meals;
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredMeals = this.meals.filter(meal =>
        meal.strMeal.toLowerCase().includes(lowerQuery) ||
        meal.strCategory.toLowerCase().includes(lowerQuery) ||
        meal.strArea.toLowerCase().includes(lowerQuery)
      );
    }
  }

  // Products
  setProducts(products) {
    this.products = products;
  }

  // Food Log
  loadFoodLog() {
    const saved = localStorage.getItem('foodLog');
    return saved ? JSON.parse(saved) : [];
  }

  saveFoodLog() {
    localStorage.setItem('foodLog', JSON.stringify(this.foodLog));
  }

  addToFoodLog(item) {
    const today = new Date().toDateString();
    const logItem = {
      ...item,
      date: today,
      timestamp: Date.now()
    };
    this.foodLog.push(logItem);
    this.saveFoodLog();
  }

  getTodayLog() {
    const today = new Date().toDateString();
    return this.foodLog.filter(item => item.date === today);
  }

  // getTodayTotals() {
  //   const todayItems = this.getTodayLog();
  //   return todayItems.reduce((totals, item) => ({
  //     calories: totals.calories + (item.calories || 0),
  //     protein: totals.protein + (item.protein || 0),
  //     carbs: totals.carbs + (item.carbs || 0),
  //     fat: totals.fat + (item.fat || 0)
  //   }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  // }


  // src/js/state/appState.js
// استبدل الـ getTodayTotals function بهذه النسخة المُصلحة

getTodayTotals() {
  const todayItems = this.getTodayLog();
  
  console.log(' Calculating totals for today:', todayItems.length, 'items');
  
  const totals = todayItems.reduce((acc, item) => {
    //numbers
    const calories = parseFloat(item.calories) || 0;
    const protein = parseFloat(item.protein) || 0;
    const carbs = parseFloat(item.carbs) || 0;
    const fat = parseFloat(item.fat) || 0;
    
    console.log(`  Item: ${item.name}`);
    console.log(`    Calories: ${calories}, Protein: ${protein}, Carbs: ${carbs}, Fat: ${fat}`);
    
    return {
      calories: acc.calories + calories,
      protein: acc.protein + protein,
      carbs: acc.carbs + carbs,
      fat: acc.fat + fat
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  // Round 
  const roundedTotals = {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,  // Round to 1 decimal
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10
  };
  
  console.log('Final totals:', roundedTotals);
  
  return roundedTotals;
}

  getWeeklyData() {
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dayItems = this.foodLog.filter(item => item.date === dateStr);
      const totals = dayItems.reduce((sum, item) => sum + (item.calories || 0), 0);
      
      weekData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: totals
      });
    }
    
    return weekData;
  }


    //  Delete individual log item
  deleteLogItem(timestamp) {
    this.foodLog = this.foodLog.filter(item => item.timestamp !== timestamp);
    this.saveFoodLog();
  }

  clearFoodLog() {
    this.foodLog = [];
    this.saveFoodLog();
  }

  // Navigation
  setCurrentPage(page) {
    this.currentPage = page;
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    window.history.pushState({}, '', url);
  }
}

export default AppState;
