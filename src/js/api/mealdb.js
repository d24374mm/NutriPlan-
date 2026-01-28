class MealDBAPI {
  constructor() {
    this.baseURL = 'https://www.themealdb.com/api/json/v1/1';
  }

  async fetchData(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  async getCategories() {
    return await this.fetchData('/categories.php');
  }

  async searchMeals(query) {
    return await this.fetchData(`/search.php?s=${query}`);
  }

  async getMealById(id) {
    return await this.fetchData(`/lookup.php?i=${id}`);
  }

  async filterByCategory(category) {
    return await this.fetchData(`/filter.php?c=${category}`);
  }

  async filterByArea(area) {
    return await this.fetchData(`/filter.php?a=${area}`);
  }

  async getRandomMeal() {
    return await this.fetchData('/random.php');
  }

  async getMultipleMeals(count = 25) {
    const meals = [];
    const promises = [];
    
    for (let i = 0; i < count; i++) {
      promises.push(this.getRandomMeal());
    }
    
    const results = await Promise.all(promises);
    results.forEach(result => {
      if (result.meals) meals.push(result.meals[0]);
    });
    
    return meals;
  }


 async getAllAreas() {
  return await this.fetchData('/list.php?a=list');
}



}

// OpenFoodFacts API
class OpenFoodFactsAPI {
  constructor() {
    this.baseURL = 'https://world.openfoodfacts.org/api/v2';
  }

  async fetchData(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  async searchProducts(query) {
    return await this.fetchData(`/search?search_terms=${query}&page_size=20&json=true`);
  }

  async getProductByBarcode(barcode) {
    return await this.fetchData(`/product/${barcode}`);
  }
}

export { MealDBAPI, OpenFoodFactsAPI };