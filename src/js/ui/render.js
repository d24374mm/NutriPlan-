class UIComponents {
  // Category Card
  createCategoryCard(category) {
    const colors = [
      'from-emerald-400 to-green-500',
      'from-blue-400 to-blue-500',
      'from-purple-500 to-pink-500',
      'from-orange-400 to-orange-500',
      'from-red-400 to-red-500',
      'from-teal-400 to-teal-500',
      'from-amber-400 to-amber-500',
      'from-lime-400 to-lime-500',
      'from-cyan-400 to-cyan-500',
      'from-rose-400 to-rose-500'
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    return `
      <div class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group"
           data-category="${category.strCategory}">
        <div class="flex items-center gap-2.5">
          <div class="text-white w-9 h-9 bg-gradient-to-br ${randomColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <i class="fa-solid fa-drumstick-bite"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">${category.strCategory}</h3>
          </div>
        </div>
      </div>
    `;
  }

  // Recipe Card
  createRecipeCard(meal) {
    return `
      <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group relative"
           data-meal-id="${meal.idMeal}">
        <!-- Quick Log Button -->
        <button class="quick-log-meal-btn absolute top-3 right-3 z-10 w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                data-meal-id="${meal.idMeal}"
                title="Quick add to food log">
          <i class="fa-solid fa-plus"></i>
        </button>
        
        <div class="relative h-48 overflow-hidden cursor-pointer" data-action="view-details">
          <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
               src="${meal.strMealThumb}"
               alt="${meal.strMeal}"
               loading="lazy" />
          <div class="absolute bottom-3 left-3 flex gap-2">
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
              ${meal.strCategory || 'Unknown'}
            </span>
            <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">
              ${meal.strArea || 'Unknown'}
            </span>
          </div>
        </div>
        <div class="p-4 cursor-pointer" data-action="view-details">
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
            ${meal.strMeal}
          </h3>
          <p class="text-xs text-gray-600 mb-3 line-clamp-2">
            Delicious recipe to try!
          </p>
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-900">
              <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
              ${meal.strCategory || 'Unknown'}
            </span>
            <span class="font-semibold text-gray-500">
              <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
              ${meal.strArea || 'Unknown'}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  // Product Card
  createProductCard(product) {
    const nutriments = product.nutriments || {};
    const nutriScore = product.nutriscore_grade ? product.nutriscore_grade.toUpperCase() : 'N/A';
    const novaGroup = product.nova_group || 'N/A';
    
    const nutriScoreColors = {
      'A': 'bg-green-500',
      'B': 'bg-lime-500',
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'E': 'bg-red-500',
      'N/A': 'bg-gray-400'
    };

    return `
      <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
           data-barcode="${product.code}">
        <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
               src="${product.image_url || product.image_front_url || 'https://via.placeholder.com/150'}"
               alt="${product.product_name || 'Product'}"
               loading="lazy" />
          <div class="absolute top-2 left-2 ${nutriScoreColors[nutriScore]} text-white text-xs font-bold px-2 py-1 rounded uppercase">
            Nutri-Score ${nutriScore}
          </div>
          ${novaGroup !== 'N/A' ? `
          <div class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
               title="NOVA ${novaGroup}">
            ${novaGroup}
          </div>` : ''}
        </div>
        <div class="p-4">
          <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">
            ${product.brands || 'Unknown Brand'}
          </p>
          <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            ${product.product_name || 'Unknown Product'}
          </h3>
          <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span><i class="fa-solid fa-weight-scale mr-1"></i>${product.quantity || 'N/A'}</span>
            <span><i class="fa-solid fa-fire mr-1"></i>${nutriments['energy-kcal_100g'] || 0} kcal/100g</span>
          </div>
          <div class="grid grid-cols-4 gap-1 text-center">
            <div class="bg-emerald-50 rounded p-1.5">
              <p class="text-xs font-bold text-emerald-700">${(nutriments.proteins_100g || 0).toFixed(1)}g</p>
              <p class="text-[10px] text-gray-500">Protein</p>
            </div>
            <div class="bg-blue-50 rounded p-1.5">
              <p class="text-xs font-bold text-blue-700">${(nutriments.carbohydrates_100g || 0).toFixed(1)}g</p>
              <p class="text-[10px] text-gray-500">Carbs</p>
            </div>
            <div class="bg-purple-50 rounded p-1.5">
              <p class="text-xs font-bold text-purple-700">${(nutriments.fat_100g || 0).toFixed(1)}g</p>
              <p class="text-[10px] text-gray-500">Fat</p>
            </div>
            <div class="bg-orange-50 rounded p-1.5">
              <p class="text-xs font-bold text-orange-700">${(nutriments.sugars_100g || 0).toFixed(1)}g</p>
              <p class="text-[10px] text-gray-500">Sugar</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Food Log Item
  createFoodLogItem(item) {
    return `
      <div class="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 transition-all group">
        <div class="flex items-center gap-4">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover" />
          <div>
            <h4 class="font-bold text-gray-900">${item.name}</h4>
            <p class="text-sm text-gray-600">${item.calories} calories</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-xs text-gray-500">${new Date(item.timestamp).toLocaleTimeString()}</p>
            <div class="flex gap-2 mt-1">
              <span class="text-xs text-emerald-600">P: ${item.protein}g</span>
              <span class="text-xs text-blue-600">C: ${item.carbs}g</span>
              <span class="text-xs text-purple-600">F: ${item.fat}g</span>
            </div>
          </div>
          <button class="delete-log-item-btn w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  data-timestamp="${item.timestamp}"
                  title="Delete this item">
            <i class="fa-solid fa-trash text-sm"></i>
          </button>
        </div>
      </div>
    `;
  }

  // Skeleton Loader
  createSkeletonCard() {
    return `
      <div class="bg-white rounded-xl overflow-hidden shadow-sm">
        <div class="h-48 bg-gray-200 skeleton"></div>
        <div class="p-4 space-y-3">
          <div class="h-4 bg-gray-200 rounded skeleton"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3 skeleton"></div>
        </div>
      </div>
    `;
  }

  // Empty State
  createEmptyState(message, icon = 'fa-utensils') {
    return `
      <div class="text-center py-12 text-gray-500 col-span-full">
        <i class="fa-solid ${icon} text-5xl mb-4 text-gray-300"></i>
        <p class="font-medium text-lg">${message}</p>
      </div>
    `;
  }
}

export default UIComponents;