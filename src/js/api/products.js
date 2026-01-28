// export async function searchProducts(query) {
//   const res = await fetch(
//     `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&json=true`
//   );
//   return (await res.json()).products.slice(0, 12);
// }

// export async function getProductByBarcode(barcode) {
//   const res = await fetch(
//     `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
//   );
//   return (await res.json()).product;
// }
